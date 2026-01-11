const api = require('../../../utils/api');

Page({
  data: {
    workOrderId: '',
    workOrder: null,
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

  async submit() {
    try {
      await api.woSubmit({ workOrderId: this.data.workOrderId });
      wx.showToast({ title: '已提交' });
      wx.navigateBack({ delta: 2 });
    } catch (error) {
      wx.showToast({ title: error.message || '提交失败', icon: 'none' });
    }
  },
});
