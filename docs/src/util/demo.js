var Highcharts = require('highcharts')
Highcharts.setOptions({
  global: {
    useUTC: false
  }
})

module.exports = {
  loadDemoChart: function (cb) {
    return Highcharts.chart('chart', {
      chart: {
        type: 'scatter',
        animation: Highcharts.svg,
        events: { load: function () { return cb(this) } } // eslint-disable-line
      },
      title: { text: 'Schedule Demo' },
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 500
      },
      yAxis: {
        title: { text: null },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        formatter: function () {
          return '<b>' + this.series.name + '</b><br/>' +
          Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
          Highcharts.numberFormat(this.y, 2)
        }
      },
      legend: { enabled: true },
      exporting: { enabled: false },
      plotOptions: {
        series: {
          // http://api.highcharts.com/highcharts/plotOptions.series.marker
          marker: {
            radius: 16
          }
        }
      }
    })
  }
}
