const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
exports.main = async (event, context) => {
  const list = event.list
  try {
    return await db.collection('books').add({
      data: list
    })
  } catch (e) {
    console.error(e)
  }
}