# cogsworth-schedule

`Schedule` is an _optional_ but recommended base class for using schedules in cogsworth.

Any schedules you pass to cogsworth will eventually be cast into a Schedule instance.

It provides very little value outside of providing a default id.

A schedule of cogsworth has an `id`, a [`trigger`](https://github.com/cdaringe/cogsworth/tree/master/packages/trigger), & a `tourist`.  `tourist` is additional data that you can pass that cogsworth takes along for the ride!

## usage

```js
var Schedule = require('cogsworth-schedule')
var schedule = new Schedule({
  [id]: 'some_id',
  trigger: <Trigger>,
  [tourist]: { ... }
})
```
