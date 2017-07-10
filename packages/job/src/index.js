'use strict'

var toNull = function () { return null }
var JOB_DEFAULTS = {
  id: function () { return Math.random().toString().substr(2) },
  startDate: function () { return Date.now() },
  trigger: toNull
}

function Job (opts) {
  Job.validate(opts)
  for (var key in JOB_DEFAULTS) {
    this[key] = opts[key] || JOB_DEFAULTS[key]()
  }
}

Job.validate = function validateJob (job) {
  if (!job) throw new Error('missing job options')
  if (!job.trigger) throw new Error('job has no trigger defined')
}

module.exports = Job
