import type { Session } from "../../generated/prisma/index";
import prisma from "../prisma";
import { env } from "../utils/env";

const getSessionExpiry = () => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + env.SESSION_TTL_DAYS);
  return expiresAt;
};

export const createSession = async (input: { userId: string; userAgent?: string; ipAddress?: string | null }) =>
  prisma.session.create({
    data: {
      userId: input.userId,
      userAgent: input.userAgent,
      ipAddress: input.ipAddress ?? undefined,
      expiresAt: getSessionExpiry(),
    },
  });

export const revokeSession = async (sessionId: string) =>
  prisma.session.update({
    where: { id: sessionId },
    data: { isRevoked: true },
  });

export const revokeOwnedSession = async (userId: string, sessionId: string) =>
  prisma.session.updateMany({
    where: { id: sessionId, userId },
    data: { isRevoked: true },
  });

export const listUserSessions = async (userId: string) =>
  prisma.session.findMany({
    where: {
      userId,
      expiresAt: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

export const formatSession = (session: Session, currentSessionId?: string) => ({
  id: session.id,
  userAgent: session.userAgent,
  ipAddress: session.ipAddress,
  isRevoked: session.isRevoked,
  isCurrent: session.id === currentSessionId,
  expiresAt: session.expiresAt,
  lastSeenAt: session.lastSeenAt,
  createdAt: session.createdAt,
});
