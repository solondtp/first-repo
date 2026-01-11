const Roles = {
  Sales: 'Sales',
  Supervisor: 'Supervisor',
};

const TicketStatus = {
  DRAFT: 'DRAFT',
  ASSIGNED: 'ASSIGNED',
  IN_PROGRESS: 'IN_PROGRESS',
  WAIT_APPROVAL: 'WAIT_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

const AuditAction = {
  CREATE: 'create',
  ASSIGN: 'assign',
  UPDATE: 'update',
  SUBMIT: 'submit',
  APPROVE: 'approve',
  REJECT: 'reject',
  SCORE_TOKEN: 'score_token',
  SCORE_SUBMIT: 'score_submit',
};

module.exports = {
  Roles,
  TicketStatus,
  AuditAction,
};
