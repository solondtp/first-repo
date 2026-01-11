const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { AuditAction, ErrorCode } = require('../wo_common/constants');
const { getUserByOpenId } = require('../wo_common/user');
const { writeAudit } = require('../wo_common/audit');

exports.main = async (event) => {
  try {
    const token = event.token;
    const score = Number(event.score);
    const comment = event.comment || '';

    if (!token || Number.isNaN(score)) {
      return fail(ErrorCode.INVALID_PARAMS, 'token and score required');
    }

    const tokenRes = await db.collection('score_tokens').where({ token }).limit(1).get();
    if (!tokenRes.data.length) {
      return fail(ErrorCode.TOKEN_INVALID, 'Invalid token');
    }

    const tokenDoc = tokenRes.data[0];
    if (tokenDoc.used) {
      return fail(ErrorCode.TOKEN_USED, 'Token already used');
    }

    if (tokenDoc.expiresAt && new Date(tokenDoc.expiresAt).getTime() < Date.now()) {
      return fail(ErrorCode.TOKEN_EXPIRED, 'Token expired');
    }

    let actor = { id: 'customer', role: 'Customer' };
    try {
      const wxContext = cloud.getWXContext();
      const user = await getUserByOpenId(wxContext.OPENID);
      actor = { id: user._id, role: user.role };
    } catch (error) {
      actor = { id: 'customer', role: 'Customer' };
    }

    await db.collection('work_orders').doc(tokenDoc.workOrderId).update({
      data: {
        score,
        scoreComment: comment,
        scoredAt: new Date(),
        scoredBy: actor,
      },
    });

    await db.collection('score_tokens').doc(tokenDoc._id).update({
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    await writeAudit({
      action: AuditAction.SCORE_SUBMIT,
      workOrderId: tokenDoc.workOrderId,
      actor,
      detail: { score, proxy: actor.role !== 'Customer' },
    });

    return ok({ success: true });
  } catch (error) {
    return fail(error.code, error.message, error.details);
  }
};
