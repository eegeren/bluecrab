import type { NextFunction, Request, Response } from "express";
import { sanitizeValue } from "../utils/sanitize";

export const sanitizeRequest = (req: Request, _res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeValue(req.body);
  }

  if (req.query) {
    req.query = sanitizeValue(req.query);
  }

  if (req.params) {
    req.params = sanitizeValue(req.params);
  }

  next();
};
