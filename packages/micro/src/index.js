'use strict'

var _ = require('koa-route')
var Koa = require('koa')
var app = new Koa()
var bodyParser = require('koa-bodyparser')
var Scheduler = require('cogsworth-scheduler')
var scheduler = new Scheduler()
var port = process.env.PORT || 8080
var toJob = require('./toJob')

var micro = {
  start () {
    app.use(bodyParser())
    app.use((ctx, next) => next().then(r => (ctx.body = r)))
    app.use(_.get('/', ctx => {
      return scheduler.getJobs()
    }))
    app.use(_.get('/:id', (ctx, id) => scheduler.get(id)))
    app.use(_.post('/', (ctx) => {
      return scheduler.addJob(toJob(ctx.request.body))
    }))
    app.use(_.put('/:id', (ctx, id) => {
      return Promise.resolve()
      .then(() => scheduler.deleteJob(id))
      .then(() => scheduler.addJob(toJob(ctx.request.body)))
    }))
    app.use(_.delete('/:id', (ctx, id) => scheduler.deleteJob(id)))

    app.listen(port)
    console.log(`listening on port ${port}`)
    return scheduler.start()
  }
}

module.exports = micro

// example
process.env.DEBUG = '*'
micro.start()
.then(triggerStream => {
  return triggerStream.forEach(arg => {
    console.log(arg)
  })
})
