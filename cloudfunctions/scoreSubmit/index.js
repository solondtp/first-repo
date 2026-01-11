const { cloud, db } = require('../common/db');
const { AuditAction } = require('../common/constants');
const { getUserByOpenId } = require('../common/user');
const { writeAudit } = require('../common/audit');

exports.main = async (event) => {
  const token = event.token;
  const score = event.score;
  const comment = event.comment || '';
  if (!token || typeof score !== 'number') {
    throw new Error('token and score required');
  }

  const tokenRes = await db.collection('score_tokens').where({ token, used: false }).limit(1).get();
  if (!tokenRes.data.length) {
    throw new Error('Invalid or used token');
  }

  const tokenDoc = tokenRes.data[0];
  let actor = null;
  try {
    const wxContext = cloud.getWXContext();
    const user = await getUserByOpenId(wxContext.OPENID);
    actor = { id: user._id, role: user.role };
  } catch (error) {
    actor = { id: 'customer', role: 'Customer' };
  }

  await db.collection('tickets').doc(tokenDoc.ticketId).update({
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
    ticketId: tokenDoc.ticketId,
    actor,
    detail: { score, proxy: actor.role !== 'Customer' },
  });

  return { success: true };
};
