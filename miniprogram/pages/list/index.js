/* 藏书列表首页 */

Page({
  // 存储请求结果
  data: {
    books: [], // 用户的所有藏书
  },
  onLoad() {
  },
  onShow() {
    this.setData({
      books: wx.getStorageSync('books')
    })
    // 通过云函数调用获取用户 _openId
    // getApp().getOpenId().then(async openid => {
    //   // 根据 _openId 数据，查询并展示藏书列表
    //   const db = await getApp().database()
    //   db.collection(getApp().globalData.collection).where({
    //     _openid: openid
    //   }).get().then(res => {
    //     const {
    //       data
    //     } = res
    //     // 存储查询到的数据
    //     this.setData({
    //       books: data,
    //     })
    //   })
    // })
  },

  toDetailPage(e) {
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.pending[todoIndex]
    wx.navigateTo({
      url: '../detail/index?id=' + todo._id,
    })
  },

})