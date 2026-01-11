const api = require('../../utils/api');

Page({
  data: {
    profile: null,
    loading: true,
    error: '',
  },

  onLoad() {
    this.fetchProfile();
  },

  async fetchProfile() {
    try {
      const profile = await api.authGetProfile();
      this.setData({ profile, loading: false, error: '' });
    } catch (error) {
      this.setData({ loading: false, error: error.message || '加载失败' });
    }
  },

  goToCreate() {
    wx.navigateTo({ url: '/pages/wo/create/index' });
  },

  goToList() {
    wx.navigateTo({ url: '/pages/wo/list/index' });
  },
});
