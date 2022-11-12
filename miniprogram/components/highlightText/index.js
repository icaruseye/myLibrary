Component({
  properties: {
    text: {
      type: String,
      observer: "_propertyDataChange"
    },
    words: {
      type: String,
    },
  },
  methods: {
    _propertyDataChange: function (newVal) {
      let searchArray = this.getHilightStrArray(newVal, this.data.words)
      this.setData({
        keyName: this.data.words,
        searchArray: searchArray
      })
    },

    getHilightStrArray: function (str, key) {
      return str.replace(new RegExp(`${key}`, 'g'), `%%${key}%%`).split('%%');
    }
  }
})