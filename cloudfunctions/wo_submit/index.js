const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { AuditAction, WorkOrderStatus, ErrorCode } = require('../wo_common/constants');
const { getUserByOpenId } = require('../wo_common/user');
const { canWriteWorkOrder, ensureStatusTransition } = require('../wo_common/permissions');
const { writeAudit } = require('../wo_common/audit');

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const user = await getUserByOpenId(wxContext.OPENID);
    const workOrderId = event.workOrderId;
    if (!workOrderId) {
      return fail(ErrorCode.INVALID_PARAMS, 'workOrderId required');
    }

    const workOrderRes = await db.collection('work_orders').doc(workOrderId).get();
    const workOrder = workOrderRes.data;
    if (!workOrder) {
      return fail(ErrorCode.NOT_FOUND, 'work order not found');
    }

    if (!canWriteWorkOrder(user, workOrder)) {
      return fail(ErrorCode.PERMISSION_DENIED, 'Permission denied');
    }

    ensureStatusTransition(workOrder.status, WorkOrderStatus.WAIT_APPROVAL);

    await db.collection('work_orders').doc(workOrderId).update({
      data: {
        status: WorkOrderStatus.WAIT_APPROVAL,
        submittedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await writeAudit({
      action: AuditAction.SUBMIT,
      workOrderId,
      actor: { id: user._id, role: user.role },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error.code, error.message, error.details);
  }
};
