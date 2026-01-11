const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { Roles, WorkOrderStatus, AuditAction, ErrorCode } = require('../wo_common/constants');
const { getUserByOpenId } = require('../wo_common/user');
const { assertRole } = require('../wo_common/permissions');
const { writeAudit } = require('../wo_common/audit');
const { normalizeExpenses, calcExpenseTotal } = require('../wo_common/expense');

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const user = await getUserByOpenId(wxContext.OPENID);
    assertRole(user, [Roles.Sales, Roles.Supervisor]);

    const title = event.title || '';
    if (!title) {
      return fail(ErrorCode.INVALID_PARAMS, 'title required');
    }

    const travelExpenses = normalizeExpenses(event.travelExpenses);
    const expenseTotal = calcExpenseTotal(travelExpenses);

    const now = new Date();
    const workOrder = {
      title,
      description: event.description || '',
      customer: event.customer || '',
      backupDone: Boolean(event.backupDone),
      travelExpenses,
      expenseTotal,
      extra: event.extra || {},
      status: WorkOrderStatus.DRAFT,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    };

    const res = await db.collection('work_orders').add({ data: workOrder });

    await writeAudit({
      action: AuditAction.CREATE,
      workOrderId: res._id,
      actor: { id: user._id, role: user.role },
      detail: { title },
    });

    return ok({ workOrderId: res._id });
  } catch (error) {
    return fail(error.code, error.message, error.details);
  }
};
