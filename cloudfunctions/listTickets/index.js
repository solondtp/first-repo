const { cloud, db } = require('../common/db');
const { Roles } = require('../common/constants');
const { getUserByOpenId } = require('../common/user');

exports.main = async () => {
  const wxContext = cloud.getWXContext();
  const user = await getUserByOpenId(wxContext.OPENID);

  if (user.role === Roles.Supervisor) {
    const res = await db.collection('tickets').orderBy('createdAt', 'desc').get();
    return res.data;
  }

  const res = await db.collection('tickets')
    .where({
      createdBy: user._id,
    })
    .orderBy('createdAt', 'desc')
    .get();

  return res.data;
};
