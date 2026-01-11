const api = require('../../../utils/api');

Page({
  data: {
    list: [],
    filteredList: [],
    statusOptions: ['全部', 'DRAFT', 'ASSIGNED', 'IN_PROGRESS', 'WAIT_APPROVAL', 'APPROVED', 'REJECTED'],
    statusIndex: 0,
    keyword: '',
    loading: false,
  },

  onShow() {
    this.fetchList();
  },

  onStatusChange(e) {
    this.setData({ statusIndex: Number(e.detail.value) }, () => {
      this.fetchList();
    });
  },

  onKeywordInput(e) {
    this.setData({ keyword: e.detail.value }, () => {
      this.applyFilter();
    });
  },

  async fetchList() {
    this.setData({ loading: true });
    const status = this.data.statusOptions[this.data.statusIndex];
    try {
      const data = status === '全部'
        ? await api.woList({})
        : await api.woList({ status });
      this.setData({ list: data, loading: false }, () => {
        this.applyFilter();
      });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  applyFilter() {
    const keyword = this.data.keyword.trim();
    const filteredList = keyword
      ? this.data.list.filter((item) => {
      return (item.title && item.title.includes(keyword))
        || (item.customer && item.customer.includes(keyword))
        || (item.status && item.status.includes(keyword));
      })
      : this.data.list;
    this.setData({ filteredList });
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/wo/detail/index?workOrderId=${id}` });
  },
});
