var Koa = require('koa')
var bodyParser = require('koa-bodyparser')
var Scheduler = require('cogsworth-scheduler')
var { get, post, put, delete: del } = require('koa-route')
var scheduler = new Scheduler()
var port = process.env.PORT || 8080
var simpleResponses = require('./simple-responses')
var toJob = require('./toJob')

module.exports = {
  start () {
    var app = new Koa()
    app.use(bodyParser())
    app.use(simpleResponses)
    app.use(get('/', (ctx) => scheduler.getJobs()))
    app.use(get('/:id', (ctx, id) => scheduler.get(id)))
    app.use(post('/', (ctx) => scheduler.addJob(toJob(ctx))))
    app.use(put('/:id', (ctx, id) => {
      return Promise.resolve()
      .then(() => scheduler.deleteJob(id))
      .then(() => scheduler.addJob(toJob(ctx)))
    }))
    app.use(del('/:id', (ctx, id) => scheduler.deleteJob(id)))
    app.listen(port)
    console.log(`listening on port ${port}`)
    return scheduler.start()
  }
}
