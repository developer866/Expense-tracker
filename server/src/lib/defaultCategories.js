// Copied into each new user's `categories` array at registration.
export const DEFAULT_CATEGORIES = [
  { name: 'Food', kind: 'expense' },
  { name: 'Transport', kind: 'expense' },
  { name: 'Data & Airtime', kind: 'expense' },
  { name: 'Bills & Utilities', kind: 'expense' },
  { name: 'Rent', kind: 'expense' },
  { name: 'Savings', kind: 'expense' },
  { name: 'Shopping', kind: 'expense' },
  { name: 'Health', kind: 'expense' },
  { name: 'Entertainment', kind: 'expense' },
  { name: 'Other', kind: 'expense' },
  { name: 'Salary', kind: 'income' },
  { name: 'Other income', kind: 'income' },
].map((c, i) => ({ ...c, sortOrder: i, isDefault: true }));
