const { cloud, db } = require('../common/db');
const { Roles, TicketStatus, AuditAction } = require('../common/constants');
const { getUserByOpenId } = require('../common/user');
const { assertRole } = require('../common/permissions');
const { writeAudit } = require('../common/audit');

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const user = await getUserByOpenId(wxContext.OPENID);
  assertRole(user, [Roles.Sales, Roles.Supervisor]);

  const now = new Date();
  const ticket = {
    title: event.title || '',
    description: event.description || '',
    customer: event.customer || '',
    backupDone: Boolean(event.backupDone),
    travelExpenses: Array.isArray(event.travelExpenses) ? event.travelExpenses : [],
    status: TicketStatus.DRAFT,
    createdBy: user._id,
    createdAt: now,
    updatedAt: now,
  };

  const res = await db.collection('tickets').add({ data: ticket });

  await writeAudit({
    action: AuditAction.CREATE,
    ticketId: res._id,
    actor: { id: user._id, role: user.role },
    detail: { title: ticket.title },
  });

  return {
    ticketId: res._id,
  };
};
