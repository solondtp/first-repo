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

  const updateData = {
    updatedAt: new Date(),
  };

  if (event.title !== undefined) updateData.title = event.title;
  if (event.description !== undefined) updateData.description = event.description;
  if (event.customer !== undefined) updateData.customer = event.customer;
  if (event.backupDone !== undefined) updateData.backupDone = Boolean(event.backupDone);
  if (event.travelExpenses !== undefined) updateData.travelExpenses = event.travelExpenses;

  if (event.status) {
    ensureStatusTransition(ticket.status, event.status);
    updateData.status = event.status;
  }

  await db.collection('tickets').doc(ticketId).update({ data: updateData });

  await writeAudit({
    action: AuditAction.UPDATE,
    ticketId,
    actor: { id: user._id, role: user.role },
    detail: { fields: Object.keys(updateData) },
  });

  return { success: true };
};
