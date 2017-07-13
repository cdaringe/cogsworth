'use strict'

var TriggerRrule = require('cogsworth-trigger-rrule')
var TriggerCron = require('cogsworth-trigger-cron')
var JOB_KEYS = ['id', 'description', 'trigger', 'startDate', 'endDate']

module.exports = function toJob (payload) {
  var job = {}
  for (var key of JOB_KEYS) job[key] = payload[key]
  var { trigger, endDate, startDate } = job
  if (!trigger) throw new Error('no trigger available')
  var { vevent, rrule, cron } = trigger
  if (rrule) job.trigger = new TriggerRrule({ rrule, startDate, endDate })
  else if (vevent) {
    try {
      rrule = vevent.match(/rrule:\s*([^\s]+)/i)[1]
    } catch (err) {
      throw new Error('invalid rrule in vevent')
    }
    try {
      startDate = startDate || new Date(vevent.match(/dtstart:\s*([^\s]+)/i)[1])
    } catch (err) {
      // pass
    }
    job.trigger = new TriggerRrule({ rrule, startDate, endDate })
  } else if (cron) job.trigger = new TriggerCron({ cron, startDate, endDate })
  return job
}
