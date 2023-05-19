import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: ["query"],
});
// Passando essa configuração, o prisma faz o log de cada query executada no DB.
