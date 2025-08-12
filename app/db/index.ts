import { drizzle } from "drizzle-orm/node-postgres";
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

export const db = drizzle(process.env.DATABASE_URL);
