App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('基础库 2.2.3 以上才支持云能力');
      return;
    }
    wx.cloud.init({
      traceUser: true,
    });
  },
});
