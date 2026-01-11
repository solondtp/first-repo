const { cloud, db } = require('../common/db');
const { AuditAction, TicketStatus } = require('../common/constants');
const { getUserByOpenId } = require('../common/user');
const { canApprove, ensureStatusTransition } = require('../common/permissions');
const { writeAudit } = require('../common/audit');

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const user = await getUserByOpenId(wxContext.OPENID);
  if (!canApprove(user)) {
    throw new Error('Permission denied');
  }

  const ticketId = event.ticketId;
  if (!ticketId) {
    throw new Error('ticketId required');
  }

  const ticketRes = await db.collection('tickets').doc(ticketId).get();
  const ticket = ticketRes.data;
  ensureStatusTransition(ticket.status, TicketStatus.APPROVED);

  await db.collection('tickets').doc(ticketId).update({
    data: {
      status: TicketStatus.APPROVED,
      approvedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await writeAudit({
    action: AuditAction.APPROVE,
    ticketId,
    actor: { id: user._id, role: user.role },
  });

  return { success: true };
};
