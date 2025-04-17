const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Build the metadata panel
function buildMetadata(year) {
  d3.csv("data/reports_by_month.csv").then((data) => {

    // Get the sightings data
    let reports = data

    // Filter the samples for the object with the desired sample number
    const yearData = reports.filter(d => d["sighting_year"] === year);
    
    // Convert string to number
    yearData.forEach(d => d.count = +d.count);

    const total = d3.sum(yearData, d => d.count);
    const avg = (total / yearData.length).toFixed(1);
    
    const busiest = d3.max(yearData, d => d.count);
    const quietest = d3.min(yearData, d => d.count);
    const maxMonth = yearData.find(d => d.count === busiest)["sighting_month"];
    const minMonth = yearData.find(d => d.count === quietest)["sighting_month"];

    const selection = {
      "Busiest Month": `${monthNames[maxMonth - 1]} (${busiest})`,
      "Quietest Month": `${monthNames[minMonth - 1]} (${quietest})`,
      "Total Sightings": total,
      "Monthly Avg": avg,
    }

    // Use d3 to select the panel with id of `#sighting-metadata`
    const panel = d3.select("#sighting-metadata")

    // Use `.html("") to clear any existing metadata
    panel.html("")

    // Inside a loop, you will need to use d3 to append new
    // tags for each key-value in the filtered metadata.
    Object.entries(selection).forEach(([key, value]) => {
      d3.select("#sighting-metadata").append("p").html(`${key.toUpperCase()}: ${value}`)
    });
  });
}

// function to build both charts
function buildCharts(year) {
  d3.csv("data/reports_by_month.csv").then((data) => {

    // Get the sightings data
    let reports = data
    
    // Filter the sightings for the selected year and reverse the order to start from January instead of December
    yearlyReports = reports
      .filter(report => report["sighting_year"] == year)
      .sort((a, b) => +a["sighting_month"] - +b["sighting_month"]);
    
    // Create a Set to store unique Sighting Year values
    const months = []
    const monthlyCount = []
    
    // Iterate through the sightings array 
    // Add month name and monthly count to the appropriate list
    yearlyReports.forEach(report => {
      const monthNum = parseInt(report["sighting_month"], 10);
      months.push(monthNames[monthNum - 1]);
      monthlyCount.push(+report["count"])
    });
    
    // Build a Line Chart
    let trace = [{
      x: months,
      y: monthlyCount,
      type: "lines",
      mode:'lines+markers',
      line: {
        color: '#a0f59f',
        width: 4,
        dash: 'solid'
      },
      marker: {
        size: 10
      }
    }];
    
    // Configuring the chart 
    const chartLayout = {
      title: "Sightings by Month in " + year,
      plot_bgcolor: "#1e1e1e",
      paper_bgcolor: "#1e1e1e",
      font: { 
        family: "Audiowide, sans-serif", // Global font override
        color: "#fff"
      },
      xaxis: {
        linecolor: 'lightgray',
        gridcolor: 'lightgray',
        title: {
          text: 'Month'
        },
        tickmode: 'array',
        tickvals: months
      },
      yaxis: {
        linecolor: "lightgray",
        gridcolor: 'lightgray',
        title: {
          text: '# of Sightings'
        }
      }
    }
  
    Plotly.newPlot("linechart", trace, chartLayout);
  });
}

// Function to run on page load
function init() {
  d3.csv("data/reports_by_month.csv").then((data) => {

    // Get the names field
    const reports = data;

    // Create a Set to store unique Sighting Year values
    const uniqueYears = new Set();
    
    // Iterate through the sightings array and add Sighting Year to the Set
    reports.forEach(report => {
      uniqueYears.add(report["sighting_year"]);
    });
    
    // Convert Set to an Array, sort it by year descending
    const sortedYears = [...uniqueYears].sort((a, b) => b - a);


    // Use d3 to select the dropdown with id of `#selDataset`
    const dropdown = d3.select("#selDataset")

    // Use the list of years to populate the select options
    // Inside a loop, you will need to use d3 to append a new
    // option for each year.
    sortedYears.forEach((year) => {
      dropdown.append("option")
      .text(year)
      .property("value", year)
    });

    // Get the first sample from the list
    const firstYear = sortedYears[0]

    // Build charts and metadata panel with the first year
    buildCharts(firstYear)
    buildMetadata(firstYear)
  });
}

// Function for event listener
function optionChanged(newYear) {
  // Build charts and panel each time a new year is selected
  buildCharts(newYear)
  buildMetadata(newYear)
}

// Initialize the page
init();