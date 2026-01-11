const { db } = require('./db');
const { AuditAction } = require('./constants');

async function writeAudit({
  action,
  ticketId,
  actor,
  detail,
}) {
  if (!Object.values(AuditAction).includes(action)) {
    throw new Error('Invalid audit action');
  }
  return db.collection('audit_logs').add({
    data: {
      action,
      ticketId,
      actor,
      detail: detail || {},
      createdAt: new Date(),
    },
  });
}

module.exports = {
  writeAudit,
};
