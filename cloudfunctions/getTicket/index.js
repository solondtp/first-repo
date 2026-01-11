const { cloud, db } = require('../common/db');
const { Roles } = require('../common/constants');
const { getUserByOpenId } = require('../common/user');

exports.main = async (event) => {
  const wxContext = cloud.getWXContext();
  const user = await getUserByOpenId(wxContext.OPENID);
  const ticketId = event.ticketId;
  if (!ticketId) {
    throw new Error('ticketId required');
  }

  const ticketRes = await db.collection('tickets').doc(ticketId).get();
  const ticket = ticketRes.data;
  if (user.role !== Roles.Supervisor && ticket.createdBy !== user._id && ticket.assignedTo !== user._id) {
    throw new Error('Permission denied');
  }

  return ticket;
};
