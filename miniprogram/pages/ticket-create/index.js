Page({
  data: {
    title: '',
    description: '',
    customer: '',
    backupDone: false,
    travelExpenses: [
      {
        date: '',
        amount: '',
        description: '',
        receipts: [],
      },
    ],
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value,
    });
  },

  onToggleBackup(e) {
    this.setData({
      backupDone: e.detail.value,
    });
  },

  onExpenseInput(e) {
    const index = e.currentTarget.dataset.index;
    const field = e.currentTarget.dataset.field;
    const key = `travelExpenses[${index}].${field}`;
    this.setData({
      [key]: e.detail.value,
    });
  },

  addExpense() {
    const next = this.data.travelExpenses.concat({
      date: '',
      amount: '',
      description: '',
      receipts: [],
    });
    this.setData({ travelExpenses: next });
  },

  async uploadReceipt(e) {
    const index = e.currentTarget.dataset.index;
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
    const receiptsKey = `travelExpenses[${index}].receipts`;
    const receipts = this.data.travelExpenses[index].receipts.concat(receipt);
    this.setData({
      [receiptsKey]: receipts,
    });
  },

  async submitTicket() {
    const payload = {
      title: this.data.title,
      description: this.data.description,
      customer: this.data.customer,
      backupDone: this.data.backupDone,
      travelExpenses: this.data.travelExpenses.map((item) => ({
        ...item,
        amount: Number(item.amount),
      })),
    };

    const res = await wx.cloud.callFunction({
      name: 'createTicket',
      data: payload,
    });

    wx.showToast({ title: '已创建' });
    wx.navigateTo({
      url: `/pages/ticket-detail/index?ticketId=${res.result.ticketId}`,
    });
  },
});
