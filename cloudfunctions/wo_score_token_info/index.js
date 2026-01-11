const { db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { ErrorCode } = require('../wo_common/constants');

exports.main = async (event) => {
  try {
    const token = event.token;
    if (!token) {
      return fail(ErrorCode.INVALID_PARAMS, 'token required');
    }

    const res = await db.collection('score_tokens').where({ token }).limit(1).get();
    if (!res.data.length) {
      return fail(ErrorCode.TOKEN_INVALID, 'Invalid token');
    }

    const tokenDoc = res.data[0];
    if (tokenDoc.used) {
      return fail(ErrorCode.TOKEN_USED, 'Token already used');
    }

    if (tokenDoc.expiresAt && new Date(tokenDoc.expiresAt).getTime() < Date.now()) {
      return fail(ErrorCode.TOKEN_EXPIRED, 'Token expired');
    }

    return ok({
      workOrderId: tokenDoc.workOrderId,
      expiresAt: tokenDoc.expiresAt,
    });
  } catch (error) {
    return fail(error.code, error.message, error.details);
  }
};
