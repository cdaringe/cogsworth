'use strict'

var TriggerRrule = require('cogsworth-trigger-rrule')
var TriggerCron = require('cogsworth-trigger-cron')
var SCHEDULE_KEYS = ['id', 'description', 'trigger', 'startDate', 'endDate', 'tourist']

function validateTrigger (ctx, trigger) {
  var xor = 0
  if (!trigger) return ctx.throw(400, 'no full trigger definition provided')
  var { vevent, rrule, cron } = trigger
  ;[vevent, rrule, cron].forEach(val => { if (val) ++xor })
  if (xor !== 1) ctx.throw(400, 'exactly one vevent, rrule, cron is required')
}

module.exports = function toSchedule (ctx) {
  var payload = ctx.request.body
  var schedule = {}
  if (!payload) return ctx.throw(400, 'no schedule provided')
  for (var key of SCHEDULE_KEYS) schedule[key] = payload[key]
  var { trigger, endDate, startDate } = schedule
  validateTrigger(ctx, trigger)
  var { vevent, rrule, cron } = trigger
  if (rrule || vevent) {
    if (vevent) {
      try {
        rrule = vevent.match(/rrule:\s*([^\s]+)/i)[1].trim()
      } catch (err) {
        return ctx.throw(400, 'invalid rrule in vevent')
      }
      try {
        startDate = startDate || new Date(vevent.match(/dtstart:\s*([^\s]+)/i)[1].trim())
      } catch (err) {
        // pass
      }
    }
    try {
      schedule.trigger = new TriggerRrule({ rrule, startDate, endDate })
    } catch (err) {
      return ctx.throw(400, 'unable to create RRULE trigger. please inspect your RRULE. failure: ' + err.message)
    }
  } else if (cron) {
    try {
      schedule.trigger = new TriggerCron({ cron, startDate, endDate })
    } catch (err) {
      return ctx.throw(400, 'unable to create cron trigger. please inspect your cron. failure: ' + err.message)
    }
  } else {
    return ctx.throw(500, 'no recurrence to build trigger from')
  }
  return schedule
}
