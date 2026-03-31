import { useState } from "react";
import { sendLead } from "../api/chat";
import type { LeadForm as LeadFormType } from "../types";

const initial: LeadFormType = {
  name: "",
  company: "",
  country: "",
  whatsapp: "",
  wechat: "",
  email: "",
  machine_model: "",
  serial_number: "",
  message: ""
};

export function LeadForm({ sessionKey }: { sessionKey: string }) {
  const [form, setForm] = useState(initial);

  return (
    <form
      className="lead-form"
      onSubmit={async (e) => {
        e.preventDefault();
        await sendLead({ ...form, sessionKey });
        alert("留资成功，我们将尽快联系您。");
      }}
    >
      {Object.keys(form).map((k) => (
        <input
          key={k}
          placeholder={k}
          value={form[k as keyof LeadFormType]}
          onChange={(e) => setForm((old) => ({ ...old, [k]: e.target.value }))}
        />
      ))}
      <button type="submit">提交联系方式</button>
    </form>
  );
}
