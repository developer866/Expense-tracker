import 'dotenv/config';
import os from 'node:os';
import app from './app.js';
import { connectDb, disconnectDb } from './lib/db.js';

const PORT = Number(process.env.PORT) || 4000;



function lanUrls() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal)
    .map((i) => `http://${i.address}:${PORT}`);
}

async function main() {
  await connectDb();

  // 0.0.0.0 lets your phone reach the server over the same Wi-Fi
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`API running on http://localhost:${PORT}`);
    for (const url of lanUrls()) console.log(`  from your phone: ${url}`);
  });

  const shutdown = async () => {
    server.close();
    await disconnectDb();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((e) => {
  console.error('Failed to start:', e.message);
  process.exit(1);
});
