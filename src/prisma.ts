import { PrismaClient } from "../generated/prisma/index";

declare global {
  // eslint-disable-next-line no-var
  var __blueCrabPrisma__: PrismaClient | undefined;
}

const prismaClientSingleton = () =>
  new PrismaClient({
    errorFormat: "minimal",
  });

export const prisma =
  global.__blueCrabPrisma__ ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  global.__blueCrabPrisma__ = prisma;
}

export default prisma;
