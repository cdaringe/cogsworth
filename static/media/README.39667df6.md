# cogsworth-trigger

`Trigger`s' role in cogsworth are to stream events to the scheduler whenever a schedule fires or ticks.

- A schedule for a single event will have a trigger that ticks once.
- A schedules for a weekly event will stream a tick to the scheduler every week.

The concept isn't complicated, but different syntaxes overlap in their capability to express the wide range of recurrence intervals users may want to express.  `cron` and `rrule`s cover most of the use cases, so those specific trigger implementations are provided by default in sibling packages.

## interface

### properties

- `stream` // RxJs Observable
- [`startDate`] // Date, [default `new Date()`]
- ['endDate`] // Date, [default, null]

### methods

- `start` // undefined, must be called if "inherited" from
- `stop` // undefined, must be called if "inherited" from

## how do i write my own trigger?

it's pretty easy!

see `./SimpleTrigger` for a basic example, or [cogsworth-trigger-cron](https://github.com/cdaringe/cogsworth/tree/master/packages/trigger-cron) & [cogsworth-trigger-rrule](https://github.com/cdaringe/cogsworth/tree/master/packages/trigger-rrule) for examples.
