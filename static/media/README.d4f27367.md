# cogsworth-micro

a cogsworth microservice.

rad! :100:

## usage

### launch

```js
require('cogsworth-micro')
.start()
.then(observable => {
  return observable.forEach(evt => {
    const { schedule: { id }, trigger: { date } } = evt
    console.log(`schedule ${id} fired at ${date}`)
  })
})
```

### routes

the following routes are supported:

```js
// get /
// get /:id
// post /
// put /:id
// delete /:id
```

the payload of a schedule is:

```js
// [brackets] imply the field is optional
{
  [id]: 'best_id',
  trigger: { // at least one of the below must be provided
    [cron]: '* * * * * *', // pattern
    [rrule]: 'FREQ=SECONDLY', // pattern
    [vevent]: `
      [DTSTART:2017-07-15T07:41:25.815Z]
      RRULE:FREQ=SECONDLY
    `
  }
}
```

### demo

`node ./example.js`, from the [micro source code](https://github.com/cdaringe/cogsworth/tree/master/packages/micro)

```
🛰  micro$ node example.js
  koa:application use bodyParser +0ms
  koa:application use simpleResponses +2ms
  koa-route GET / -> /^(?:\/(?=$))?$/i +2ms
  koa:application use - +0ms
  koa-route GET /:id -> /^\/((?:[^\/]+?))(?:\/(?=$))?$/i +0ms
  koa:application use - +0ms
  koa-route POST / -> /^(?:\/(?=$))?$/i +0ms
  koa:application use - +0ms
  koa-route PUT /:id -> /^\/((?:[^\/]+?))(?:\/(?=$))?$/i +1ms
  koa:application use - +0ms
  koa-route DELETE /:id -> /^\/((?:[^\/]+?))(?:\/(?=$))?$/i +0ms
  koa:application use - +0ms
listening on port 8080
  koa:application listen +3ms
  cogsworth:Scheduler scheduler state: STARTING +0ms
  cogsworth:Scheduler scheduler state: RUNNING +1ms
```
