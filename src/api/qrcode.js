import http from '@/utils/http-client'
const collection = 'qrcode'

export function getHDDT(params) {
  // return new Promise((resolve, reject) => {
  return http.post(collection, params)
  // .then((res) => {
  //   resolve(res)
  // })
  // .catch((err) => {
  //   message.error(err)
  // })
  // .finally(() => {
  //   if (callback) callback()
  // })
  // })
}
