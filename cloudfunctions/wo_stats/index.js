const { cloud, db } = require('../wo_common/db');
const { ok, fail } = require('../wo_common/errors');
const { Roles, ErrorCode } = require('../wo_common/constants');
const { getUserByOpenId } = require('../wo_common/user');
const { assertRole } = require('../wo_common/permissions');

exports.main = async (event) => {
  try {
    const wxContext = cloud.getWXContext();
    const user = await getUserByOpenId(wxContext.OPENID);
    assertRole(user, [Roles.Supervisor]);

    const query = {};
    if (event.engineerId) query.assignedTo = event.engineerId;
    if (event.salesId) query.createdBy = event.salesId;
    if (event.status) query.status = event.status;

    if (event.startDate || event.endDate) {
      const start = event.startDate ? new Date(event.startDate) : null;
      const end = event.endDate ? new Date(event.endDate) : null;
      if (start && end) {
        query.createdAt = db.command.gte(start).and(db.command.lte(end));
      } else if (start) {
        query.createdAt = db.command.gte(start);
      } else if (end) {
        query.createdAt = db.command.lte(end);
      }
    }

    const res = await db.collection('work_orders').where(query).get();
    const list = res.data || [];

    const totalCount = list.length;
    const archivedCount = list.filter((item) => item.status === 'APPROVED').length;
    const scored = list.filter((item) => typeof item.score === 'number');
    const averageScore = scored.length
      ? Number((scored.reduce((sum, item) => sum + item.score, 0) / scored.length).toFixed(2))
      : 0;
    const totalExpense = list.reduce((sum, item) => sum + Number(item.expenseTotal || 0), 0);

    const serviceCounts = { in: 0, out: 0, install: 0 };
    list.forEach((item) => {
      const type = item.extra && item.extra.serviceType;
      if (type === '保内') serviceCounts.in += 1;
      if (type === '保外') serviceCounts.out += 1;
      if (type === '安装') serviceCounts.install += 1;
    });

    const serviceTotal = serviceCounts.in + serviceCounts.out + serviceCounts.install;
    const ratio = {
      in: serviceTotal ? Number(((serviceCounts.in / serviceTotal) * 100).toFixed(2)) : 0,
      out: serviceTotal ? Number(((serviceCounts.out / serviceTotal) * 100).toFixed(2)) : 0,
      install: serviceTotal ? Number(((serviceCounts.install / serviceTotal) * 100).toFixed(2)) : 0,
    };

    return ok({
      totalCount,
      archivedCount,
      averageScore,
      totalExpense,
      serviceCounts,
      serviceRatio: ratio,
    });
  } catch (error) {
    return fail(error.code || ErrorCode.INTERNAL_ERROR, error.message, error.details);
  }
};
