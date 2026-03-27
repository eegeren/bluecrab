import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/async-handler";
import * as userService from "../services/user.service";

const userIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getCurrentUser(req.user!.id);
  res.status(200).json({ user });
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = userIdParamsSchema.parse(req.params);
  const user = await userService.getUserById(id);

  res.status(200).json({ user });
});
