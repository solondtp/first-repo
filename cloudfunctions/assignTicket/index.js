const { cloud, db } = require('../common/db');
const { AuditAction, TicketStatus } = require('../common/constants');
const { getUserByOpenId } = require('../common/user');
const { canAssign, ensureStatusTransition } = require('../common/permissions');
const { writeAudit } = require('../common/audit');

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const user = await getUserByOpenId(wxContext.OPENID);
  if (!canAssign(user)) {
    throw new Error('Permission denied');
  }

  const ticketId = event.ticketId;
  const assigneeId = event.assigneeId;
  if (!ticketId || !assigneeId) {
    throw new Error('ticketId and assigneeId required');
  }

  const ticketRes = await db.collection('tickets').doc(ticketId).get();
  const ticket = ticketRes.data;
  ensureStatusTransition(ticket.status, TicketStatus.ASSIGNED);

  await db.collection('tickets').doc(ticketId).update({
    data: {
      status: TicketStatus.ASSIGNED,
      assignedTo: assigneeId,
      assignedAt: new Date(),
      updatedAt: new Date(),
    },
  });

  await writeAudit({
    action: AuditAction.ASSIGN,
    ticketId,
    actor: { id: user._id, role: user.role },
    detail: { assigneeId },
  });

  return { success: true };
};
