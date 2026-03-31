import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Admin@123", 10);

  await prisma.adminUser.upsert({
    where: { username: "admin" },
    create: {
      username: "admin",
      passwordHash,
      displayName: "系统管理员"
    },
    update: {
      passwordHash
    }
  });

  const session = await prisma.chatSession.upsert({
    where: { sessionKey: "web:guest:demo-session" },
    create: {
      sessionKey: "web:guest:demo-session",
      pagePath: "/services/online-support",
      country: "CN"
    },
    update: {}
  });

  await prisma.chatMessage.create({
    data: {
      sessionId: session.id,
      sessionKey: session.sessionKey,
      role: "USER",
      content: "你好，我想咨询 Kodak CTP 设备报价。"
    }
  });
}

main().finally(async () => {
  await prisma.$disconnect();
});
