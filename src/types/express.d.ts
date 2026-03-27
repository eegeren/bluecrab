import type { User } from "../../generated/prisma/index";

declare global {
  namespace Express {
    interface AuthenticatedUser {
      id: string;
      email: string;
      username: string;
      sessionId: string;
    }

    interface Request {
      user?: AuthenticatedUser;
      rawBody?: string;
    }
  }
}

export type SafeUser = Pick<User, "id" | "email" | "username" | "createdAt" | "updatedAt">;
