const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { Roles, ErrorCode } = require('../wo_common/constants');
const { getUserByOpenId } = require('../wo_common/user');
const { assertRole } = require('../wo_common/permissions');

exports.main = async () => {
  try {
    const wxContext = cloud.getWXContext();
    const user = await getUserByOpenId(wxContext.OPENID);
    assertRole(user, [Roles.Supervisor]);

    const res = await db.collection('users').where({ role: Roles.Engineer }).get();
    const engineers = res.data.map((item) => ({
      id: item._id,
      name: item.name || '',
      department: item.department || '',
    }));

    return ok(engineers);
  } catch (error) {
    return fail(error.code || ErrorCode.INTERNAL_ERROR, error.message, error.details);
  }
};
