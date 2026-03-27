import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../utils/validation";
import { asyncHandler } from "../utils/async-handler";
import * as authService from "../services/auth.service";
import * as userService from "../services/user.service";

const getRequestContext = (req: Request) => ({
  userAgent: req.get("user-agent") ?? undefined,
  ipAddress: req.ip,
});

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input, getRequestContext(req));

  res.status(201).json(result);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const result = await authService.login(input, getRequestContext(req));

  res.status(200).json(result);
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  await authService.logout(req.user!.sessionId);

  res.status(200).json({
    message: "Logged out successfully",
  });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getCurrentUser(req.user!.id);

  res.status(200).json({
    user,
    sessionId: req.user!.sessionId,
  });
});
