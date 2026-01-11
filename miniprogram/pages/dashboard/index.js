const api = require('../../utils/api');

Page({
  data: {
    filters: {
      engineerId: '',
      salesId: '',
      status: '',
      startDate: '',
      endDate: '',
    },
    stats: null,
    loading: false,
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`filters.${field}`]: e.detail.value });
  },

  onStartDateChange(e) {
    this.setData({ 'filters.startDate': e.detail.value });
  },

  onEndDateChange(e) {
    this.setData({ 'filters.endDate': e.detail.value });
  },

  async fetchStats() {
    this.setData({ loading: true });
    try {
      const data = await api.woStats(this.data.filters);
      this.setData({ stats: data, loading: false });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: error.message || '查询失败', icon: 'none' });
    }
  },
});
