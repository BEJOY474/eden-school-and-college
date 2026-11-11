import { createPool, type Pool } from "mysql2/promise";

declare global {
  var edenContactPool: Pool | undefined;
}

export function getContactPool() {
  if (globalThis.edenContactPool) return globalThis.edenContactPool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. Set it in .env.local.");
  }

  const pool = createPool(connectionString);
  globalThis.edenContactPool = pool;
  return globalThis.edenContactPool;
}
