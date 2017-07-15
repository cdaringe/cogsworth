var Koa = require('koa')
var bodyParser = require('koa-bodyparser')
var Scheduler = require('cogsworth-scheduler')
var { get, post, put, delete: del } = require('koa-route')
var PORT = process.env.PORT || 8080
var simpleResponses = require('./simple-responses')
var toSchedule = require('./toSchedule')

module.exports = {
  start (opts) {
    opts = opts || {}
    var port = opts.port || PORT
    var scheduler = this.scheduler = opts.scheduler || new Scheduler()
    var app = new Koa()
    app.use(bodyParser())
    app.use(simpleResponses)
    app.use(get('/', (ctx) => scheduler.getSchedules()))
    app.use(get('/:id', (ctx, id) => scheduler.getSchedule(id)))
    app.use(post('/', (ctx) => scheduler.addSchedule(toSchedule(ctx))))
    app.use(put('/:id', (ctx, id) => {
      return Promise.resolve()
      .then(() => scheduler.deleteSchedule(id))
      .then(() => scheduler.addSchedule(toSchedule(ctx)))
    }))
    app.use(del('/:id', (ctx, id) => scheduler.deleteSchedule(id)))
    console.log(`listening on port ${port}`)
    this.server = app.listen(port)
    return scheduler.start()
  },
  stop () {
    console.log('stopping cogsworth-micro')
    return this.scheduler.stop().then(() => this.server.close())
  }
}
