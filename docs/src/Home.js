import React, { Component } from 'react'
import * as Scheduler from '../../packages/scheduler/'
import * as TriggerCron from '../../packages/trigger-cron/'
import * as TriggerRrule from '../../packages/trigger-rrule/'
import ScheduleAdder from './ScheduleAdder'
import { loadDemoChart } from './util/demo'
import marked from 'marked'
import Paper from 'material-ui/Paper'
import Divider from 'material-ui/Divider'
import map from 'lodash/map'
const projectMd = require('raw-loader!cogsworth/README.md') // eslint-disable-line

const demoIntroMd = `Use the above form to add/remove schedules from the demo.

For demo purposes, you can enter schedules in either [cron](https://en.wikipedia.org/wiki/Cron/) syntax or the standard [iCalendar](https://icalendar.org/) [RRULE](https://jakubroztocil.github.io/rrule/) awesome syntax!
`

export default class Home extends Component {
  constructor (props) {
    super(props)
    this.scheduler = window.scheduler = new Scheduler()
    this.everySecondCronSchedule = {
      id: 'every second',
      trigger: new TriggerCron({ cron: '* * * * * *' })
    }
    this.everyThreeSecondRruleSchedule = {
      id: 'every 3rd second',
      trigger: new TriggerRrule({ rrule: 'FREQ=SECONDLY;INTERVAL=3' })
    }
    this.state = {
      schedules: {}
    }
  }

  addSchedule (schedule) {
    return this.scheduler.addSchedule(schedule).then(schedule => {
      var state = Object.assign({}, this.state)
      var newSchedule = Object.assign({}, schedule, {
        data: [],
        series: this.chart.addSeries({
          name: schedule.id
        })
      })
      state.schedules[schedule.id] = newSchedule
      this.setState(state)
    })
  }

  removeSchedule (schedule) {
    return this.scheduler.deleteSchedule(schedule.id)
    .then(() => {
      var state = Object.assign({}, this.state)
      state.schedules[schedule.id].series.remove()
      delete state.schedules[schedule.id]
      this.setState(state)
    })
  }

  subscribe (obs) {
    var onScreenDuration = 5000
    obs.subscribe(sched => {
      var scheduleId = sched.id
      var schedule = this.state.schedules[scheduleId]
      var tickDate = new Date(sched.event.date)
      schedule.data.push(tickDate)
      schedule.series.addPoint([tickDate.getTime(), 0], true)
      var lagDate = new Date(tickDate.getTime() - onScreenDuration)
      this.chart.xAxis[0].setExtremes(lagDate.getTime(), tickDate.getTime())
      setTimeout(function (scheduleId) {
        var purgeThru = new Date(Date.now() - onScreenDuration)
        var schedule = this.state.schedules[scheduleId]
        if (!schedule) return
        while (schedule.data[0] && schedule.data[0].getTime() <= purgeThru) {
          schedule.data.shift()
          schedule.series.removePoint(0)
        }
      }.bind(this, scheduleId), onScreenDuration)
    })
  }
  componentDidMount () {
    return loadDemoChart(hc => {
      this.chart = hc
      return Promise.resolve()
      .then(() => this.addSchedule(this.everySecondCronSchedule))
      .then(() => this.addSchedule(this.everyThreeSecondRruleSchedule))
      .then(schedule => this.scheduler.start())
      .then(obs => this.subscribe(obs))
    })
  }
  render () {
    const subtitle = '#### a javascript scheduling suite for [node.js](https://nodejs.org/en/) and the browser'
    return (
      <Paper className='content'>
        <h1>Cogsworth</h1>
        <div dangerouslySetInnerHTML={{ __html: marked(subtitle) }} />
        <div id='chart' />
        <form style={{textAlign: 'center'}}>
          <ScheduleAdder autoFocus add onAdd={schedule => this.addSchedule(schedule)} />
          {map(this.state.schedules, (schedule, ndx) => (
            <ScheduleAdder key={ndx} schedule={schedule} remove onRemove={() => this.removeSchedule(schedule)} unremovable={ndx === 'every second'} />
          ))}
        </form>
        <div dangerouslySetInnerHTML={{ __html: marked(demoIntroMd) }} />
        <br /><br />
        <Divider />
        <div dangerouslySetInnerHTML={{ __html: marked(projectMd) }} />
      </Paper>
    )
  }
}
