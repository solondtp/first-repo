const { db } = require('./db');
const { AuditAction } = require('./constants');

async function writeAudit({
  action,
  workOrderId,
  actor,
  detail,
}) {
  if (!Object.values(AuditAction).includes(action)) {
    const error = new Error('Invalid audit action');
    error.code = 'INVALID_PARAMS';
    throw error;
  }
  return db.collection('audit_logs').add({
    data: {
      action,
      workOrderId,
      actor,
      detail: detail || {},
      createdAt: new Date(),
    },
  });
}

module.exports = {
  writeAudit,
};
