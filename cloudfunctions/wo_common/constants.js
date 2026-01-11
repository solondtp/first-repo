const Roles = {
  Sales: 'Sales',
  Supervisor: 'Supervisor',
  Engineer: 'Engineer',
};

const WorkOrderStatus = {
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
  SCORE_TOKEN_CREATE: 'score_token',
  SCORE_SUBMIT: 'score_submit',
};

const ErrorCode = {
  INVALID_PARAMS: 'INVALID_PARAMS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  NOT_FOUND: 'NOT_FOUND',
  INVALID_STATUS: 'INVALID_STATUS',
  TOKEN_INVALID: 'TOKEN_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_USED: 'TOKEN_USED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
};

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7;

module.exports = {
  Roles,
  WorkOrderStatus,
  AuditAction,
  ErrorCode,
  TOKEN_TTL_MS,
};
