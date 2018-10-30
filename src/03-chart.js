import * as d3 from 'd3'
import { debounce } from 'debounce'

var margin = { top: 10, left: 10, right: 10, bottom: 10 }

var height = 480 - margin.top - margin.bottom

var width = 480 - margin.left - margin.right

var svg = d3
  .select('#chart-3')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

var radius = 200

var radiusScale = d3
  .scaleLinear()
  .domain([10, 100])
  .range([40, radius])

var angleScale = d3
  .scalePoint()
  .domain([
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sept',
    'Oct',
    'Nov',
    'Dec',
    'Blah'
  ])
  .range([0, Math.PI * 2])

var colorScale = d3.scaleSequential(d3.interpolatePiYG).domain([50, 90])

var line = d3
  .radialArea()
  .outerRadius(function(d) {
    return radiusScale(d.high_temp)
  })
  .innerRadius(function(d) {
    return radiusScale(d.low_temp)
  })
  .angle(function(d) {
    return angleScale(d.month_name)
  })

d3.csv(require('./data/all-temps.csv'))
  .then(ready)
  .catch(err => console.log('Failed on', err))

function ready(datapoints) {
  var container = svg
    .append('g')
    .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')')
    .attr('class', 'middle')

  datapoints.forEach(d => {
    // console.log(d)
    d.high_temp = +d.high_temp
    d.low_temp = +d.low_temp

  })

  // Filter it so I'm only looking at NYC datapoints
  d3.select('#newyork').on('stepin', () => {
    let nycDatapoints = datapoints.filter(d => d.city === 'NYC')
    nycDatapoints.push(nycDatapoints[0])
    var meannycTemp = d3.mean(nycDatapoints, d => +d.high_temp)
    console.log(meannycTemp)

    container
      .append('path')
      .attr('class', 'temp')
      .datum(nycDatapoints)
      .attr('d', line)
      .attr('fill', colorScale(meannycTemp))
      .attr('opacity', 0.75)

    var circleBands = [20, 30, 40, 50, 60, 70, 80, 90]
    var textBands = [30, 50, 70, 90]

    container
      .selectAll('.bands')
      .data(circleBands)
      .enter()
      .append('circle')
      .attr('class', 'bands')
      .attr('fill', 'none')
      .attr('stroke', 'gray')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', function(d) {
        return radiusScale(d)
      })
      .lower()

    container
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('class', 'city-name')
      .text('NYC')
      .attr('font-size', 30)
      .attr('font-weight', 700)
      .attr('alignment-baseline', 'middle')
      .attr('fill', colorScale(meannycTemp))

    container
      .selectAll('.temp-notes')
      .data(textBands)
      .enter()
      .append('text')
      .attr('class', 'temp-notes')
      .attr('x', 0)
      .attr('y', d => -radiusScale(d))
      .attr('dy', -2)
      .text(d => d + '°')
      .attr('text-anchor', 'middle')
      .attr('font-size', 8)
  })

  // turn it to Beijing chart
  d3.select('#beijing').on('stepin', () => {
    let bjDatapoints = datapoints.filter(d => d.city === 'Beijing')
    console.log('beijing datapoints', bjDatapoints)
    let meanbjTemp = d3.mean(bjDatapoints, d => {
      console.log(d)
      return d.high_temp
    })
    console.log(meanbjTemp)
    bjDatapoints.push(bjDatapoints[0])

    container
      .selectAll('.temp')
      .datum(bjDatapoints)
      .transition()
      .attr('fill', colorScale(meanbjTemp))

    container
      .selectAll('.city-name')
      .transition()
      .text('Beijing')
      .attr('fill', colorScale(meanbjTemp))
  })
  // turn it to Stockholm chart
  d3.select('#stockholm').on('stepin', () => {
    let stDatapoints = datapoints.filter(d => d.city === 'Stockholm')
    console.log('stockholm datapoints', stDatapoints)
    let meanstTemp = d3.mean(stDatapoints, d => {
      console.log(d)
      return d.high_temp
    })
    console.log(meanstTemp)
    stDatapoints.push(stDatapoints[0])

    container
      .selectAll('.temp')
      .datum(stDatapoints)
      .transition()
      .attr('fill', colorScale(meanstTemp))

    container
      .selectAll('.city-name')
      .transition()
      .text('Stockholm')
      .attr('fill', colorScale(meanstTemp))
  })
  // turn it to Lima chart
  d3.select('#lima').on('stepin', () => {
    let liDatapoints = datapoints.filter(d => d.city === 'Lima')
    console.log('lima datapoints', liDatapoints)
    let meanliTemp = d3.mean(liDatapoints, d => {
      // console.log(d)
      return d.high_temp
    })
    console.log(meanliTemp)
    liDatapoints.push(liDatapoints[0])

    container
      .selectAll('.temp')
      .datum(liDatapoints)
      .transition()
      .attr('fill', colorScale(meanliTemp))

    container
      .selectAll('.city-name')
      .transition()
      .text('Lima')
      .attr('fill', colorScale(meanliTemp))
  })
  // turn it to Tuscon chart
  d3.select('#tuscon-arizona').on('stepin', () => {
    let tuDatapoints = datapoints.filter(d => d.city === 'Tuscon')
    console.log('tuscon datapoints', tuDatapoints)
    let meantuTemp = d3.mean(tuDatapoints, d => {
      // console.log(d)
      return d.high_temp
    })
    console.log(meantuTemp)
    tuDatapoints.push(tuDatapoints[0])

    container
      .selectAll('.temp')
      .datum(tuDatapoints)
      .transition()
      .attr('fill', colorScale(meantuTemp))

    container
      .selectAll('.city-name')
      .transition()
      .text('Tuscon')
      .attr('fill', colorScale(meantuTemp))
  })

  function render() {
    // Calculate height/width
    console.log('something happen')
    let screenWidth = svg.node().parentNode.parentNode.offsetWidth
    let screenHeight = window.innerHeight
    let newSide = Math.min(screenHeight, screenWidth)
    let newWidth = newSide - margin.left - margin.right
    let newHeight = newSide - margin.top - margin.bottom

    // Update your SVG
    let actualSvg = d3.select(svg.node().parentNode)
    actualSvg
      .attr('height', newHeight + margin.top + margin.bottom)
      .attr('width', newWidth + margin.left + margin.right)

    // Update scales (depends on your scales)
    var newRadius = (radius / width) * newWidth

    radiusScale.range([(40 / width) * newWidth, newRadius])

    // Reposition/redraw your elements
    container.selectAll('.temp').attr('d', line)

    var circleBands = [20, 30, 40, 50, 60, 70, 80, 90]
    var textBands = [30, 50, 70, 90]

    container
      .selectAll('.bands')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', function(d) {
        return radiusScale(d)
      })

    container
      .selectAll('.city-name')
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', 20)
      .attr('font-weight', 700)
      .attr('alignment-baseline', 'middle')

    container
      .selectAll('.temp-notes')
      .attr('x', 0)
      .attr('y', d => -radiusScale(d))
      .attr('dy', -2)
      .text(d => d + '°')
      .attr('text-anchor', 'middle')
      .attr('font-size', 8)

    container.attr(
      'transform',
      'translate(' + newWidth / 2 + ',' + newHeight / 2 + ')'
    )
  }
  window.addEventListener('resize', render)
  render()
}
