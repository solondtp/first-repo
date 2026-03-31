import { useEffect, useState } from "react";
import { adminLogin, adminReply, fetchConversations, fetchLeads } from "../api/chat";

export function AdminPage() {
  const [token, setToken] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@123");
  const [conversations, setConversations] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetchConversations(token).then(setConversations);
    fetchLeads(token).then(setLeads);
  }, [token]);

  if (!token) {
    return (
      <main className="container">
        <h2>后台登录</h2>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
        <button onClick={async () => setToken((await adminLogin(username, password)).token)}>登录</button>
      </main>
    );
  }

  return (
    <main className="container">
      <h2>对话列表</h2>
      {conversations.map((item) => (
        <div key={item.id} className="card">
          <strong>{item.sessionKey}</strong> - {item.status}
          <button onClick={() => adminReply(token, { sessionKey: item.sessionKey, content: "您好，这里是人工客服。", status: "FOLLOWED_UP" })}>
            手动回复
          </button>
        </div>
      ))}
      <h2>留资列表</h2>
      {leads.map((lead) => (
        <div key={lead.id} className="card">{lead.name} / {lead.company} / {lead.machineModel}</div>
      ))}
    </main>
  );
}
