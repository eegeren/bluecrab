import { prisma } from "@/lib/db"

export const hasDatabaseUrl = Boolean(process.env.DATABASE_URL)
export { prisma }
