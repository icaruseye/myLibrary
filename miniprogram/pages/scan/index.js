// pages/scan/index.js
const apiKey = '14073.8b6928465dbf02b61e4c862b321357c4.b26772be2b60b24935bcfeb477449bf7'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    scanFunctionIsUseAble: true,
    result: '',
    books: [],
    codeList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },
  takeCode(e) {
    if (this.data.scanFunctionIsUseAble) {
      const code = e.detail.result
      if (!this.data.codeList.includes(code)) {
        wx.showToast({
          title: code,
          icon: 'none',
          duration: 1000,
        })
        this.setData({
          scanFunctionIsUseAble: false,
        })
        this.getBookInfo(e.detail.result).then(res => {
          this.setData({
            codeList: this.data.codeList.concat(code),
            books: [{
              id: res.data.id,
              name: res.data.name,
              author: res.data.author,
              photoUrl: res.data.photoUrl,
              publishing: res.data.publishing,
              published: res.data.published,
              translator: res.data.translator,
              designed: res.data.designed,
              translator: res.data.translator,
              pages: res.data.pages,
              price: res.data.price,
            }, ...this.data.books]
          })
        }).catch(e => {
          wx.showToast({
            title: '书籍查询失败',
            duration: 1000,
            icon: 'error'
          })
        }).finally(_ => {
          setTimeout(_ => {
            this.setData({
              scanFunctionIsUseAble: true,
            })
          }, 1000 * 2)
        })
      } else {
        wx.showToast({
          title: '已存在！',
          duration: 1000,
          icon: 'none'
        })
      }
    }
  },

  getBookInfo(ISBN) {
    return new Promise((resolve, reject) => {
      // wx.showLoading()
      wx.request({
        url: `https://api.jike.xyz/situ/book/isbn/${ISBN}?apikey=${apiKey}`,
        success: (res) => {
          if (res.data.data) {
            resolve(res.data)
          } else {
            reject(res)
          }
        },
        fail: (err) => {
          reject(err)
        },
        complete: () => {
          // wx.hideLoading()
        }
      })
    })
  },
  collection() {
    if (this.data.books.length > 0) {
      const old = wx.getStorageSync('books') || []
      const oldCodes = old.map(item => item.id)
      this.data.books.forEach(item => {
        if (!oldCodes.includes(item.id)) {
          old.push(item)
        }
      })
      wx.setStorageSync('books', old)
      this.setData({
        books: [],
        codeList: []
      })
      wx.showToast({
        title: '操作成功',
        icon: 'success'
      })
    } else {
      wx.showToast({
        title: '还未添加书籍',
        icon: 'none'
      })
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})