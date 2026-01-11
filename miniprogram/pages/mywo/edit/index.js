const api = require('../../../utils/api');

const EDITABLE_STATUS = ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'];

Page({
  data: {
    workOrderId: '',
    workOrder: null,
    form: {
      fault: '',
      result: '',
      backupDone: false,
      actualStart: '',
      actualEnd: '',
      steps: [{ content: '' }],
      parts: [{ name: '', qty: '' }],
      expenses: [{ date: '', amount: '', description: '', receipts: [] }],
    },
    loading: false,
  },

  onLoad(query) {
    this.setData({ workOrderId: query.workOrderId || '' });
    this.fetchDetail();
  },

  async fetchDetail() {
    this.setData({ loading: true });
    try {
      const workOrder = await api.woGet({ workOrderId: this.data.workOrderId });
      if (!EDITABLE_STATUS.includes(workOrder.status)) {
        wx.showToast({ title: '当前状态不可填报', icon: 'none' });
        wx.navigateBack();
        return;
      }
      const extra = workOrder.extra || {};
      this.setData({
        workOrder,
        loading: false,
        form: {
          fault: extra.fault || '',
          result: extra.result || '',
          backupDone: Boolean(workOrder.backupDone),
          actualStart: extra.actualStart || '',
          actualEnd: extra.actualEnd || '',
          steps: Array.isArray(extra.steps) && extra.steps.length ? extra.steps : [{ content: '' }],
          parts: Array.isArray(extra.parts) && extra.parts.length ? extra.parts : [{ name: '', qty: '' }],
          expenses: Array.isArray(workOrder.travelExpenses) && workOrder.travelExpenses.length
            ? workOrder.travelExpenses
            : [{ date: '', amount: '', description: '', receipts: [] }],
        },
      });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: error.message || '加载失败', icon: 'none' });
    }
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onStepInput(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({ [`form.steps[${index}].content`]: e.detail.value });
  },

  addStep() {
    const steps = this.data.form.steps.concat({ content: '' });
    this.setData({ 'form.steps': steps });
  },

  removeStep(e) {
    const index = e.currentTarget.dataset.index;
    const steps = this.data.form.steps.filter((_, idx) => idx !== index);
    this.setData({ 'form.steps': steps.length ? steps : [{ content: '' }] });
  },

  onPartInput(e) {
    const index = e.currentTarget.dataset.index;
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.parts[${index}].${field}`]: e.detail.value });
  },

  addPart() {
    const parts = this.data.form.parts.concat({ name: '', qty: '' });
    this.setData({ 'form.parts': parts });
  },

  removePart(e) {
    const index = e.currentTarget.dataset.index;
    const parts = this.data.form.parts.filter((_, idx) => idx !== index);
    this.setData({ 'form.parts': parts.length ? parts : [{ name: '', qty: '' }] });
  },

  onExpenseInput(e) {
    const index = e.currentTarget.dataset.index;
    const field = e.currentTarget.dataset.field;
    this.setData({ [`form.expenses[${index}].${field}`]: e.detail.value });
  },

  addExpense() {
    const expenses = this.data.form.expenses.concat({
      date: '',
      amount: '',
      description: '',
      receipts: [],
    });
    this.setData({ 'form.expenses': expenses });
  },

  removeExpense(e) {
    const index = e.currentTarget.dataset.index;
    const expenses = this.data.form.expenses.filter((_, idx) => idx !== index);
    this.setData({ 'form.expenses': expenses.length ? expenses : [{ date: '', amount: '', description: '', receipts: [] }] });
  },

  async uploadReceipt(e) {
    const index = e.currentTarget.dataset.index;
    try {
      const res = await wx.chooseImage({ count: 1 });
      const filePath = res.tempFilePaths[0];
      const cloudPath = `receipts/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
      const uploadRes = await wx.cloud.uploadFile({
        cloudPath,
        filePath,
      });
      const tempUrlRes = await wx.cloud.getTempFileURL({
        fileList: [uploadRes.fileID],
      });
      const receipt = {
        fileId: uploadRes.fileID,
        url: tempUrlRes.fileList[0].tempFileURL,
      };
      const receiptsKey = `form.expenses[${index}].receipts`;
      const receipts = this.data.form.expenses[index].receipts.concat(receipt);
      this.setData({
        [receiptsKey]: receipts,
      });
    } catch (error) {
      wx.showToast({ title: '上传失败', icon: 'none' });
    }
  },

  onBackupToggle(e) {
    this.setData({ 'form.backupDone': e.detail.value });
  },

  onActualStartChange(e) {
    this.setData({ 'form.actualStart': e.detail.value });
  },

  onActualEndChange(e) {
    this.setData({ 'form.actualEnd': e.detail.value });
  },

  async save() {
    const form = this.data.form;
    const extra = Object.assign({}, (this.data.workOrder && this.data.workOrder.extra) || {}, {
      fault: form.fault,
      result: form.result,
      steps: form.steps,
      parts: form.parts,
      actualStart: form.actualStart,
      actualEnd: form.actualEnd,
    });

    try {
      await api.woUpdate({
        workOrderId: this.data.workOrderId,
        description: form.fault,
        backupDone: form.backupDone,
        extra,
        travelExpenses: form.expenses.map((item) => ({
          ...item,
          amount: Number(item.amount || 0),
        })),
      });
      wx.showToast({ title: '已保存' });
    } catch (error) {
      wx.showToast({ title: error.message || '保存失败', icon: 'none' });
    }
  },

  goSubmit() {
    wx.navigateTo({ url: `/pages/mywo/submit/index?workOrderId=${this.data.workOrderId}` });
  },
});
