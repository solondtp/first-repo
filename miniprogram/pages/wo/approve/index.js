const api = require('../../../utils/api');

Page({
  data: {
    workOrderId: '',
    rejectReason: '',
  },

  onLoad(query) {
    this.setData({ workOrderId: query.workOrderId || '' });
  },

  onReasonInput(e) {
    this.setData({ rejectReason: e.detail.value });
  },

  async approve() {
    try {
      await api.woApprove({ workOrderId: this.data.workOrderId });
      wx.showToast({ title: '已通过' });
      wx.navigateBack();
    } catch (error) {
      wx.showToast({ title: error.message || '审批失败', icon: 'none' });
    }
  },

  async reject() {
    if (!this.data.rejectReason) {
      wx.showToast({ title: '请输入驳回原因', icon: 'none' });
      return;
    }
    try {
      await api.woReject({ workOrderId: this.data.workOrderId, reason: this.data.rejectReason });
      wx.showToast({ title: '已驳回' });
      wx.navigateBack();
    } catch (error) {
      wx.showToast({ title: error.message || '驳回失败', icon: 'none' });
    }
  },
});
