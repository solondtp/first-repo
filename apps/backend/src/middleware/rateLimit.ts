import rateLimit from "express-rate-limit";

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 40,
  message: {
    success: false,
    message: "请求过于频繁，请稍后再试"
  }
});
