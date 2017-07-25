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
    app.use(put('/:id', async function (ctx, id) {
      await scheduler.deleteSchedule(id)
      return scheduler.addSchedule(toSchedule(ctx))
    }))
    app.use(del('/:id', (ctx, id) => scheduler.deleteSchedule(id)))
    this.server = app.listen(port)
    console.log(`listening on port ${port}`)
    return scheduler.start()
  },
  async stop () {
    console.log('stopping cogsworth-micro')
    await this.scheduler.stop()
    this.server.close()
  }
}
