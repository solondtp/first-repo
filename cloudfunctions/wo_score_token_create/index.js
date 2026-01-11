const crypto = require('crypto');
const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { Roles, AuditAction, ErrorCode, TOKEN_TTL_MS } = require('../wo_common/constants');
const { getUserByOpenId } = require('../wo_common/user');
const { assertRole, canReadWorkOrder } = require('../wo_common/permissions');
const { writeAudit } = require('../wo_common/audit');

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const user = await getUserByOpenId(wxContext.OPENID);
    assertRole(user, [Roles.Sales, Roles.Supervisor]);

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

    const token = generateToken();
    const now = Date.now();
    const expiresAt = new Date(now + TOKEN_TTL_MS);

    await db.collection('score_tokens').add({
      data: {
        workOrderId,
        token,
        used: false,
        createdAt: new Date(now),
        expiresAt,
      },
    });

    await writeAudit({
      action: AuditAction.SCORE_TOKEN_CREATE,
      workOrderId,
      actor: { id: user._id, role: user.role },
    });

    return ok({
      token,
      expiresAt,
      link: `https://your-miniapp-domain/pages/score/index?token=${token}`,
    });
  } catch (error) {
    return fail(error.code, error.message, error.details);
  }
};
