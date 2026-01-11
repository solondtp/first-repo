const { cloud, db } = require('../common/db');
const { AuditAction, TicketStatus } = require('../common/constants');
const { getUserByOpenId } = require('../common/user');
const { canEditTicket, ensureStatusTransition } = require('../common/permissions');
const { writeAudit } = require('../common/audit');

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const user = await getUserByOpenId(wxContext.OPENID);
  const ticketId = event.ticketId;
  if (!ticketId) {
    throw new Error('ticketId required');
  }

  const ticketRes = await db.collection('tickets').doc(ticketId).get();
  const ticket = ticketRes.data;
  if (!canEditTicket(user, ticket)) {
    throw new Error('Permission denied');
  }

  ensureStatusTransition(ticket.status, TicketStatus.WAIT_APPROVAL);

  await db.collection('tickets').doc(ticketId).update({
    data: {
      status: TicketStatus.WAIT_APPROVAL,
      submittedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await writeAudit({
    action: AuditAction.SUBMIT,
    ticketId,
    actor: { id: user._id, role: user.role },
  });

  return { success: true };
};
