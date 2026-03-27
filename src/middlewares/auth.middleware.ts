import type { NextFunction, Request, Response } from "express";
import prisma from "../prisma";
import { AppError } from "../utils/errors";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError(401, "Authentication required", "UNAUTHORIZED");
    }

    const token = authorization.slice(7);
    const payload = verifyAccessToken(token);

    const session = await prisma.session.findFirst({
      where: {
        id: payload.sid,
        userId: payload.sub,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new AppError(401, "Session is no longer valid", "SESSION_INVALID");
    }

    req.user = {
      id: session.user.id,
      email: session.user.email,
      username: session.user.username,
      sessionId: session.id,
    };

    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    next();
  } catch (error) {
    next(error);
  }
};
