import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/async-handler";
import { AppError } from "../utils/errors";
import * as sessionService from "../services/session.service";

const sessionIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const listSessions = asyncHandler(async (req: Request, res: Response) => {
  const sessions = await sessionService.listUserSessions(req.user!.id);

  res.status(200).json({
    sessions: sessions.map((session: (typeof sessions)[number]) =>
      sessionService.formatSession(session, req.user!.sessionId),
    ),
  });
});

export const revokeSession = asyncHandler(async (req: Request, res: Response) => {
  const { id } = sessionIdParamsSchema.parse(req.params);
  const result = await sessionService.revokeOwnedSession(req.user!.id, id);

  if (result.count === 0) {
    throw new AppError(404, "Session not found", "SESSION_NOT_FOUND");
  }

  res.status(200).json({
    message: "Session revoked successfully",
  });
});
