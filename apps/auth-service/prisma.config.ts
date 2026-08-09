
import * as dotenv from "dotenv";
import { join } from "path";
dotenv.config({ path: join(__dirname, "../../.env") });

import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["AUTH_DATABASE_URL"],
  },
});
