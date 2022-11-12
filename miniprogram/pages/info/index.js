// pages/info/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookDetail: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('bookInfo', (data) => {
      this.setData({
        bookDetail: data
      })
    })
  },

  removeBook() {
    wx.showModal({
      title: '提示',
      content: '确认移除本书',
      complete: async (res) => {
        if (res.confirm) {
          const db = await getApp().database()
          const collection = getApp().globalData.collection
          db.collection(collection).doc(this.data.bookDetail._id).remove()
            .then(res => {
              console.log(res);
              if (res.stats.removed === 1) {
                wx.showToast({
                  title: '操作成功',
                  duration: 800,
                  complete() {
                    setTimeout(_ => {
                      wx.setStorageSync('booksChange', true)
                      wx.navigateBack()
                    }, 800)
                  }
                })
              }
            })
            .catch(console.error)
        }
      }
    })
  },
})