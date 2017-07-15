'use strict'

var TriggerRrule = require('cogsworth-trigger-rrule')
var TriggerCron = require('cogsworth-trigger-cron')
var JOB_KEYS = ['id', 'description', 'trigger', 'startDate', 'endDate']

module.exports = function toJob (ctx) {
  var payload = ctx.request.body
  var job = {}
  for (var key of JOB_KEYS) job[key] = payload[key]
  var { trigger, endDate, startDate } = job
  var { vevent, rrule, cron } = trigger
  if (!trigger || (!vevent && !rrule && !cron)) return ctx.throw(400, 'no full trigger definition provided')
  if (rrule) {
    job.trigger = new TriggerRrule({ rrule, startDate, endDate })
  } else if (vevent) {
    try {
      rrule = vevent.match(/rrule:\s*([^\s]+)/i)[1]
    } catch (err) {
      return ctx.throw(400, 'invalid rrule in vevent')
    }
    try {
      startDate = startDate || new Date(vevent.match(/dtstart:\s*([^\s]+)/i)[1])
    } catch (err) {
      // pass
    }
    try {
      job.trigger = new TriggerRrule({ rrule, startDate, endDate })
    } catch (err) {
      return ctx.throw(500, 'unable to create RRULE trigger. please inspect your RRULE. failure: ' + err.message)
    }
  } else if (cron) {
    try {
      job.trigger = new TriggerCron({ cron, startDate, endDate })
    } catch (err) {
      return ctx.throw(500, 'unable to create cron trigger. please inspect your cron. failure: ' + err.message)
    }
  } else {
    return ctx.throw(500, 'no recurrence to build trigger from')
  }
  return job
}
