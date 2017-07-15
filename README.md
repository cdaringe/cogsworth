# cogsworth

easy &amp; capable scheduling for node &amp; the browser

https://app.codeship.com/projects/e6cd4ce0-4bd1-0135-2de1-02fedcef81c5/status?branch=master

<img src="https://github.com/cdaringe/cogsworth/blob/master/img/cogsworth.gif?raw=true" alt="cogsworth" />

## what

a scheduling suite.  use it to:

- load events, recurrences, or intervals into the system
  - you get [cron](https://en.wikipedia.org/wiki/Cron) & [iCalendar](https://icalendar.org/) support out of the box
- have the system emit an event or call a function when a scheduled event is triggered

for example,

- "make an API call every 10 minutes"
- "run a backup every month"
- "call my sister every 20 seconds"

it ships with:

- a [`Scheduler`](https://github.com/cdaringe/cogsworth/tree/master/packages/scheduler)
  - inspired by the all-to-rad Java Quartz scheduler
- a [`micro`](https://github.com/cdaringe/cogsworth/tree/master/packages/micro)service
  - an easy plug-n-play REST API to load & interact with schedule ticks
- various [extendable scheduling primatives](https://github.com/cdaringe/cogsworth/tree/master/packages) used by the scheduler, such as the Trigger, Schedule, & Storage interfaces (with base classes).

## demo

see [the docsite](https://cdaringe.github.io/cogsworth)

## usage

```javascript
var Scheduler = require('cogsworth-scheduler')
var TriggerRrule = require('cogsworth-trigger-rrule') // e.g. iCal

// create a scheduler & a schedule
var scheduler = new Scheduler()
var schedule = {
  id: 'best_schedule',
  trigger: new TriggerRrule({
    rrule: 'FREQ=SECONDLY;COUNT=5'
  })
}

// add the schedule, start the scheduler, and watch the events stream thru
scheduler.addSchedule(schedule)
.then(scheduler.start.bind(scheduler))
.then(function (observable) {
  observable.subscribe(function logEvent (evt) {
    console.log(evt.schedule.id, evt.trigger.date)
    // best_schedule 2017-07-10T07:26:38.082Z
    // best_schedule 2017-07-10T07:26:39.000Z
    // best_schedule 2017-07-10T07:26:40.000Z
    // best_schedule 2017-07-10T07:26:41.000Z
    // best_schedule 2017-07-10T07:26:42.000Z
  })
})
```

some users may not care for the observable syntax, and may use the following instead:

```js
var scheduler = new Scheduler({
  onTick: function (evt) {
    console.log(evt.schedule.id, evt.trigger.date)
  }
})
scheduler.addSchedule(...).then(scheduler.start.bind(scheduler))
```

this is a boring example with only one schedule.  add as many schedules as you desire!

