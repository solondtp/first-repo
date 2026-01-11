const { Roles, WorkOrderStatus, ErrorCode } = require('./constants');

function assertRole(user, allowed) {
  if (!allowed.includes(user.role)) {
    const error = new Error('Permission denied');
    error.code = ErrorCode.PERMISSION_DENIED;
    throw error;
  }
}

function canReadWorkOrder(user, workOrder) {
  if (user.role === Roles.Supervisor) return true;
  if (user.role === Roles.Sales) return workOrder.createdBy === user._id;
  if (user.role === Roles.Engineer) return workOrder.assignedTo === user._id;
  return false;
}

function canWriteWorkOrder(user, workOrder) {
  if (user.role === Roles.Supervisor) return true;
  if (user.role === Roles.Engineer) return workOrder.assignedTo === user._id;
  if (user.role === Roles.Sales) return workOrder.createdBy === user._id;
  return false;
}

function ensureStatusTransition(current, next) {
  const allowed = {
    [WorkOrderStatus.DRAFT]: [WorkOrderStatus.ASSIGNED],
    [WorkOrderStatus.ASSIGNED]: [WorkOrderStatus.IN_PROGRESS],
    [WorkOrderStatus.IN_PROGRESS]: [WorkOrderStatus.WAIT_APPROVAL],
    [WorkOrderStatus.WAIT_APPROVAL]: [WorkOrderStatus.APPROVED, WorkOrderStatus.REJECTED],
    [WorkOrderStatus.REJECTED]: [WorkOrderStatus.IN_PROGRESS],
  };

  if (!allowed[current] || !allowed[current].includes(next)) {
    const error = new Error(`Invalid status transition: ${current} -> ${next}`);
    error.code = ErrorCode.INVALID_STATUS;
    throw error;
  }
}

module.exports = {
  assertRole,
  canReadWorkOrder,
  canWriteWorkOrder,
  ensureStatusTransition,
};
