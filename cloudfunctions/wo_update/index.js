const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { Roles, AuditAction, ErrorCode } = require('../wo_common/constants');
const { getUserByOpenId } = require('../wo_common/user');
const { canWriteWorkOrder } = require('../wo_common/permissions');
const { writeAudit } = require('../wo_common/audit');
const { normalizeExpenses, calcExpenseTotal } = require('../wo_common/expense');

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

    if (user.role === Roles.Sales && workOrder.createdBy !== user._id) {
      return fail(ErrorCode.PERMISSION_DENIED, 'Sales can only edit own work orders');
    }

    if (user.role === Roles.Engineer && workOrder.assignedTo !== user._id) {
      return fail(ErrorCode.PERMISSION_DENIED, 'Engineer can only edit assigned work orders');
    }

    const updateData = {
      updatedAt: new Date(),
    };

    if (event.title !== undefined) updateData.title = event.title;
    if (event.description !== undefined) updateData.description = event.description;
    if (event.customer !== undefined) updateData.customer = event.customer;
    if (event.backupDone !== undefined) updateData.backupDone = Boolean(event.backupDone);
    if (event.extra !== undefined) updateData.extra = event.extra;

    if (event.travelExpenses !== undefined) {
      const travelExpenses = normalizeExpenses(event.travelExpenses);
      updateData.travelExpenses = travelExpenses;
      updateData.expenseTotal = calcExpenseTotal(travelExpenses);
    }

    if (Object.keys(updateData).length === 1) {
      return fail(ErrorCode.INVALID_PARAMS, 'No editable fields provided');
    }

    await db.collection('work_orders').doc(workOrderId).update({ data: updateData });

    await writeAudit({
      action: AuditAction.UPDATE,
      workOrderId,
      actor: { id: user._id, role: user.role },
      detail: { fields: Object.keys(updateData) },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error.code, error.message, error.details);
  }
};
