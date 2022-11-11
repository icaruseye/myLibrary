/* 应用下方新增按钮栏组件 */

Component({
  properties: {
    _id: String
  },
  methods: {
    onClick() {
      wx.navigateTo({
        url: '../../pages/scan/index',
      })
    }
  }
})