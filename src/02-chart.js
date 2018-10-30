import * as d3 from 'd3'
import { debounce } from 'debounce'

let margin = { top: 100, left: 50, right: 150, bottom: 30 }

let height = 700 - margin.top - margin.bottom

let width = 600 - margin.left - margin.right

let svg = d3
  .select('#chart-2')
  .append('svg')
  .attr('height', height + margin.top + margin.bottom)
  .attr('width', width + margin.left + margin.right)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

let parseTime = d3.timeParse('%B-%y')

let xPositionScale = d3.scaleLinear().range([0, width])
let yPositionScale = d3.scaleLinear().range([height, 0])

let colorScale = d3
  .scaleOrdinal()
  .range([
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69',
    '#fccde5',
    '#d9d9d9',
    '#bc80bd'
  ])

let line = d3
  .line()
  .x(function(d) {
    return xPositionScale(d.datetime)
  })
  .y(function(d) {
    return yPositionScale(d.price)
  })

d3.csv(require('./data/housing-prices.csv'))
  .then(ready)
  .catch(err => {
    console.log(err)
  })

function ready(datapoints) {
  datapoints.forEach(d => {
    d.datetime = parseTime(d.month)
  })
  let dates = datapoints.map(d => d.datetime)
  let prices = datapoints.map(d => +d.price)

  xPositionScale.domain(d3.extent(dates))
  yPositionScale.domain(d3.extent(prices))

  let nested = d3
    .nest()
    .key(function(d) {
      return d.region
    })
    .entries(datapoints)

  svg
    .selectAll('path')
    .data(nested)
    .enter()
    .append('path')
    .attr('d', function(d) {
      return line(d.values)
    })
    .attr('stroke', function(d) {
      return colorScale(d.key)
    })
    .attr('stroke-width', 2)
    .attr('fill', 'none')
    .attr('class', d => {
      // console.log(d)
      return d.key.toLowerCase().replace(/[a-z]/g, '')
    })
    .classed('region-highlight-step', true)
    .classed('us-line', d => {
      // console.log(d)
      if (d.key === 'U.S.') {
        return true
      }
    })
    .classed('hight-line', d => {
      if (
        d.key === 'Mountain' ||
        d.key === 'Pacific' ||
        d.key === 'West South Central' ||
        d.key === 'South Atlantic'
      ) {
        return true
      }
    })

  svg
    .selectAll('circle')
    .data(nested)
    .enter()
    .append('circle')
    .attr('fill', function(d) {
      return colorScale(d.key)
    })
    .attr('r', 4)
    .attr('cy', function(d) {
      return yPositionScale(d.values[0].price)
    })
    .attr('cx', function(d) {
      return xPositionScale(d.values[0].datetime)
    })
    .attr('class', 'circles')
    .classed('us-circle', d => {
      // console.log(d)
      if (d.key === 'U.S.') {
        return true
      }
    })

  svg
    .selectAll('text')
    .data(nested)
    .enter()
    .append('text')
    .attr('y', function(d) {
      return yPositionScale(d.values[0].price)
    })
    .attr('x', function(d) {
      return xPositionScale(d.values[0].datetime)
    })
    .text(function(d) {
      return d.key
    })
    .attr('dx', 6)
    .attr('dy', 4)
    .attr('font-size', '12')
    .attr('class', 'text-label')
    .classed('us-text', d => {
      // console.log(d)
      if (d.key === 'U.S.') {
        return true
      }
    })

  svg
    .append('text')
    .attr('font-size', '24')
    .attr('text-anchor', 'middle')
    .text('U.S. housing prices fall in winter')
    .attr('x', width / 2)
    .attr('y', -40)
    .attr('dx', 40)
    .attr('class', 'title')

  let rectWidth =
    xPositionScale(parseTime('February-17')) -
    xPositionScale(parseTime('November-16'))

  svg
    .append('rect')
    .attr('x', xPositionScale(parseTime('December-16')))
    .attr('y', 0)
    .attr('width', rectWidth)
    .attr('height', height)
    .attr('fill', '#C2DFFF')
    .attr('class', 'rect')
    .lower()

  let xAxis = d3
    .axisBottom(xPositionScale)
    .tickFormat(d3.timeFormat('%b %y'))
    .ticks(9)
  svg
    .append('g')
    .attr('class', 'axis x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)

  let yAxis = d3.axisLeft(yPositionScale)
  svg
    .append('g')
    .attr('class', 'axis y-axis')
    .call(yAxis)

  d3.select('#blank-graph').on('stepin', () => {
    // Grab all the lines, make them 0
    svg.selectAll('.region-highlight-step').style('visibility', 'hidden')
    svg.selectAll('.rect').style('visibility', 'hidden')
    svg.selectAll('.text-label').style('visibility', 'hidden')
    svg.selectAll('.circles').style('visibility', 'hidden')
  })

  // In this step, draw all of the lines.
  d3.select('#line-graph').on('stepin', () => {
    svg
      .selectAll('.region-highlight-step')
      .style('visibility', 'visible')
      .attr('stroke', function(d) {
        return colorScale(d.key)
      })
      .attr('stroke-width', 2)
      .attr('fill', 'none')
    svg.selectAll('.rect').style('visibility', 'hidden')

    svg
      .selectAll('.text-label')
      .style('visibility', 'visible')
      .attr('r', 4)
      .attr('cy', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('cx', function(d) {
        return xPositionScale(d.values[0].datetime)
      })
      .attr('fill', 'black')
      .attr('font-weight', 400)

    svg
      .selectAll('.circles')
      .style('visibility', 'visible')
      .attr('fill', function(d) {
        return colorScale(d.key)
      })
      .attr('r', 4)
      .attr('cy', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('cx', function(d) {
        return xPositionScale(d.values[0].datetime)
      })
  })

  // give U.S. line a hightlight color
  d3.select('#hightlight-graph').on('stepin', () => {
    svg
      .selectAll('.region-highlight-step')
      .attr('stroke', 'gray')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
    svg
      .selectAll('.us-line')
      .attr('stroke', 'red')
      .attr('stroke-width', 2)
      .attr('fill', 'none')
    // give U.S. line a hightlight circle

    svg
      .selectAll('.circles')
      .attr('fill', 'gray')
      .attr('r', 4)
      .style('visibility', 'visible')
    svg
      .selectAll('.us-circle')
      .attr('fill', 'red')
      .attr('r', 4)

    // give U.S. line a hightlight text
    svg
      .selectAll('.text-label')
      .style('visibility', 'visible')
      .attr('fill', 'gray')
    svg
      .selectAll('.us-text')
      .attr('fill', 'red')
      .attr('font-weight', 'bold')
  })
  d3.select('#average-graph').on('stepin', () => {
    svg
      .selectAll('.hight-line')
      .attr('stroke', 'orange')
      .attr('stroke-width', 2)
      .attr('fill', 'none')

    svg.selectAll('.rect').style('visibility', 'hidden')
  })

  // draw the rectangle that represents winter
  d3.select('#winter-graph').on('stepin', () => {
    svg.selectAll('.rect').style('visibility', 'visible')
  })

  // make it responsive
  function render() {
    // Calculate height/width
    console.log('Something happened')

    let screenWidth = svg.node().parentNode.parentNode.offsetWidth
    let screenHeight = window.innerHeight
    let newWidth = screenWidth - margin.left - margin.right
    let newHeight = screenHeight - margin.top - margin.bottom

    // Update your SVG
    let actualSvg = d3.select(svg.node().parentNode)
    actualSvg
      .attr('height', newHeight + margin.top + margin.bottom)
      .attr('width', newWidth + margin.left + margin.right)

    // Update scales (depends on your scales)
    xPositionScale.range([0, newWidth])
    yPositionScale.range([newHeight, 0])

    // Reposition/redraw your elements

    svg.selectAll('.region-highlight-step').attr('d', function(d) {
      return line(d.values)
    })

    svg
      .selectAll('.circles')
      .attr('cy', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('cx', function(d) {
        return xPositionScale(d.values[0].datetime)
      })

    svg
      .selectAll('.text-label')
      .attr('y', function(d) {
        return yPositionScale(d.values[0].price)
      })
      .attr('x', function(d) {
        return xPositionScale(d.values[0].datetime)
      })

    svg.selectAll('.title').attr('x', newWidth / 2)

    let rectWidth =
      xPositionScale(parseTime('February-17')) -
      xPositionScale(parseTime('November-16'))
    svg
      .selectAll('.rect')
      .attr('x', xPositionScale(parseTime('December-16')))
      .attr('width', rectWidth)
      .attr('height', newHeight)
      .lower()

    // Update axes if necessary
    if (newHeight < 400) {
      xAxis.ticks(4)
    } else {
      xAxis.ticks(9)
    }

    // If it's really small, resize the text
    if (newHeight < 400) {
      svg.selectAll('.title').attr('font-size', 12)
    } else {
      svg.selectAll('.title').attr('font-size', 24)
    }

    if (newHeight < 400) {
      svg.selectAll('.text-label').attr('font-size', 8)
    } else {
      svg.selectAll('.text-label').attr('font-size', 12)
    }

    // svg.select('.x-axis').call(xAxis)
    svg
      .select('.x-axis')
      .attr('transform', 'translate(0,' + newHeight + ')')
      .call(xAxis)
    svg.select('.y-axis').call(yAxis)
  }
  window.addEventListener('resize', render)
  render()
}
