const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { Roles, ErrorCode } = require('../wo_common/constants');
const { getUserByOpenId } = require('../wo_common/user');

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const user = await getUserByOpenId(wxContext.OPENID);

    if (user.role !== Roles.Supervisor) {
      return fail(ErrorCode.PERMISSION_DENIED, 'Permission denied');
    }

    const status = event.status;
    let query = db.collection('work_orders');
    if (status) {
      query = query.where({ status });
    }
    const res = await query.orderBy('createdAt', 'desc').get();
    return ok(res.data);
  } catch (error) {
    return fail(error.code, error.message, error.details);
  }
};
