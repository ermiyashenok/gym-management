import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  // Prisma 7: datasource takes { url, shadowDatabaseUrl } directly
  datasource: {
    url: process.env.DATABASE_URL ?? '',
  },
});
