const callFunction = (name, data) => {
  return wx.cloud.callFunction({ name, data }).then((res) => {
    const payload = res.result || {};
    if (!payload.ok) {
      const err = payload.error || { message: 'Unknown error' };
      return Promise.reject(err);
    }
    return payload.data;
  });
};

module.exports = {
  authGetProfile: () => callFunction('auth_getProfile'),
  woCreate: (data) => callFunction('wo_create', data),
  woAssign: (data) => callFunction('wo_assign', data),
  woUpdate: (data) => callFunction('wo_update', data),
  woSubmit: (data) => callFunction('wo_submit', data),
  woApprove: (data) => callFunction('wo_approve', data),
  woReject: (data) => callFunction('wo_reject', data),
  woGet: (data) => callFunction('wo_get', data),
  woList: (data) => callFunction('wo_list', data),
  woMyList: () => callFunction('wo_my_list'),
  scoreTokenCreate: (data) => callFunction('wo_score_token_create', data),
  scoreTokenInfo: (data) => callFunction('wo_score_token_info', data),
  scoreSubmit: (data) => callFunction('wo_score_submit', data),
  listEngineers: () => callFunction('user_list_engineers'),
  woStats: (data) => callFunction('wo_stats', data),
};
