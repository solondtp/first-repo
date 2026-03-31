import { Router } from "express";
import multer from "multer";
import path from "path";
import { env } from "../config/env";
import { login } from "../controllers/authController";
import { listConversations, listLeads, manualReply } from "../controllers/adminController";
import { history, sendChat } from "../controllers/chatController";
import { manualHandover } from "../controllers/handoverController";
import { createLead } from "../controllers/leadController";
import { uploadFile } from "../controllers/uploadController";
import { authAdmin } from "../middleware/auth";

const upload = multer({
  storage: multer.diskStorage({
    destination: env.uploadDir,
    filename: (_, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
  }),
  limits: { fileSize: env.maxUploadSize },
  fileFilter: (_, file, cb) => {
    const allow = ["image/png", "image/jpeg", "image/webp", "application/pdf"].includes(file.mimetype);
    cb(allow ? null : new Error("不支持的文件类型"), allow);
  }
});

export const router = Router();

router.post("/auth/login", login);
router.post("/chat/send", sendChat);
router.get("/chat/history/:sessionKey", history);
router.post("/leads", createLead);
router.post("/upload", upload.single("file"), uploadFile);
router.post("/handover/manual", manualHandover);

router.get("/admin/conversations", authAdmin, listConversations);
router.get("/admin/leads", authAdmin, listLeads);
router.post("/admin/reply", authAdmin, manualReply);

router.get("/health", (_, res) => {
  res.json({ success: true, message: "ok", data: { service: "allctp-backend" } });
});
