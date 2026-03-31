import { v4 as uuidv4 } from "uuid";

export function generateGuestSessionKey() {
  return `web:guest:${uuidv4()}`;
}

export function upgradeSessionToLead(leadId: number) {
  return `lead:${leadId}`;
}

export function createTicketSessionKey(ticketId: number) {
  return `ticket:${ticketId}`;
}
