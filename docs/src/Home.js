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
    this.everySecondCronJob = {
      id: 'every second',
      trigger: new TriggerCron({ cron: '* * * * * *' })
    }
    this.everyThreeSecondRruleJob = {
      id: 'every 3rd second',
      trigger: new TriggerRrule({ rrule: 'FREQ=SECONDLY;INTERVAL=3' })
    }
    this.state = {
      jobs: {}
    }
  }

  addJob (job) {
    return this.scheduler.addJob(job).then(job => {
      var state = Object.assign({}, this.state)
      var newJob = Object.assign({}, job, {
        data: [],
        series: this.chart.addSeries({
          name: job.id
        })
      })
      state.jobs[job.id] = newJob
      this.setState(state)
    })
  }

  removeJob (job) {
    return this.scheduler.deleteJob(job.id)
    .then(() => {
      var state = Object.assign({}, this.state)
      state.jobs[job.id].series.remove()
      delete state.jobs[job.id]
      this.setState(state)
    })
  }

  subscribe (obs) {
    var onScreenDuration = 5000
    obs.subscribe(evt => {
      var jobId = evt.job.id
      var job = this.state.jobs[jobId]
      var tickDate = new Date(evt.trigger.date)
      job.data.push(tickDate)
      job.series.addPoint([tickDate.getTime(), 0], true)
      var lagDate = new Date(tickDate.getTime() - onScreenDuration)
      this.chart.xAxis[0].setExtremes(lagDate.getTime(), tickDate.getTime())
      setTimeout(function (jobId) {
        var purgeThru = new Date(Date.now() - onScreenDuration)
        var job = this.state.jobs[jobId]
        if (!job) return
        while (job.data[0] && job.data[0].getTime() <= purgeThru) {
          job.data.shift()
          job.series.removePoint(0)
        }
      }.bind(this, jobId), onScreenDuration)
    })
  }
  componentDidMount () {
    return loadDemoChart(hc => {
      this.chart = hc
      return Promise.resolve()
      .then(() => this.addJob(this.everySecondCronJob))
      .then(() => this.addJob(this.everyThreeSecondRruleJob))
      .then(job => this.scheduler.start())
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
          <ScheduleAdder autoFocus add onAdd={job => this.addJob(job)} />
          {map(this.state.jobs, (job, ndx) => (
            <ScheduleAdder key={ndx} job={job} remove onRemove={() => this.removeJob(job)} unremovable={ndx === 'every second'} />
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
