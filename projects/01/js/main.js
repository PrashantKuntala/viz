
// Histograms are easiest to read when they are wider than they are tall.
let dim = 530

// Chart dimensions object
let dimensions = {
  width: dim,
  height: dim * 0.6,
  margin: {
    top: 40,
    right: 10,
    bottom: 50,
    left: 50
  }
}

const geneCategories = {
  "RP": "Ribosomal Protein",
  "STM": "SAGA / Tup1 / Mediator-bound",
  "TFO": "Transcription Factor Organized",
  "UNB": "Unbound"
}

// calculating the bounds
dimensions.boundedWidth = (dimensions.width - dimensions.margin.left - dimensions.margin.right)
dimensions.boundedHeight = (dimensions.height - dimensions.margin.top - dimensions.margin.bottom)


async function drawChart() {

  // All the code below waits for the dataset variable to be filled.
  const dataset = await d3.csv("./data/histData.csv")
  // console.table(dataset);

  const drawHistogram = (metric) => {

    // Metric accessor based on passed metric.
    const metricAccessor = d => d[metric]

    // This is based on the data structure of bins.
    const yAccessor = d => d.length

    // Defining Chart wrapper and bounds.
    const wrapper = d3.select('#wrapper').append('svg').attr('width', dimensions.width).attr('height', dimensions.height)
    const bounds = wrapper.append('g').attr('transform', `translate(${dimensions.margin.left},${dimensions.margin.top})`)

    // Scales
    // Using nice will round off our domains, so that the data points don't interesect with the axis lines.
    const xScale = d3.scaleLinear().domain(d3.extent(dataset, metricAccessor)).range([0, dimensions.boundedWidth]).nice()

    // Creating bins
    const binsGenerator = d3.bin()
      .domain(xScale.domain())
      .value(metricAccessor)

    const bins = binsGenerator(dataset)

    // Creating the yScale
    const yScale = d3.scaleLinear().domain([0, d3.max(bins, yAccessor)]).range([dimensions.boundedHeight, 0]).nice()

    // drawing the histogram.
    const binsGroup = bounds.append("g")
    const binGroups = binsGroup.selectAll("g")
      .data(bins)
      .enter()
      .append('g')

    const barPadding = 1

    const barRects = binGroups.append("rect")
      .attr("x", d => xScale(d.x0) + barPadding / 2)
      .attr("y", d => yScale(yAccessor(d)))
      .attr("width", d => d3.max([0, xScale(d.x1) - xScale(d.x0) - barPadding]))
      .attr("height", d => dimensions.boundedHeight - yScale(yAccessor(d)))
      .attr("fill", "cornflowerblue")

    const barText = binGroups.filter(yAccessor)
      .append("text")
      .attr("x", d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr("y", d => yScale(yAccessor(d)) - 5)
      .text(yAccessor)
      .style("text-anchor", "middle")
      .attr("fill", "darkgrey")
      .style("font-size", "11px")

    // Adding a median line
    const median = d3.median(dataset, metricAccessor)
    // console.log(metric, median);

    const medianLine = bounds.append("line")
      .attr("x1", xScale(median))
      .attr("x2", xScale(median))
      .attr("y1", -15)
      .attr("y2", dimensions.boundedHeight)
      .attr("stroke", "maroon")
      .attr("stroke-dasharray", "4px 2px")

    const medianLabel = bounds.append("text")
      .attr("x", xScale(median))
      .attr("y", -20)
      .text("median")
      .attr("fill", "maroon")
      .style("text-anchor", "middle")


    // Drawing the Axes
    // const yAxisGenerator = d3.axisLeft().scale(yScale)
    // const yAxis = bounds.append('g').call(yAxisGenerator)

    const xAxisGenerator = d3.axisBottom().scale(xScale)
    const xAxis = bounds.append('g').call(xAxisGenerator).style('transform', `translateY(${dimensions.boundedHeight}px)`)

    // Adding labels to Axes
    const xAxisLabel = xAxis.append('text')
      .attr('x', dimensions.boundedWidth / 2)
      .attr('y', dimensions.margin.bottom - 10)
      .attr('fill', 'black')
      .style("font-size", "1.4em")
      .text(`${geneCategories[metric]} genes`)
      .style("text-transform", "capitalize")


    // const yAxisLabel = yAxis.append('text')
    //   .attr('x', -dimensions.boundedHeight / 2)
    //   .attr('y', -dimensions.margin.left + 10)
    //   .attr('fill', 'black')
    //   .style("font-size", "1.4em")
    //   .text("No.of Targets")
    //   .style("transform", "rotate(-90deg)")
    //   .style("text-anchor", "middle")

  }

  // generating the histogram for each metric.
  const metrics = [
    "RP",
    "STM",
    "TFO",
    "UNB"
  ]
  metrics.forEach(drawHistogram)

}

drawChart()
