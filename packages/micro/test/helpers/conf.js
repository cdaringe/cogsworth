module.exports = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 9595,
  get origin () {
    return `${this.host}:${this.port}`
  },
  get apiRoot () {
    return `http://${this.origin}/`
  }
}
