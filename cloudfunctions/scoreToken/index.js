const crypto = require('crypto');
const { cloud, db } = require('../common/db');
const { AuditAction, Roles } = require('../common/constants');
const { getUserByOpenId } = require('../common/user');
const { assertRole } = require('../common/permissions');
const { writeAudit } = require('../common/audit');

function generateToken() {
  return crypto.randomBytes(16).toString('hex');
}

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const user = await getUserByOpenId(wxContext.OPENID);
  assertRole(user, [Roles.Sales, Roles.Supervisor]);

  const ticketId = event.ticketId;
  if (!ticketId) {
    throw new Error('ticketId required');
  }

  const token = generateToken();
  await db.collection('score_tokens').add({
    data: {
      ticketId,
      token,
      used: false,
      createdAt: new Date(),
    },
  });

  await writeAudit({
    action: AuditAction.SCORE_TOKEN,
    ticketId,
    actor: { id: user._id, role: user.role },
  });

  return {
    token,
    link: `https://your-miniapp-domain/pages/score/index?token=${token}`,
  };
};
