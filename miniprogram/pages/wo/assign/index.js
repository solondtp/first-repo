const api = require('../../../utils/api');

Page({
  data: {
    workOrderId: '',
    engineers: [],
    engineerIndex: 0,
    planDate: '',
  },

  onLoad(query) {
    this.setData({ workOrderId: query.workOrderId || '' });
    this.fetchEngineers();
  },

  async fetchEngineers() {
    try {
      const data = await api.listEngineers();
      this.setData({ engineers: data, engineerIndex: 0 });
    } catch (error) {
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  onEngineerChange(e) {
    this.setData({ engineerIndex: Number(e.detail.value) });
  },

  onPlanDateChange(e) {
    this.setData({ planDate: e.detail.value });
  },

  async submitAssign() {
    const engineer = this.data.engineers[this.data.engineerIndex];
    if (!engineer) {
      wx.showToast({ title: '请选择技术员', icon: 'none' });
      return;
    }

    try {
      await api.woAssign({
        workOrderId: this.data.workOrderId,
        assigneeId: engineer.id,
      });

      if (this.data.planDate) {
        await api.woUpdate({
          workOrderId: this.data.workOrderId,
          extra: { planDate: this.data.planDate },
        });
      }

      wx.showToast({ title: '派单成功' });
      wx.navigateBack();
    } catch (error) {
      wx.showToast({ title: error.message || '派单失败', icon: 'none' });
    }
  },
});
