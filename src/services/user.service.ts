import prisma from "../prisma";
import { AppError } from "../utils/errors";

const safeUserSelect = {
  id: true,
  username: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const findUserByEmail = async (email: string) =>
  prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

export const findUserByUsername = async (username: string) =>
  prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  });

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: safeUserSelect,
  });

  if (!user) {
    throw new AppError(404, "User not found", "USER_NOT_FOUND");
  }

  return user;
};

export const getCurrentUser = async (id: string) => getUserById(id);

export const createUser = async (input: { email: string; username: string; passwordHash: string }) =>
  prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      username: input.username.toLowerCase(),
      passwordHash: input.passwordHash,
    },
    select: safeUserSelect,
  });
