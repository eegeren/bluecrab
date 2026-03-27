import type { Request, Response } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/async-handler";
import * as postService from "../services/post.service";
import { createPostSchema, postsQuerySchema } from "../utils/validation";

const postIdParamsSchema = z.object({
  id: z.string().uuid(),
});

export const createPost = asyncHandler(async (req: Request, res: Response) => {
  const input = createPostSchema.parse(req.body);
  const post = await postService.createPost({
    authorId: req.user!.id,
    content: input.content,
  });

  res.status(201).json({ post });
});

export const listPosts = asyncHandler(async (req: Request, res: Response) => {
  const query = postsQuerySchema.parse(req.query);
  const result = await postService.listPosts(query);

  res.status(200).json(result);
});

export const deletePost = asyncHandler(async (req: Request, res: Response) => {
  const { id } = postIdParamsSchema.parse(req.params);
  await postService.deletePost(id, req.user!.id);

  res.status(204).send();
});
