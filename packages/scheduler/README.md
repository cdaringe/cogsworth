# cogsworth-scheduler

The `Scheduler` is the backbone of cogsworth.  It's responsible for taking in schedules, executing schedule triggers, piping schedule trigger events down to subscribers, and tidying up expired schedules.

## usage

```js
var Scheduler = require('cogsworth-scheduler')
var scheduler = new Scheduler()
scheduler.start()
.then(triggerStream => { // triggerStream instanceof Observable
  return triggerStream.forEach(({ id, event: { date } }) => {
    console.log(`schedule ${id} fired at ${date}`)
  })
})
```
