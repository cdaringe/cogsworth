'use strict'

process.env.DEBUG = '*'
var test = require('ava').test
var conf = require('./helpers/conf')
var crud = require('./helpers/crud')
var scheduleFactory = require('./helpers/schedule-factory')
var micro = require('../')

test.beforeEach(async function (t) {
  var obs = await micro.start({ port: conf.port })
  obs.forEach(i => i) // console.log(i))
})
test.afterEach.always(t => micro.stop())

test.serial('crud', function (t) {
  var schedule = scheduleFactory()
  return Promise.resolve()
  .then(() => crud.post(schedule))
  .then((scheduled) => {
    t.truthy(scheduled.id, 'has schedule id')
    t.truthy(scheduled.trigger, 'has schedule trigger')
    return crud.get()
  })
  .then((schedules) => t.truthy(schedules.length === 1, 'schedule loaded'))
  .then(() => {
    schedule.id = 'bananas'
    return crud.post(schedule)
  })
  .then((scheduled) => {
    t.is(scheduled.id, 'bananas', 'accepts schedule id')
    return crud.get('bananas')
  })
  .then((scheduled) => {
    t.is(scheduled.id, 'bananas', 'gets schedule by id')
    return crud.post(Object.assign({}, schedule, { id: 'oranges' }))
  })
  .then(() => crud.get())
  .then((schedules) => {
    var toPatch = schedules[0]
    toPatch.trigger = { cron: '*/60 * * * * *' }
    t.truthy(schedules.length === 3, 'schedules loaded')
    return crud.put(toPatch)
  })
  .then(() => crud.get())
  .then((schedules) => {
    t.truthy(schedules.some(s => s.trigger.cron), 'put swapped a thingy for a cron')
    t.truthy(schedules.length === 3, 'schedules still loaded')
    return crud.delete(schedules[0])
  })
  .then(() => crud.get())
  .then((schedules) => t.truthy(schedules.length === 2, 'schedules deleted'))
})

test.serial('post biffs', function (t) {
  return Promise.resolve()
  .then(() => crud.post(null))
  .catch(err => t.is(err.request.res.statusCode, 400, '400s on bad post'))
  .then(() => crud.post({}))
  .catch(err => t.is(err.request.res.statusCode, 400, '400s on bad post'))
  .then(() => crud.post(scheduleFactory()))
  .then((schedule) => crud.post(schedule))
  .catch(err => t.is(err.request.res.statusCode, 400, 'no dupes'))
  .then(() => {
    // double trigger
    var schedule = scheduleFactory()
    schedule.trigger = { cron: ' ', rrule: ' ' }
    return crud.post(schedule)
  })
  .catch(err => t.is(err.request.res.statusCode, 400, 'no double triggers'))
  .then(() => {
    // bad rrule trigger
    var schedule = scheduleFactory()
    schedule.trigger = { rrule: 'BAD' }
    return crud.post(schedule)
  })
  .catch(err => t.is(err.request.res.statusCode, 400, 'no bad rrule'))
  .then(() => {
    // bad cron trigger
    var schedule = scheduleFactory()
    schedule.trigger = { cron: 'BAD' }
    return crud.post(schedule)
  })
  .catch(err => t.is(err.request.res.statusCode, 400, 'no bad cron'))
})
