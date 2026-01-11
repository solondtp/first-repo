const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { getUserByOpenId } = require('../wo_common/user');

exports.main = async () => {
  try {
    const wxContext = cloud.getWXContext();
    const user = await getUserByOpenId(wxContext.OPENID);
    const profile = {
      id: user._id,
      name: user.name || '',
      role: user.role,
      department: user.department || '',
    };
    return ok(profile);
  } catch (error) {
    return fail(error.code, error.message, error.details);
  }
};
