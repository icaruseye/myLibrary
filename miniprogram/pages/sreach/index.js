Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    books: [],
    author: [],
    total: 0,
    key: '',
    title: '',
    empty: false,
    loading: false,
    loadmore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {},

  async onSearch(e) {
    this.setData({
      key: e.detail.trim(),
      books: []
    })
    this.queryBook()
    this.queryTotal()
  },

  async queryBook(length = 0, limit = 7) {
    const key = this.data.key
    if (!key.length) return
    const db = await getApp().database()
    const collection = getApp().globalData.collection
    const _ = db.command
    const query = this.data.active === 0 ? {
      name: db.RegExp({
        regexp: '.*' + key,
      })
    } : {
      author: db.RegExp({
        regexp: '.*' + key,
      })
    }
    return getApp().getOpenId().then(async openid => {
      this.setData({
        loading: true
      })
      return db.collection(collection).where({
        _openid: openid,
        ...query
      }).skip(length).limit(limit).get().then(res => {
        const {
          data
        } = res
        // 存储查询到的数据
        this.setData({
          books: [...this.data.books, ...data],
        })
        this.setData({
          loading: false
        })
      }).catch(e => {
        this.setData({
          loading: false
        })
      })
    })
  },

  async queryTotal() {
    const key = this.data.key
    const db = await getApp().database()
    const _ = db.command
    const collection = getApp().globalData.collection
    const query = this.data.active === 0 ? {
      name: db.RegExp({
        regexp: '.*' + key,
      })
    } : {
      author: db.RegExp({
        regexp: '.*' + key,
      })
    }
    const countResult = await db.collection(collection).where(query).count()
    this.setData({
      total: countResult.total,
      empty: countResult.total === 0
    })
    wx.setNavigationBarTitle({
      title: countResult.total > 0 ? `嚯~ 搜到${countResult.total}本` : `哦嚯没得~`,
    })
  },

  onSreachChange (e) {
    this.setData({
      key: e.detail,
    })
  },

  onTabChange(e) {
    this.setData({
      active: e.detail.index,
      books: []
    })
    if (this.data.key) {
      this.queryBook()
      this.queryTotal()
    }
  },

  onReachBottom() {
    if (this.data.total > this.data.books.length) {
      this.setData({
        loadmore: true
      })
      this.queryBook(this.data.books.length).then(_ => {
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