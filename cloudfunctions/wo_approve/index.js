const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { Roles, AuditAction, WorkOrderStatus, ErrorCode } = require('../wo_common/constants');
const { getUserByOpenId } = require('../wo_common/user');
const { assertRole, ensureStatusTransition } = require('../wo_common/permissions');
const { writeAudit } = require('../wo_common/audit');

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const user = await getUserByOpenId(wxContext.OPENID);
    assertRole(user, [Roles.Supervisor]);

    const workOrderId = event.workOrderId;
    if (!workOrderId) {
      return fail(ErrorCode.INVALID_PARAMS, 'workOrderId required');
    }

    const workOrderRes = await db.collection('work_orders').doc(workOrderId).get();
    const workOrder = workOrderRes.data;
    if (!workOrder) {
      return fail(ErrorCode.NOT_FOUND, 'work order not found');
    }

    ensureStatusTransition(workOrder.status, WorkOrderStatus.APPROVED);

    await db.collection('work_orders').doc(workOrderId).update({
      data: {
        status: WorkOrderStatus.APPROVED,
        approvedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await writeAudit({
      action: AuditAction.APPROVE,
      workOrderId,
      actor: { id: user._id, role: user.role },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error.code, error.message, error.details);
  }
};
