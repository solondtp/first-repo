import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { fail } from "./response";

export type AdminPayload = { sub: string; username: string };

export function authAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return fail(res, "未授权", "missing token", 401);
  }
  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, env.jwtSecret) as AdminPayload;
    (req as Request & { admin?: AdminPayload }).admin = payload;
    next();
  } catch {
    return fail(res, "Token 无效", "invalid token", 401);
  }
}
