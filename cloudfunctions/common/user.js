const { db } = require('./db');

async function getUserByOpenId(openid) {
  const res = await db.collection('users').where({ openid }).limit(1).get();
  if (!res.data.length) {
    throw new Error('User not found');
  }
  return res.data[0];
}

module.exports = {
  getUserByOpenId,
};
