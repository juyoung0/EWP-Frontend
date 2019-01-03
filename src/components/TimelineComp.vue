<template>
  <div style="width: 100%">
    <div
      v-if="loading"
      style="text-align: center"><i class="fas fa-cog fa-spin"/> Loading now...
    </div>
    <div
      id="timeline"
      style="width: 100%"
    />
    <div/>
  </div>
</template>

<script>
import ApiHandler from '../services/ApiHandler'
import * as d3 from 'd3'
import _ from 'lodash'
import { EventBus } from '../services/EventBus'
import $ from 'jquery'

export default {
  name: 'TimelineComp',
  props: {
    divWidth: {
      type: String,
      default () {
        return 0 + 'px'
      }
    }
  },
  data: function () {
    return {
      items: [],
      tag: 'KEWP_5RH_11B_02',
      chart: null,
      width: this.divWidth,
      loading: true
    }
  },
  created () {
    let self = this
    this.callTimelineData(this.tag, '2015-01-01 00:00', '2015-01-13 21:20')
    EventBus.$on('TimlineSettingChanged', function () {
      console.log('TimlineSettingChanged', this.tag)
      d3.select('#timeline')
        .selectAll('*')
        .remove()
      self.callTimelineData(self.tag, $('#timeLineStartDate').val(), $('#timeLineEndDate').val())
    })
    console.log('w', this.width)
    EventBus.$on('clickDetailItem', function (tag) {
      console.log('clickDetailItem', tag)
      d3.select('#timeline')
        .selectAll('*')
        .remove()
      self.tag = tag
      self.callTimelineData(tag, $('#timeLineStartDate').val(), $('#timeLineEndDate').val())
    })
  },
  methods: {
    callTimelineData (tag, start, end) {
      let self = this
      this.loading = true
      ApiHandler.getTimelineData(tag, start, end)
        .then(data => {
          this.name = tag
          this.items = data
          let sel = d3.select('#timeline')
            .style('background', 'white')
            .style('display', 'inline-block')

          sel.call(self.timeLine)
          this.loading = false
        })
        .catch(err => console.log(err))
    },
    timeLine () {
      // settings
      let timing = 100
      let svgWidth = d3.select('#table_line').node().offsetWidth - 10
      let svgHeight = 344
      let data = _.cloneDeep(this.items)
      let name = this.name

      // set the dimensions and margins of the graph
      let margin = { top: 15, right: 35, bottom: 50, left: 35, sub_top: 20, sub_bottom: 0 }
      let width = svgWidth - margin.left - margin.right
      let height = svgHeight - margin.top - margin.bottom
      let height2 = margin.bottom - margin.sub_top - margin.sub_bottom

      // define circle pack
      function chart (s) {
        data = _.cloneDeep(data)
        let selection = s
        // parse the date / time
        let parseTime = d3.timeParse('%Y-%m-%d %H:%M:%S')
        let t = d3.transition()
          .duration(timing)

        let brush = d3.brushX()
          .extent([[0, 0], [width, height2]])
          .on('brush end', brushed)

        var zoom = d3.zoom()
          .scaleExtent([1, Infinity])
          .translateExtent([[0, 0], [width, height]])
          .extent([[0, 0], [width, height]])
          .on('zoom', zoomed)

        let timeLineMenu = selection.append('div')
          .attr('class', 'timeline-menu')
          .style('background', 'white')
        // .style('border-bottom','solid 1px #333');

        let range = ['day', 'hour']

        timeLineMenu
          .append('span')
          .text(name)

        // add legends
        // let legendColor = ['steelblue', 'orange', 'red']
        let legendItem = ['Real', 'Predict', 'Prob']
        let legendG = timeLineMenu.append('span')
        // .attr('transform', 'translate(' + width / 2 + ',' + 0 + ')')
          .attr('class', 'legend btn-group btn-group-sm btn-justified float-right')
          .attr('role', 'group')
          .style('margin-left', '10px')
          .selectAll('span')
          .data(legendItem)
          .enter()

        let legends = legendG
          .append('span')
          .attr('class', function (d) {
            let res = 'btn btn-legend btn-sm btn-light active '
            return res + 'legend-' + d
          })
          .text(d => d)
        // .style('background-color', (d, i) => legendColor[i])

        legends.on('click', function (d) {
          let s = d3.select(this)
          console.log(d, d + '-line', s.classed('active'))
          if (s.classed('active')) {
            d3.select('path.' + d + '-line').classed('hide-line', true)
            s.classed('active', false)
          } else {
            d3.select('path.' + d + '-line').classed('hide-line', false)
            s.classed('active', true)
          }
        })

        let rangeButtons = timeLineMenu
          .append('div')
          .attr('class', 'btn-group btn-group-sm btn-justified float-right')

        function addSecs (date, secs) {
          return new Date(date.getTime() + secs * 1000)
        }

        /*
                  rangeButtons.append('input')
                    .attr('class', 'form-control form-control-sm')
                    .attr('placeholder', 'Start-time')
                    */

        var dd0
        var zoomRange = function (d) {
          svg.select('.zoom').call(zoom.transform, d3.zoomIdentity)
          switch (d) {
            case 'day': {
              let d0 = dd0
              let d1 = addSecs(d0, 60 * 60 * 24)
              svg.select('.zoom')
                .transition()
                .duration(1000)
                .call(zoom.transform, d3.zoomIdentity
                  .scale(width / (x(d1) - x(d0)))
                  .translate(x(d0), 0))
              break
            }
            case 'hour': {
              let d0 = dd0
              let d1 = addSecs(d0, 60 * 60)
              svg.select('.zoom')
                .transition()
                .duration(1000)
                .call(zoom.transform, d3.zoomIdentity
                  .scale(width / (x(d1) - x(d0)))
                  .translate(x(d0), 0))
              break
            }
          }
        }

        rangeButtons
          .selectAll('span.range-buttons')
          .data(range)
          .enter()
          .append('span')
          .attr('class', 'btn btn-sm btn-info range-buttons')
          .attr('id', (d) => {
            return 'range-button-' + d
          })
          .on('click', (d) => {
            d3.selectAll('.range-buttons')
              .classed('active', false)
            d3.select('#range-button-' + d)
              .classed('active', true)
            zoomRange(d)
          })
          .text(d => d.toUpperCase())

        // append menu buttons and title area
        var svg = selection.append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom + margin.sub_bottom + margin.sub_top)
          .style('background', 'white')

        svg.append('defs').append('clipPath')
          .attr('id', 'clip-timeline')
          .append('rect')
          .attr('width', width)
          .attr('height', height)

        let main = svg.append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

        let sub = svg.append('g')
          .attr('transform', 'translate(' + margin.left + ',' + (margin.top + height + margin.sub_top) + ')')

        // .call(zoom);

        // set the ranges
        let x = d3.scaleTime().range([0, width])
        let x2 = d3.scaleTime().range([0, width])
        let y = d3.scaleLinear().range([height, 0])
        let yp = d3.scaleLinear().range([height, 0])
        let y2 = d3.scaleLinear().range([height2, 0])

        // Scale the range of the data
        x.domain(d3.extent(data, d => d.date))
        x2.domain(d3.extent(data, d => d.date))
        y.domain([d3.min(data, d => d.v), d3.max(data, d => d.v)])
        yp.domain([0, 1])
        y2.domain([d3.min(data, d => d.v), d3.max(data, d => d.v)])

        // Add the X Axis
        let xAxis = d3.axisBottom(x).ticks(10)

        let xAxisG = main.append('g')
          .attr('transform', 'translate(0,' + height + ')')
          .call(xAxis)

        let xAxis2 = d3.axisBottom(x2).ticks(10)

        let xAxisSubG = sub.append('g')
          .attr('transform', 'translate(0,' + height2 + ')')
          .call(xAxis2)

        xAxisG
          .transition(t)
          .call(d3.axisBottom(x).ticks(10))

        xAxisSubG
          .transition(t)
          .call(d3.axisBottom(x).ticks(10))

        // Add the Y Axis

        let yAxisR = d3.axisLeft(y).ticks(10)

        // Add the Y0 Axis
        let yAxisRg = main.append('g')
          .call(yAxisR)

        let yAxisP = d3.axisRight(yp).ticks(10)

        // Add the prob. Axis
        let yAxisPg = main.append('g')
          .attr('class', 'axisRed')
          .attr('transform', 'translate( ' + width + ', 0 )')
          // .attr('class', 'axis axis--y')
          .call(yAxisP)
        /*
        yAxisRg
          .transition(t)
          .call(d3.axisLeft(y).ticks(10))

        yAxisPg
          .transition(t)
          .call(d3.axisRight(yp).ticks(10))
          */

        // define the line
        let valueline = d3.line()
          .x(function (d) {
            /// /console.log(x(d.date),d.date)
            return x(d.date)
          })
          .y(function (d) {
            /// /console.log(y(d.r),d.r)
            return y(d.v)
          }).curve(d3.curveLinear)

        // define the line
        let predictline = d3.line()
          .x(function (d) {
            /// /console.log(x(d.date),d.date)
            return x(d.date)
          })
          .y(function (d) {
            /// /console.log(y(d.r),d.r)
            return y(d.r)
          }).curve(d3.curveLinear)

        let probline = d3.line()
          .x(function (d) {
            /// /console.log(x(d.date),d.date)
            return x(d.date)
          })
          .y(function (d) {
            /// /console.log(y(d.r),d.r)
            return yp(d.p)
          }).curve(d3.curveLinear)

        let valueline2 = d3.line()
          .x(function (d) {
            /// /console.log(x(d.date),d.date)
            return x2(d.date)
          })
          .y(function (d) {
            /// /console.log(y(d.r),d.r)
            return y2(d.v)
          }).curve(d3.curveLinear)

        function brushed () {
          if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return // ignore brush-by-zoom
          var s = d3.event.selection || x2.range()
          x.domain(s.map(x2.invert, x2))
          mainLine.attr('d', valueline)
          predictLine.attr('d', predictline)
          probLine.attr('d', probline)
          xAxisG.call(xAxis)
          svg.select('.zoom').call(zoom.transform, d3.zoomIdentity
            .scale(width / (s[1] - s[0]))
            .translate(-s[0], 0))
        }

        function zoomed () {
          if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return // ignore zoom-by-brush
          var t = d3.event.transform
          x.domain(t.rescaleX(x2).domain())
          mainLine.attr('d', valueline)
          predictLine.attr('d', predictline)
          probLine.attr('d', probline)
          xAxisG.call(xAxis)
          sub.select('.brush').call(brush.move, x.range().map(t.invertX, t))
        }

        // format the data
        data.forEach(function (d) {
          d.date = parseTime(d.Date)
          d.r = +d.predict
          d.v = +d.val
          d.p = +d.prob
        })
        console.log('Timeline Called', s, this.items)

        // Add the valueline path.
        let mainLine = main
          .append('path')
          .datum(data)
          .attr('class', 'Real-line')
          .style('fill', 'none')
          .style('stroke', 'steelblue')
          .style('stroke-width', 0.5)
          .attr('clip-path', 'url(#clip-timeline)')
          .attr('d', function (d) {
            /// /console.log(d,valueline(d))
            return valueline(d)
          })

        // Add the predict path.
        let predictLine = main
          .append('path')
          .datum(data)
          .attr('class', 'Predict-line')
          .style('fill', 'none')
          .style('stroke', 'orange')
          .style('stroke-width', 0.5)
          .attr('clip-path', 'url(#clip-timeline)')
          .attr('d', function (d) {
            /// /console.log(d,valueline(d))
            return predictline(d)
          })

        let probLine = main
          .append('path')
          .datum(data)
          .attr('class', 'Prob-line')
          .style('fill', 'none')
          .style('stroke', 'red')
          .style('stroke-width', 0.5)
          .style('stroke-opacity', 0.5)
          .attr('clip-path', 'url(#clip-timeline)')
          .attr('d', function (d) {
            /// /console.log(d,valueline(d))
            return probline(d)
          })

        let subLine = sub
          .append('path')
          .datum(data)
          .attr('class', 'line')
          .style('fill', 'none')
          .style('stroke', 'steelblue')
          .style('stroke-width', 2)
          .attr('d', function (d) {
            /// /console.log(d,valueline(d))
            return valueline2(d)
          })

        let zoomArea = svg.append('rect')
          .attr('class', 'zoom')
          .attr('width', width)
          .attr('height', height)
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
          .call(zoom)

        sub.append('g')
          .attr('class', 'brush')
          .call(brush)
          .call(brush.move, x.range())

        let defsFilter = svg.append('defs')
          .append('filter')
          .attr('x', 0)
          .attr('y', 0)
          .attr('width', 1)
          .attr('height', 1)
          .attr('id', 'solid')

        defsFilter.append('feFlood')
          .attr('flood-color', 'white')

        defsFilter.append('feComposite')
          .attr('in', 'SourceGraphic')

        // add hover guideline
        let hoverlineG = svg
          .append('g')
          .attr('transform', 'translate(-27,' + margin.top + ')')
          .style('z-index', -99999)

        hoverlineG.append('rect')
          .attr('width', 20)
          .attr('height', 10)
          .style('fill', 'white')
          .style('z-index', 99999)

        hoverlineG.append('line')
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', height)
          .attr('y2', 0)
          .style('fill', 'none')
          .style('stroke', '#6F257F')
          .style('stroke-width', 2)
          .style('stroke-dasharray', '3,3')

        let hoverPredict = hoverlineG
          .append('circle')
          .attr('r', 7.5)
          .style('fill', 'none')
          .style('stroke-width', 4)
          .style('stroke', 'orange')

        let hoverPredictText = hoverlineG
          .append('text')
        let hoverRealText = hoverlineG
          .append('text')
        let hoverProbText = hoverlineG
          .append('text')
        let hoverReal = hoverlineG
          .append('circle')
          .attr('r', 7.5)
          .style('fill', 'none')
          .style('stroke-width', 4)
          .style('stroke', 'steelblue')
        let hoverProb = hoverlineG
          .append('circle')
          .attr('r', 7.5)
          .style('fill', 'none')
          .style('stroke-width', 4)
          .style('stroke', 'red')

        function update (data) {
          name = this.name
          data = _.cloneDeep(data)
          // format the data
          data.forEach(function (d) {
            d.date = parseTime(d.Date)
            d.r = +d.predict
            d.v = +d.val
            d.p = +d.prob
          })

          console.log('dd0', data[0])

          dd0 = data[0].date
          // Scale the range of the data
          x.domain(d3.extent(data, d => d.date))
          x2.domain(d3.extent(data, d => d.date))
          y.domain([d3.min(data, d => d.v), d3.max(data, d => d.v)])
          yp.domain([0, 1])
          y2.domain([d3.min(data, d => d.v), d3.max(data, d => d.v)])

          xAxisG
            .transition(t)
            .call(d3.axisBottom(x).ticks(10))

          xAxisSubG
            .transition(t)
            .call(d3.axisBottom(x).ticks(10))

          yAxisRg
            .transition(t)
            .call(d3.axisLeft(y).ticks(10))

          yAxisPg
            .transition(t)
            .call(d3.axisRight(yp).ticks(10))

          mainLine.datum(data)
            .transition(t)
            .attr('d', function (d) {
              // console.log(d, valueline(d))
              return valueline(d)
            })

          predictLine.datum(data)
            .transition(t)
            .attr('d', function (d) {
              // console.log(d, valueline(d))
              return predictline(d)
            })

          probLine.datum(data)
            .transition(t)
            .attr('d', function (d) {
              // console.log(d, valueline(d))
              return probline(d)
            })

          subLine.datum(data)
            .transition(t)
            .attr('d', function (d) {
              // console.log(d, valueline(d))
              return valueline2(d)
            })

          // removes handle to resize the brush
          // d3.selectAll('.brush>.handle').remove()
          // removes crosshair cursor
          // d3.selectAll('.brush>.overlay').remove()

          let selectedRange = d3.select('span.range-buttons.active')
          if (selectedRange.node()) {
            let d = selectedRange.data()[0]
            zoomRange(d)
          }

          // add daa detection based on mouse pointer

          zoomArea.on('mousemove', function (d) {
            console.log(d3.event)
            let gap = 67
            let xp = d3.event.x - gap
            // let y = d3.event.y
            let xv = d3.isoParse(x.invert(xp))

            function nf (n) {
              return n > 9 ? '' + n : '0' + n
            }

            let xvf = [[xv.getFullYear(), nf(xv.getMonth() + 1), nf(xv.getDate())].join('-'),
              [nf(xv.getHours()), nf(xv.getMinutes()), '00'].join(':')].join(' ')
            let dp = _.find(data, function (item) {
              // console.log(item, xvf)
              return xvf === item.Date
            })
            // /console.log(xvf)

            hoverlineG
              .attr('transform', 'translate(' + (xp + gap - margin.left) + ',' + margin.top + ')')
            console.log(dp, xvf, xp)
            hoverPredict.attr('cy', y(dp.predict))
            hoverPredictText
              .attr('x', 15)
              .attr('dy', y(dp.predict))
              .attr('filter', 'url(#solid)')
              .text(dp.predict.toFixed(2))
            hoverProb.attr('cy', yp(dp.prob))
            hoverProbText
              .attr('x', 15)
              .attr('dy', yp(dp.prob))
              .attr('filter', 'url(#solid)')
              .text(dp.prob.toFixed(2))
            hoverReal.attr('cy', y(dp.val))
            hoverRealText
              .attr('x', 15)
              .attr('dy', y(dp.val))
              .attr('filter', 'url(#solid)')
              .text(dp.val.toFixed(2))
          })

          // transition
          return chart
        }

        chart.update = update
        return chart
      } // end chart function
      this.chart = chart
      this.chart(d3.select('#timeline')).update(data)
      return chart
    }
  }
}
</script>

<style scoped>

</style>
