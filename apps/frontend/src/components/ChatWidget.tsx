import { useState } from "react";
import { requestHandover, sendMessage } from "../api/chat";
import type { Message } from "../types";
import { LeadForm } from "./LeadForm";

export function ChatWidget() {
  const [opened, setOpened] = useState(false);
  const [text, setText] = useState("");
  const [sessionKey, setSessionKey] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [showLead, setShowLead] = useState(false);
  const [manual, setManual] = useState(false);

  const quickActions = ["获取产品资料", "申请报价", "申请远程支持", "留下联系方式"];

  return (
    <div>
      <button className="chat-float" onClick={() => setOpened((v) => !v)}>
        在线顾问
      </button>
      {opened && (
        <div className="chat-box">
          <div className="chat-head">ALLCTP 聊天助手 {manual ? "(待人工)" : ""}</div>
          <div className="chat-body">
            {messages.map((m, idx) => (
              <div key={idx} className={`msg ${m.role.toLowerCase()}`}>{m.role}: {m.content}</div>
            ))}
          </div>
          <div className="quick-row">
            {quickActions.map((q) => (
              <button
                key={q}
                onClick={() => {
                  if (q === "留下联系方式") setShowLead(true);
                  setText(q);
                }}
              >
                {q}
              </button>
            ))}
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const userText = text.trim();
              if (!userText) return;
              setMessages((old) => [...old, { role: "USER", content: userText }]);
              setText("");
              const result = await sendMessage({ sessionKey, message: userText, pagePath: window.location.pathname });
              setSessionKey(result.sessionKey);
              setMessages((old) => [...old, { role: "AI", content: result.answer }]);
            }}
          >
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="请输入问题..." />
            <button type="submit">发送</button>
          </form>
          <div className="chat-tools">
            <input type="file" accept="image/*" />
            <button
              onClick={async () => {
                if (!sessionKey) return;
                await requestHandover(sessionKey);
                setManual(true);
              }}
            >
              转人工
            </button>
          </div>
          {showLead && sessionKey && <LeadForm sessionKey={sessionKey} />}
        </div>
      )}
    </div>
  );
}
