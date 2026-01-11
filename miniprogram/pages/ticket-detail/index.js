Page({
  data: {
    ticketId: '',
    ticket: null,
    assigneeId: '',
    scoreToken: '',
    score: 5,
    scoreComment: '',
  },

  onLoad(query) {
    this.setData({ ticketId: query.ticketId || '' });
    if (this.data.ticketId) {
      this.fetchTicket();
    }
  },

  async fetchTicket() {
    const res = await wx.cloud.callFunction({
      name: 'getTicket',
      data: { ticketId: this.data.ticketId },
    });
    this.setData({ ticket: res.result });
  },

  onInput(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [field]: e.detail.value,
    });
  },

  async assignTicket() {
    await wx.cloud.callFunction({
      name: 'assignTicket',
      data: { ticketId: this.data.ticketId, assigneeId: this.data.assigneeId },
    });
    await this.fetchTicket();
  },

  async startProgress() {
    await wx.cloud.callFunction({
      name: 'updateTicket',
      data: { ticketId: this.data.ticketId, status: 'IN_PROGRESS' },
    });
    await this.fetchTicket();
  },

  async submitTicket() {
    await wx.cloud.callFunction({
      name: 'submitTicket',
      data: { ticketId: this.data.ticketId },
    });
    await this.fetchTicket();
  },

  async approveTicket() {
    await wx.cloud.callFunction({
      name: 'approveTicket',
      data: { ticketId: this.data.ticketId },
    });
    await this.fetchTicket();
  },

  async rejectTicket() {
    await wx.cloud.callFunction({
      name: 'rejectTicket',
      data: { ticketId: this.data.ticketId, reason: '信息不完整' },
    });
    await this.fetchTicket();
  },

  async createScoreToken() {
    const res = await wx.cloud.callFunction({
      name: 'scoreToken',
      data: { ticketId: this.data.ticketId },
    });
    this.setData({ scoreToken: res.result.token });
  },

  async submitScoreAsSales() {
    await wx.cloud.callFunction({
      name: 'scoreSubmit',
      data: {
        token: this.data.scoreToken,
        score: Number(this.data.score),
        comment: this.data.scoreComment,
      },
    });
    await this.fetchTicket();
  },
});
