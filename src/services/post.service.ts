import prisma from "../prisma";
import { AppError } from "../utils/errors";

export const createPost = async (input: { authorId: string; content: string }) =>
  prisma.post.create({
    data: input,
    include: {
      author: {
        select: {
          id: true,
          username: true,
        },
      },
    },
  });

export const listPosts = async (input: { page: number; limit: number; authorId?: string }) => {
  const skip = (input.page - 1) * input.limit;

  const where = input.authorId
    ? {
        authorId: input.authorId,
      }
    : undefined;

  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip,
      take: input.limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.ceil(total / input.limit) || 1,
    },
  };
};

export const deletePost = async (postId: string, userId: string) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new AppError(404, "Post not found", "POST_NOT_FOUND");
  }

  if (post.authorId !== userId) {
    throw new AppError(403, "You can only delete your own posts", "FORBIDDEN");
  }

  await prisma.post.delete({
    where: { id: postId },
  });
};
