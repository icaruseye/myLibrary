// pages/scan/index.js
import {
  formatDate
} from '../../util.js'
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
  onLoad(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  async onShow() {},
  async takeCode(e) {
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
        try {
          const db = await getApp().database()
          const openid = getApp().globalData.openid
          const isExist = await db.collection(getApp().globalData.collection).where({
            _openid: openid,
            id: Number(code)
          }).get().then(res => res.data)
          if (isExist.length) {
            wx.showToast({
              title: '已收藏此书',
              duration: 1000,
              icon: 'none'
            })
          } else {
            const bookInfo = await this.getBookInfo(e.detail.result).then(res => res.data)
            bookInfo.collectionTime = formatDate(new Date(), 'yyyy-MM-dd')
            this.setData({
              codeList: this.data.codeList.concat(code),
              books: [bookInfo, ...this.data.books]
            })
          }
          setTimeout(_ => {
            this.setData({
              scanFunctionIsUseAble: true,
            })
          }, 1000 * 1)
        } catch (error) {
          wx.showToast({
            title: '查询失败',
            duration: 1000,
            icon: 'error'
          })
          this.setData({
            scanFunctionIsUseAble: true,
          })
        }
      } else {
        wx.showToast({
          title: '已扫描此书',
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

  async addBooks() {
    if (this.data.books.length === 0) return false
    wx.showLoading({
      title: '录入中',
    })
    wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'addBook',
      // 传给云函数的参数
      data: {
        list: this.data.books.map(i => {
          return {
            ...i,
            _openid: getApp().globalData.openid
          }
        }).reverse()
      },
      // 成功回调
    }).then((res) => {
      console.log(res);
      wx.showToast({
        title: '添加成功',
        complete() {
          wx.navigateBack()
        }
      })
    }).catch((e) => {
      console.log(e);
      wx.showToast({
        title: '添加失败!',
        icon: 'error'
      })
    }).finally(_ => {
      wx.hideLoading()
    })
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