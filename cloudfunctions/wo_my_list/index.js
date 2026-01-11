const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { Roles } = require('../wo_common/constants');
const { getUserByOpenId } = require('../wo_common/user');

exports.main = async () => {
  try {
    const wxContext = cloud.getWXContext();
    const user = await getUserByOpenId(wxContext.OPENID);

    if (user.role === Roles.Supervisor) {
      const res = await db.collection('work_orders').orderBy('createdAt', 'desc').get();
      return ok(res.data);
    }

    if (user.role === Roles.Engineer) {
      const res = await db.collection('work_orders')
        .where({ assignedTo: user._id })
        .orderBy('createdAt', 'desc')
        .get();
      return ok(res.data);
    }

    const res = await db.collection('work_orders')
      .where({ createdBy: user._id })
      .orderBy('createdAt', 'desc')
      .get();

    return ok(res.data);
  } catch (error) {
    return fail(error.code, error.message, error.details);
  }
};
