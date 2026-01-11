const api = require('../../../utils/api');

Page({
  data: {
    form: {
      customer: '',
      type: '',
      category: '',
      priority: '中',
      planDate: '',
      deviceInfo: '',
      description: '',
      backupDone: false,
    },
    priorities: ['低', '中', '高'],
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onPriorityChange(e) {
    const index = Number(e.detail.value);
    this.setData({ 'form.priority': this.data.priorities[index] });
  },

  onPlanDateChange(e) {
    this.setData({ 'form.planDate': e.detail.value });
  },

  onBackupToggle(e) {
    this.setData({ 'form.backupDone': e.detail.value });
  },

  async submit() {
    const form = this.data.form;
    if (!form.customer || !form.type || !form.category) {
      wx.showToast({ title: '请填写必填项', icon: 'none' });
      return;
    }

    try {
      const payload = {
        title: `${form.customer}-${form.type}`,
        customer: form.customer,
        description: form.description,
        backupDone: form.backupDone,
        extra: {
          type: form.type,
          category: form.category,
          priority: form.priority,
          planDate: form.planDate,
          deviceInfo: form.deviceInfo,
        },
      };
      const data = await api.woCreate(payload);
      wx.showToast({ title: '创建成功' });
      wx.navigateTo({ url: `/pages/wo/detail/index?workOrderId=${data.workOrderId}` });
    } catch (error) {
      wx.showToast({ title: error.message || '创建失败', icon: 'none' });
    }
  },
});
