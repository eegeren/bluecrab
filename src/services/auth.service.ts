import prisma from "../prisma";
import { comparePassword, hashPassword } from "../utils/password";
import { AppError } from "../utils/errors";
import { signAccessToken } from "../utils/jwt";
import { createSession, revokeSession } from "./session.service";
import { createUser, findUserByEmail, findUserByUsername } from "./user.service";

type AuthContext = {
  userAgent?: string;
  ipAddress?: string | null;
};

const ensureCredentialsAreUnique = async (email: string, username: string) => {
  const [existingEmail, existingUsername] = await Promise.all([
    findUserByEmail(email),
    findUserByUsername(username),
  ]);

  if (existingEmail) {
    throw new AppError(409, "Email is already registered", "EMAIL_TAKEN");
  }

  if (existingUsername) {
    throw new AppError(409, "Username is already taken", "USERNAME_TAKEN");
  }
};

const buildAuthResponse = async (
  user: { id: string; email: string; username: string; createdAt: Date; updatedAt: Date },
  context: AuthContext,
) => {
  const session = await createSession({
    userId: user.id,
    userAgent: context.userAgent,
    ipAddress: context.ipAddress,
  });

  const accessToken = signAccessToken({
    sub: user.id,
    sid: session.id,
    email: user.email,
    username: user.username,
  });

  return {
    accessToken,
    session: {
      id: session.id,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    },
    user,
  };
};

export const register = async (
  input: { email: string; username: string; password: string },
  context: AuthContext,
) => {
  await ensureCredentialsAreUnique(input.email, input.username);

  const passwordHash = await hashPassword(input.password);
  const user = await createUser({
    email: input.email,
    username: input.username,
    passwordHash,
  });

  return buildAuthResponse(user, context);
};

export const login = async (input: { email: string; password: string }, context: AuthContext) => {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });

  if (!user) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  const passwordMatches = await comparePassword(input.password, user.passwordHash);

  if (!passwordMatches) {
    throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
  }

  return buildAuthResponse(user, context);
};

export const logout = async (sessionId: string) => {
  await revokeSession(sessionId);
};
