const { db } = require('./db');
const { ErrorCode } = require('./constants');

async function getUserByOpenId(openid) {
  const res = await db.collection('users').where({ openid }).limit(1).get();
  if (!res.data.length) {
    const error = new Error('User not found');
    error.code = ErrorCode.PERMISSION_DENIED;
    throw error;
  }
  return res.data[0];
}

module.exports = {
  getUserByOpenId,
};
