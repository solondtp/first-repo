const api = require('../../../utils/api');

const EDITABLE_STATUS = ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'];

Page({
  data: {
    workOrderId: '',
    workOrder: null,
    loading: false,
    canEdit: false,
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
      const canEdit = EDITABLE_STATUS.includes(workOrder.status);
      this.setData({ workOrder, canEdit, loading: false });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  goEdit() {
    if (!this.data.canEdit) {
      wx.showToast({ title: '当前状态不可填报', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/mywo/edit/index?workOrderId=${this.data.workOrderId}` });
  },
});
