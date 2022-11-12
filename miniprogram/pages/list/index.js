/* 藏书列表首页 */

Page({
  // 存储请求结果
  data: {
    empty: false,
    total: 0,
    books: [], // 用户的所有藏书
    loading: false,
    loadmore: false
  },
  onLoad() {
    this.getTotal()
    this.getList()
  },
  async onShow() {
    if (wx.getStorageSync('booksChange')) {
      this.setData({
        books: []
      })
      this.getList()
      wx.setStorageSync('booksChange', false)
    }
  },

  async getTotal() {
    const db = await getApp().database()
    const collection = getApp().globalData.collection
    const countResult = await db.collection(collection).count()
    this.setData({
      total: countResult.total,
      empty: countResult.total === 0
    })
    wx.setNavigationBarTitle({
      title: `嚯~ ${countResult.total}本藏书`,
    })
  },

  async getList(length = 0) {
    // 通过云函数调用获取用户 _openId
    return getApp().getOpenId().then(async openid => {
      const db = await getApp().database()
      const collection = getApp().globalData.collection
      this.setData({
        loading: true
      })
      // 根据 _openId 数据，查询并展示藏书列表
      return db.collection(collection).where({
        _openid: openid
      }).orderBy('createTime', 'desc').skip(length).limit(15).get().then(res => {
        const {
          data
        } = res
        // 存储查询到的数据
        this.setData({
          books: [...this.data.books, ...data]
        })
        this.setData({
          loading: false
        })
      }).catch(_ => {
        this.setData({
          loading: false
        })
      })
    })
  },

  toDetailPage(e) {
    const todoIndex = e.currentTarget.dataset.index
    const todo = this.data.pending[todoIndex]
    wx.navigateTo({
      url: '../detail/index?id=' + todo._id,
    })
  },

  toDetailPage(e) {
    wx.navigateTo({
      url: '/pages/info/index',
      success: function (res) {
        res.eventChannel.emit('bookInfo', e.currentTarget.dataset.item)
      }
    })
  },

  toSreachPage() {
    wx.navigateTo({
      url: '/pages/sreach/index',
    })
  },

  onPullDownRefresh() {
    this.setData({
      books: []
    })
    this.getTotal()
    this.getList().then(() => {
      wx.stopPullDownRefresh()
    }).catch(e => {
      wx.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    this.setData({
      loadmore: true
    })
    if (this.data.total > this.data.books.length) {
      this.getList(this.data.books.length).then(_ => {
        this.setData({
          loadmore: false
        })
      }).catch(e => {
        this.setData({
          loadmore: false
        })
      })
    }
  }
})