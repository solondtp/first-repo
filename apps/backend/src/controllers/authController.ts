import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { fail, ok } from "../middleware/response";

export async function login(req: Request, res: Response) {
  const { username, password } = req.body as { username: string; password: string };
  const admin = await prisma.adminUser.findUnique({ where: { username } });
  if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
    return fail(res, "账号或密码错误", "invalid credentials", 401);
  }

  const token = jwt.sign({ sub: String(admin.id), username: admin.username }, env.jwtSecret, { expiresIn: "8h" });
  return ok(res, "登录成功", { token, displayName: admin.displayName });
}
