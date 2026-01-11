const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { ErrorCode } = require('../wo_common/constants');
const { getUserByOpenId } = require('../wo_common/user');
const { canReadWorkOrder } = require('../wo_common/permissions');

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

    if (!canReadWorkOrder(user, workOrder)) {
      return fail(ErrorCode.PERMISSION_DENIED, 'Permission denied');
    }

    return ok(workOrder);
  } catch (error) {
    return fail(error.code, error.message, error.details);
  }
};
