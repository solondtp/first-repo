import { Response } from "express";

export function ok<T>(res: Response, message: string, data?: T) {
  return res.json({ success: true, message, data });
}

export function fail(res: Response, message: string, error?: string, status = 400) {
  return res.status(status).json({ success: false, message, error });
}
