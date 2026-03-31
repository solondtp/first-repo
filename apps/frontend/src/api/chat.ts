import { api } from "./client";
import type { LeadForm } from "../types";

export async function sendMessage(payload: { sessionKey?: string; message: string; pagePath: string }) {
  const { data } = await api.post("/chat/send", payload);
  return data.data;
}

export async function sendLead(payload: LeadForm & { sessionKey: string }) {
  const { data } = await api.post("/leads", payload);
  return data.data;
}

export async function requestHandover(sessionKey: string) {
  await api.post("/handover/manual", { sessionKey });
}

export async function fetchConversations(token: string) {
  const { data } = await api.get("/admin/conversations", { headers: { Authorization: `Bearer ${token}` } });
  return data.data;
}

export async function fetchLeads(token: string) {
  const { data } = await api.get("/admin/leads", { headers: { Authorization: `Bearer ${token}` } });
  return data.data;
}

export async function adminLogin(username: string, password: string) {
  const { data } = await api.post("/auth/login", { username, password });
  return data.data;
}

export async function adminReply(token: string, payload: { sessionKey: string; content: string; status: string }) {
  await api.post("/admin/reply", payload, { headers: { Authorization: `Bearer ${token}` } });
}
