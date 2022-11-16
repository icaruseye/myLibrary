import {
  formatDate
} from '../../util.js'
const apiKey = '14073.8b6928465dbf02b61e4c862b321357c4.b26772be2b60b24935bcfeb477449bf7'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputDialogVisble: false,
    scanFunctionIsUseAble: true,
    result: '',
    books: [],
    codeList: [],
    loading: false,
    sreachBook: {},
    isbn: ''
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
    const code = e.detail.result
    // 简单验证ISBN，非ISBN或识别错误不进入后续逻辑
    if (!/^(978\d{10}|\d{10})$/.test(code)) return
    if (!this.data.scanFunctionIsUseAble) return
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
        const isExist = await this.isExistBook(code)
        if (!isExist) {
          const bookInfo = await this.getBookInfo(code)
          await this.addBooks(bookInfo)
          setTimeout(_ => {
            this.setData({
              scanFunctionIsUseAble: true,
            })
          }, 1000 * 1)
        } else {
          this.setData({
            scanFunctionIsUseAble: true,
          })
        }
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
  },

  getBookInfo(ISBN) {
    return new Promise((resolve, reject) => {
      // wx.showLoading()
      wx.request({
        url: `https://api.jike.xyz/situ/book/isbn/${ISBN}?apikey=${apiKey}`,
        success: (res) => {
          if (res.data.data) {
            res.data.data.collectionTime = formatDate(new Date(), 'yyyy-MM-dd')
            res.data.data.createTime = formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
            resolve(res.data.data)
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

  // 添加到数据库
  async addBooks(book) {
    wx.showLoading({
      title: '录入中',
    })
    return wx.cloud.callFunction({
      // 需调用的云函数名
      name: 'addBook',
      // 传给云函数的参数
      data: {
        ...book,
        _openid: getApp().globalData.openid
      },
      // 成功回调
    }).then((res) => {
      this.setData({
        codeList: this.data.codeList.concat(book.id),
        books: [book, ...this.data.books]
      })
      wx.setStorageSync('booksChange', true)
    }).catch((e) => {
      wx.hideLoading()
      wx.showToast({
        title: '添加失败!',
        icon: 'error'
      })
    }).finally(_ => {
      wx.hideLoading()
      this.setData({
        loading: false
      })
    })
  },

  // 验证是否已存在于书架
  async isExistBook(code) {
    const db = await getApp().database()
    const isExist = await db.collection(getApp().globalData.collection).where({
      id: Number(code)
    }).get().then(res => res.data)
    if (isExist.length) {
      wx.showToast({
        title: '已收藏此书',
        duration: 1000,
        icon: 'none'
      })
      return true
    }
    return false
  },

  // 添加搜索的书籍
  async addSreachBook() {
    const book = this.data.sreachBook
    await this.addBooks(book)
    this.onInputClose()
  },

  back() {
    wx.navigateBack()
  },

  showInput() {
    this.setData({
      inputDialogVisble: true
    })
  },

  onInputClose() {
    this.setData({
      inputDialogVisble: false
    })
  },

  async onInputConfirm() {
    const isbn = this.data.isbn.trim()
    if (/^(978\d{10}|\d{10})$/.test(isbn)) {
      const isExist = await this.isExistBook(isbn)
      if (!isExist) {
        this.getBookInfo(isbn).then(res => {
          this.setData({
            sreachBook: res
          })
        })
      }
    } else {
      wx.showToast({
        title: 'ISBN不正确',
        icon: 'none'
      })
    }
  },
})