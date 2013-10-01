/*jshint asi:true, laxcomma:true, devel:true */

"use strict";

angular.module('gmcadmin.directives', [
]).directive('chartStatsReq', function () {
  return {
    link: function (scope, element, attrs) {
      var chart = null

      var colors = [
        '#48C636'
      , '#1290EE'
      , '#FF3602'
      , '#E8B90A'
      , '#A110E8'
      , '#FF89E0'
      , '#393939'
      ]

      var brighten = function (color) {
        return Highcharts.Color(color).brighten(0.1).get()
      }

      var darken = function (color) {
        return Highcharts.Color(color).brighten(-0.1).get()
      }

      var labelFormatter = function () {
        var label = ''
        if (this.y) {
          label = Highcharts.numberFormat(this.percentage) + '%'
        }
        return label
      }

      var buildSeries = function (stats) {
        var series = [
          {
            name: 'Requests'
          , innerSize: '20%'
          , dataLabels: { distance: -100, color: 'white' }
          , data: [
              { name: 'Get', y: stats.CmdGet, color: colors[0] }
            , { name: 'Set', y: stats.CmdSet, color: colors[1] }
            , { name: 'Delete', y: stats.DeleteMisses + stats.DeleteHits, color: colors[2] }
            , { name: 'Cas', y: stats.CasMisses + stats.CasHits, color: colors[3] }
            , { name: 'Incr/Decr', y: stats.IncrMisses + stats.IncrHits + stats.DecrMisses + stats.DecrHits, color: colors[4] }
            , { name: 'Touch', y: stats.CmdTouch, color: colors[5] }
            , { name: 'Flush', y: stats.CmdFlush, color: colors[6] }
            ]
          , showInLegend: true
          }
        , {
            name: 'Requests'
          , innerSize: '75%'
          , dataLabels: { enabled: false }
          , data: [
              { name: 'Get Hits', y: stats.GetHits, color: brighten(colors[0]) }
            , { name: 'Get Misses', y: stats.GetMisses, color: darken(colors[0]) }
            , { name: 'Set', y: stats.CmdSet, color: colors[1] }
            , { name: 'Delete Hits', y: stats.DeleteHits, color: brighten(colors[2]) }
            , { name: 'Delete Misses', y: stats.DeleteMisses, color: darken(colors[2]) }
            , { name: 'Cas Hits', y: stats.CasHits, color: brighten(colors[3]) }
            , { name: 'Cas Misses', y: stats.CasMisses, color: darken(colors[3]) }
            , { name: 'Incr/Decr Hits', y: stats.IncrHits + stats.DecrHits, color: brighten(colors[4]) }
            , { name: 'Incr/Decr Misses', y: stats.IncrMisses + stats.DecrMisses, color: darken(colors[4]) }
            , { name: 'Touch Hits', y: stats.TouchHits, color: brighten(colors[5]) }
            , { name: 'Touch Misses', y: stats.TouchMisses, color: darken(colors[5]) }
            , { name: 'Flush', y: stats.CmdFlush, color: colors[6] }
            ]
          , showInLegend: false
          }
        ]
        return series 
      }

      var buildChart = function (series, el) {
        var chart = new Highcharts.Chart({
          chart: {
            type: 'pie'
          , renderTo: el
          , backgroundColor: null
          , margin: [0, 0, 0, 0]
          }
        , title: { text: null }
        , legend: { backgroundColor: 'white' }
        , credits: { enabled: false }
        , plotOptions: {
            pie: {
              shadow: false
            , dataLabels: { color: '#222222', formatter: labelFormatter }
            }
          , series: {
              point: {
                events: { legendItemClick: function () { return false } }
              }
            }
          }
        , series: series
        })
        return chart
      }

      var updateChart = function (stats) {
        var series = buildSeries(stats)
        if (!chart) {
          chart = buildChart(series, element[0])
        } else {
          for (var i = 0; i < series.length; i++) {
            chart.series[i].setData(series[i].data)
          }
        }
      }

      scope.$watch('serverStats', function (stats) {
        if (stats && Object.keys(stats).length) {
          updateChart(stats)
        }
      })
    }
  }
}).directive('chartStatsMem', function () {
  return {
    link: function (scope, element, attrs) {
      var chart = null
      var maxbytes = 0
      var test = 1

      var colors = [
        '#4968AB'
      , '#C84D64'
      , '#5FA6A9'
      ]

      var labelFormatter = function () {
        var label = ''
        if (this.y) {
          label = Highcharts.numberFormat(this.percentage) + '%'
        }
        return label
      }

      var unit = 'KB'
      var unitResize = function (value) {
        return value > 1024 ? Math.floor(value / 1024) : value
      }

      var buildSeries = function (stats) {
        var series = [
          {
            name: 'Cache Size'
          , innerSize: '20%'
          , dataLabels: { distance: -100, color: 'white' }
          , data: [
              { name: 'Used', y: unitResize(stats.Used), color: colors[0] }
            , { name: 'Wasted', y: unitResize(stats.Wasted), color: colors[1] }
            , { name: 'Free', y: unitResize(stats.Free), color: colors[2] }
            ]
          , showInLegend: true
          }
        ]
        return series 
      }

      var buildChart = function (series, el) {
        var chart = new Highcharts.Chart({
          chart: {
            type: 'pie'
          , backgroundColor: null
          , margin: [0, 0, 0, 0]
          , renderTo: el
          }
        , title: { text: null }
        , legend: { backgroundColor: 'white' }
        , credits: { enabled: false }
        , plotOptions: {
            pie: {
              shadow: false
            , dataLabels: { color: '#222222', formatter: labelFormatter }
            , tooltip: { pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b> ' + unit + '<br/>' }
            }
          , series: {
              point: {
                events: { legendItemClick: function () { return false } }
              }
            }
          }
        , series: series
        })
        return chart
      }

      var updateChart = function (stats) {
        var series = buildSeries(stats)
        if (!chart) {
          chart = buildChart(series, element[0])
        } else {
          for (var i = 0; i < series.length; i++) {
            chart.series[i].setData(series[i].data)
          }
        }
      }

      scope.$watch('settingsStats', function (stats) {
        if (stats && Object.keys(stats).length) {
          maxbytes = stats.Maxbytes
        }
      })

      scope.$watch('slabsStats', function (slabs) {
        if (slabs && slabs.length) {
          var stats = { Malloced: 0, Used: 0, Wasted: 0, Free: 0 }
          for (var i = 0; i < slabs.length; i++) {
            stats.Malloced += slabs[i].ChunkSize * slabs[i].TotalChunks
            stats.Wasted += (slabs[i].ChunkSize * slabs[i].TotalChunks < slabs[i].MemRequested) ? ((slabs[i].TotalChunks - slabs[i].UsedChunks) * slabs[i].ChunkSize) : (slabs[i].TotalChunks * slabs[i].ChunkSize - slabs[i].MemRequested)
          }
          stats.Used = stats.Malloced - stats.Wasted
          stats.Free = maxbytes - stats.Malloced
          updateChart(stats)
        }
      })
    }
  }
})
