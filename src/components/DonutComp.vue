<template>
  <div
    style="width: 100%"/>
</template>

<script>
import ApiHandler from '../services/ApiHandler'
import * as d3 from 'd3'
import _ from 'lodash'

export default {
  name: 'DonutComp',
  data: function () {
    return {
      items: [],
      chart: null,
      loading: true
    }
  },
  created () {
    this.callTimelineData()
  },
  methods: {
    callTimelineData () {
      let sampleTag = 'KEWP_5RH_11B_02'
      // let self = this
      ApiHandler.getTimelineData(sampleTag)
        .then(data => {
          console.log(data)
          this.name = sampleTag
          this.items = data

          let sel = d3.select('#timeline')
            .style('background', 'white')
            .style('display', 'inline-block')
          sel.call(this.timeLine)
          this.loading = false
        })
        .catch(err => console.log(err))
    },
    timeLine () {
      // settings
      let timing = 100
      let svgWidth = d3.select('#timeline').node().offsetWidth
      let svgHeight = 320
      let data = _.cloneDeep(this.items)
      let name = this.name

      // set the dimensions and margins of the graph
      let margin = { top: 0, right: 10, bottom: 50, left: 35, sub_top: 20, sub_bottom: 0 }
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

        let rangeButtons = timeLineMenu
          .append('div')
          .attr('class', 'btn-group btn-group-sm btn-justified float-right')

        function addSecs (date, secs) {
          return new Date(date.getTime() + secs * 1000)
        }

        rangeButtons.append('input')
          .attr('class', 'form-control form-control-sm')
          .attr('placeholder', 'Start-time')

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

        function zoomRange (d) {
          svg.select('.zoom').call(zoom.transform, d3.zoomIdentity)
          switch (d) {
            case 'day': {
              let d0 = new Date(2018, 7, 11)
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
              let d0 = new Date(2018, 7, 11)
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
        let y2 = d3.scaleLinear().range([height2, 0])

        // Scale the range of the data
        x.domain(d3.extent(data, d => d.date))
        x2.domain(d3.extent(data, d => d.date))
        y.domain([d3.min(data, d => d.v), d3.max(data, d => d.v)])
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
          .attr('class', 'axis axis--y')
          .call(yAxisR)

        yAxisRg
          .transition(t)
          .call(d3.axisLeft(y).ticks(10))

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
          xAxisG.call(xAxis)
          sub.select('.brush').call(brush.move, x.range().map(t.invertX, t))
        }

        // format the data
        data.forEach(function (d) {
          d.date = parseTime(d.Date)
          d.r = +d.predict
          d.v = +d.val
        })
        console.log('Timeline Called', s, this.items)

        // Add the valueline path.
        let mainLine = main
          .append('path')
          .datum(data)
          .attr('class', 'line')
          .style('fill', 'none')
          .style('stroke', 'steelblue')
          .style('stroke-width', 0.8)
          .attr('clip-path', 'url(#clip-timeline)')
          .attr('d', function (d) {
            /// /console.log(d,valueline(d))
            return valueline(d)
          })

        // Add the predict path.
        let predictLine = main
          .append('path')
          .datum(data)
          .attr('class', 'line')
          .style('fill', 'none')
          .style('stroke', 'orange')
          .style('stroke-width', 0.8)
          .attr('clip-path', 'url(#clip-timeline)')
          .attr('d', function (d) {
            /// /console.log(d,valueline(d))
            return predictline(d)
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

        svg.append('rect')
          .attr('class', 'zoom')
          .attr('width', width)
          .attr('height', height)
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
          .call(zoom)

        sub.append('g')
          .attr('class', 'brush')
          .call(brush)
          .call(brush.move, x.range())

        function update (data) {
          name = this.name
          data = _.cloneDeep(data)
          // format the data
          data.forEach(function (d) {
            d.date = parseTime(d.Date)
            d.r = +d.predict
            d.v = +d.val
          })

          // Scale the range of the data
          x.domain(d3.extent(data, d => d.date))
          x2.domain(d3.extent(data, d => d.date))
          y.domain([d3.min(data, d => d.v), d3.max(data, d => d.v)])
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
