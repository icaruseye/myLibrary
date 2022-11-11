/* 藏书列表首页 */

Page({
  // 存储请求结果
  data: {
    dialogVisible: false,
    empty: false,
    total: 0,
    books: [], // 用户的所有藏书
    bookDetail: {}
  },
  onLoad() {
  },
 async onShow() {
    this.getList(this.data.books.length)
  },

  async getList(length = 0) {
    // 通过云函数调用获取用户 _openId
    wx.showLoading()
    const db = await getApp().database()
    const collection = getApp().globalData.collection
    const countResult = await db.collection(collection).count()
    this.setData({
      total: countResult.total
    })
    wx.setNavigationBarTitle({
      title: `嚯~ ${countResult.total}本藏书`,
    })
    return getApp().getOpenId().then(async openid => {
      // 根据 _openId 数据，查询并展示藏书列表
      db.collection(collection).where({
        _openid: openid
      }).skip(length).limit(15).get().then(res => {
        const {
          data
        } = res
        // 存储查询到的数据
        this.setData({
          books: [...this.data.books, ...data],
          empty: countResult.total === 0
        })
      })
    }).finally(_ => {
      wx.hideLoading()
    })
  },

  toDetailPage(e) {
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.pending[todoIndex]
    wx.navigateTo({
      url: '../detail/index?id=' + todo._id,
    })
  },

  showDetail(e) {
    this.setData({
      dialogVisible: true,
      bookDetail: e.currentTarget.dataset.item
    })
  },

  onClose() {
    this.setData({
      dialogVisible: false
    })
  },

  onPullDownRefresh() {
    this.setData({
      books: []
    })
    this.getList().then(() => {
      wx.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    if (this.data.total > this.data.books.length) {
      this.getList(this.data.books.length)
    }
  }
})