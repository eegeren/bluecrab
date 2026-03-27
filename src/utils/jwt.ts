import jwt from "jsonwebtoken";
import { env } from "./env";

type TokenPayload = {
  sub: string;
  sid: string;
  email: string;
  username: string;
};

export const signAccessToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, env.JWT_SECRET) as TokenPayload & jwt.JwtPayload;
