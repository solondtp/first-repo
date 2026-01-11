const api = require('../../utils/api');

Page({
  data: {
    token: '',
    workOrderId: '',
    score: 8,
    comment: '',
    canSubmit: false,
    errorMessage: '',
    loading: false,
  },

  onLoad(query) {
    const token = query.token || '';
    this.setData({ token });
    if (token) {
      this.fetchTokenInfo();
    } else {
      this.setData({ errorMessage: '无效评分链接', canSubmit: false });
    }
  },

  async fetchTokenInfo() {
    this.setData({ loading: true });
    try {
      const data = await api.scoreTokenInfo({ token: this.data.token });
      this.setData({
        workOrderId: data.workOrderId,
        loading: false,
        errorMessage: '',
        canSubmit: true,
      });
    } catch (error) {
      const message = this.mapTokenError(error);
      this.setData({ loading: false, errorMessage: message, canSubmit: false });
    }
  },

  mapTokenError(error) {
    if (!error || !error.code) {
      return '评分链接无效或已失效';
    }
    if (error.code === 'TOKEN_EXPIRED') return '评分链接已过期';
    if (error.code === 'TOKEN_USED') return '评分链接已使用';
    if (error.code === 'TOKEN_INVALID') return '评分链接无效';
    return error.message || '评分链接无效或已失效';
  },

  onScoreChange(e) {
    this.setData({ score: Number(e.detail.value) });
  },

  onCommentInput(e) {
    this.setData({ comment: e.detail.value });
  },

  async submitScore() {
    if (!this.data.canSubmit) {
      wx.showToast({ title: this.data.errorMessage || '无法提交评分', icon: 'none' });
      return;
    }

    try {
      await api.scoreSubmit({
        token: this.data.token,
        score: this.data.score,
        comment: this.data.comment,
        asProxy: false,
      });
      wx.showToast({ title: '感谢评分' });
      this.setData({ canSubmit: false });
    } catch (error) {
      wx.showToast({ title: error.message || '提交失败', icon: 'none' });
    }
  },
});
