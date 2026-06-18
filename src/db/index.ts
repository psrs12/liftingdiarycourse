import { drizzle } from 'drizzle-orm/neon-http';
import { env } from 'process';

const db = drizzle(process.env.DATABASE_URL!);
export{db}