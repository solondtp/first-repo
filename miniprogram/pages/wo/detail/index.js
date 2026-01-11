const api = require('../../../utils/api');

Page({
  data: {
    workOrderId: '',
    workOrder: null,
    scoreToken: '',
    loading: false,
  },

  onLoad(query) {
    this.setData({ workOrderId: query.workOrderId || '' });
  },

  onShow() {
    if (this.data.workOrderId) {
      this.fetchDetail();
    }
  },

  async fetchDetail() {
    this.setData({ loading: true });
    try {
      const workOrder = await api.woGet({ workOrderId: this.data.workOrderId });
      this.setData({ workOrder, loading: false });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  goAssign() {
    wx.navigateTo({ url: `/pages/wo/assign/index?workOrderId=${this.data.workOrderId}` });
  },

  goApprove() {
    wx.navigateTo({ url: `/pages/wo/approve/index?workOrderId=${this.data.workOrderId}` });
  },

  async createScoreToken() {
    try {
      const data = await api.scoreTokenCreate({ workOrderId: this.data.workOrderId });
      this.setData({ scoreToken: data.token });
      wx.showToast({ title: '已生成' });
    } catch (error) {
      wx.showToast({ title: error.message || '生成失败', icon: 'none' });
    }
  },
});
