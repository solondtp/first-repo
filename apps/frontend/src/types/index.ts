export type Message = {
  role: "USER" | "AI" | "ADMIN";
  content: string;
  createdAt?: string;
};

export type LeadForm = {
  name: string;
  company: string;
  country: string;
  whatsapp: string;
  wechat: string;
  email: string;
  machine_model: string;
  serial_number: string;
  message: string;
};
