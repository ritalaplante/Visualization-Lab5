/* INITIATE CHART */

// Define margin conventions

const margin = {top:50, left:50, right:50, bottom:50};
const width = 650 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Create an SVG element
const svg = d3.select(".chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// Create scales without domains
const xScale = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1)

const yScale = d3.scaleLinear()
    .range([height, 0])

// Create axes
const xAxis = d3.axisBottom()
    .scale(xScale)

const yAxis = d3.axisLeft()
    .scale(yScale)

svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(xAxis);

svg.append("g")
    .attr("class", "y-axis")
    .call(yAxis);

// Create a title that can be updated for the y-axis
const label = svg.append('text')
    .attr('x', 0)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .attr('alignment-baseline', 'middle')
    .attr('font-size', 12)
    .attr('fill', 'grey');


/* CHART UPDATE FUNCTION */

// Variable for determining the direction of the sort
// Starts on increasing
let sort = 0

// Add a data key function that returns company name
let key = function(d) {
    return d.company;
};

let makeLabel = function(type){
    if(type == 'stores') {
        return 'Stores'
    } else {
        return 'Billions USD'
    }
}

function update(data, type){
    
    // Sort the data based on the sort direction
    data.sort(function (a, b) {
        if (sort == 0) return a[type] - b[type]
        if (sort == 1) return b[type] - a[type]
    });

    // Update domains
    xScale.domain(data.map(d => key(d)))  
	yScale.domain([0, d3.max(data, d=>d[type])])

    // Update the bars
    const update = svg.selectAll('rect').data(data)

    update.enter().append('rect')
        .merge(update)
        .transition()
        .duration(1000)
        // in transition change x and y positions as well as height and width
        .attr('x', d => xScale(key(d)))
        .attr('y', d => yScale(d[type]))
        .attr('width', d=> xScale.bandwidth())
        .attr('height', d=>(height - yScale(d[type])))
        .attr('fill', '#9b4dca')
    
    update.exit().transition().duration(750).remove()

    // Update axes and title
   svg.select(".x-axis")
        .transition()
        .duration(1000)
        .call(xAxis);

    svg.select(".y-axis")
        .transition()
        .duration(1000)
        .call(yAxis);

    label.text(makeLabel(type))
    
}

/* CHART UPDATES */

// Create type variable to store selection from dropdown
let type = document.querySelector('#group-by').value

// Call the update function to update the data
d3.csv('coffee-house-chains.csv', d3.autoType).then(data => {
    console.log("data", data)
    update(data,type); 

    d3.select('#group-by')
        .on('change', (event,d) => {
            type = event.target.value;
            update(data, type);
        })
                
    d3.select('#sort')
        .on('click', (event,d) => {
            if (sort == 0) {
                sort = 1
            } else {
                sort = 0
            }
            update(data, type) 
        })

});



