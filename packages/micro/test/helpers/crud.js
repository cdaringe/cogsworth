var conf = require('./conf')
var axios = require('axios')

var extractData = ({ data }) => {
  return data
}
module.exports = {
  post (schedule) {
    return axios.post(conf.apiRoot, schedule).then(extractData)
  },
  get (id) {
    return axios.get(conf.apiRoot + (id || '')).then(extractData)
  },
  put (schedule) {
    return axios.put(conf.apiRoot + (schedule.id || ''), schedule).then(extractData)
  },
  delete (schedule) {
    return axios.delete(conf.apiRoot + schedule.id).then(extractData)
  }
}
