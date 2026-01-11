const { Roles, TicketStatus } = require('./constants');

function assertRole(user, allowedRoles) {
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Permission denied');
  }
}

function canEditTicket(user, ticket) {
  if (user.role === Roles.Supervisor) {
    return true;
  }
  return ticket.createdBy === user._id || ticket.assignedTo === user._id;
}

function canAssign(user) {
  return user.role === Roles.Supervisor;
}

function canApprove(user) {
  return user.role === Roles.Supervisor;
}

function ensureStatusTransition(current, next) {
  const allowed = {
    [TicketStatus.DRAFT]: [TicketStatus.ASSIGNED],
    [TicketStatus.ASSIGNED]: [TicketStatus.IN_PROGRESS],
    [TicketStatus.IN_PROGRESS]: [TicketStatus.WAIT_APPROVAL],
    [TicketStatus.WAIT_APPROVAL]: [TicketStatus.APPROVED, TicketStatus.REJECTED],
    [TicketStatus.REJECTED]: [TicketStatus.IN_PROGRESS],
  };

  if (!allowed[current] || !allowed[current].includes(next)) {
    throw new Error(`Invalid status transition: ${current} -> ${next}`);
  }
}

module.exports = {
  assertRole,
  canEditTicket,
  canAssign,
  canApprove,
  ensureStatusTransition,
};
