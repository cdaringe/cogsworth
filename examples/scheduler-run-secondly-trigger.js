var Scheduler = require('../packages/scheduler/').Scheduler
var TriggerRrule = require('../packages/trigger-rrule') // e.g. iCal
var scheduler = new Scheduler()
scheduler.addJob({
  id: 'best_job',
  trigger: new TriggerRrule({
    rrule: 'FREQ=SECONDLY;COUNT=5'
  })
})
.then(scheduler.start.bind(scheduler))
.then(function (observable) {
  observable.subscribe(function logEvent (evt) {
    console.log(evt.job.id, evt.trigger.date)
  })
})
