module.exports = function simpleResponses (ctx, next) {
  return next()
  .then(res => { ctx.body = res })
  .catch(err => {
    ctx.body = { error: err.message }
    ctx.status = err.status || 500
  })
}
