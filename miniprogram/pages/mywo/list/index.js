const api = require('../../../utils/api');

Page({
  data: {
    list: [],
    loading: false,
  },

  onShow() {
    this.fetchList();
  },

  async fetchList() {
    this.setData({ loading: true });
    try {
      const data = await api.woMyList();
      this.setData({ list: data, loading: false });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/mywo/detail/index?workOrderId=${id}` });
  },
});
