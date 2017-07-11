'use strict'

var Trigger = require('@cogsworth/trigger').Trigger
var CronEmitter = require('cron-emitter')
var debug = require('debug')('cogsworth:TriggerCron')

function TriggerCron (opts) {
  Trigger.call(this, opts)
  if (!opts.cron || typeof opts.cron !== 'string') {
    throw new Error('cron string required')
  }
  this.cron = opts.cron
  this.cronName = 'CRON_TRIGGER_' + ++TriggerCron.id
  this.emitter = new CronEmitter()
}
TriggerCron.prototype = Object.create(Trigger.prototype)
TriggerCron.prototype.constructor = TriggerCron

TriggerCron.prototype.start = function () {
  debug('starting cron: ' + this.cron)
  this.emitter.add(this.cron, this.cronName, {
    endDate: this.endDate,
    startDate: this.startDate
  })
  this.emitter.on(this.cronName, function () {
    var date = new Date()
    debug('cron trigger fired: ' + this.cron + ' (' + date.toISOString() + ')')
    this.observer.next(date)
  }.bind(this))
  this.emitter.on('ended', this.stop.bind(this))
  Trigger.prototype.start.call(this)
}

TriggerCron.prototype.stop = function () {
  debug('stopping cron: ' + this.cron)
  try {
    this.emitter.remove(this.cronName)
  } catch (err) {
    // pass
  }
  Trigger.prototype.stop.call(this)
}
TriggerCron.id = 0

module.exports = TriggerCron
