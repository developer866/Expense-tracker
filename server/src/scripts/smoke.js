// Run from the server folder:  node src/scripts/smoke.js
import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb, disconnectDb } from '../lib/db.js';
import { DEFAULT_CATEGORIES } from '../lib/defaultCategories.js';
import { User, Transaction, Budget } from '../models/index.js';

async function main() {
  await connectDb();

  // Make sure indexes exist before testing
  await Promise.all([User.init(), Transaction.init(), Budget.init()]);

  const user = await User.create({
    name: 'Smoke Test',
    email: `smoke_${Date.now()}@example.com`,
    passwordHash: 'not-a-real-hash',
    timezone: 'Africa/Lagos',
    categories: DEFAULT_CATEGORIES,
  });

  try {
    const transport = user.categories.find((c) => c.name === 'Transport');

    const clientId = 'smoke-client-id-1';
    await Transaction.create({
      userId: user._id,
      clientId,
      name: 'Bolt ride',
      amount: 250000, // 2,500 naira in kobo
      type: 'debit',
      categoryId: transport._id,
      occurredAt: new Date(),
    });

    // Duplicate clientId must be rejected
    let duplicateBlocked = false;
    try {
      await Transaction.create({
        userId: user._id, clientId, name: 'Bolt ride', amount: 250000,
        type: 'debit', categoryId: transport._id, occurredAt: new Date(),
      });
    } catch (e) {
      duplicateBlocked = e.code === 11000;
    }

    await Budget.create({
      userId: user._id,
      periodStart: new Date(Date.UTC(2026, 9, 1)),
      periodEnd: new Date(Date.UTC(2026, 9, 31)),
      incomeAmount: 15800000,
      items: [{ name: 'House rent', kind: 'fixed', frequency: 'yearly', sourceAmount: 25000000, plannedAmount: 2083333 }],
    });

    // Calendar-style query: totals per day in the user's timezone
    const days = await Transaction.aggregate([
      { $match: { userId: user._id, deletedAt: null } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$occurredAt', timezone: user.timezone } },
          spent: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
          entries: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const ok = duplicateBlocked && days.length === 1 && days[0].spent === 250000;
    console.log('Duplicate blocked:', duplicateBlocked);
    console.log('Day totals:', days);
    console.log(ok ? 'PASS' : 'FAIL');
  } finally {
    // MongoDB has no cascade delete: remove related data yourself
    await Transaction.deleteMany({ userId: user._id });
    await Budget.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });
    await disconnectDb();
  }
}

main().catch((e) => {
  console.error('FAIL:', e.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
