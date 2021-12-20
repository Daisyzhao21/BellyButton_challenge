// Use the D3 library to read in samples.json.
// Create a horizontal bar chart with a dropdown menu to display the top 10 OTUs found in that individual.
//     Use sample_values as the values for the bar chart.
//     Use otu_ids as the labels for the bar chart.
//     Use otu_labels as the hovertext for the chart.
let samplesPath = "http://127.0.0.1:8080/data/samples.json"
function init() {
  console.log(samplesPath);
  var dropdownMenu = d3.select("#selDataset");
  d3.json(samplesPath).then((data) => {
    var name_list = data.names;
    console.log(name_list);
    name_list.forEach((idNo) => {
      dropdownMenu
        .append('option')
        .text(idNo)
        .property('value');
    });

    firstId = name_list[0];
    addDemoInfo(firstId);
    addCharts(firstId);
    addGauge(firstId);
    info_table.append("p")
      .text("In the above dropdown, select an ID.");

  }).catch(function (e) { console.log(e) });

};

id_selection = d3.select("#selDataset").on("change", optionChanged);
function optionChanged(idNo) {
  console.log("switch idno---------------" + idNo);
  addDemoInfo(idNo);
  addCharts(idNo);
  addGauge(idNo);
};

function addDemoInfo(idNo) {
  info_table = d3.select("#sample-metadata");
  info_table.html("");
  d3.json(samplesPath).then((importedData) => {
    var metaInfo = importedData.metadata;
    var filteredInfo = metaInfo.filter(obj => obj.id == idNo);
    // alert(JSON.stringify(filteredInfo));
    var selectedInfo = filteredInfo[0];
    if(selectedInfo){
    Object.entries(selectedInfo).forEach(([key, value]) => {
      console.log(key, value);
      info_table.append("h6").text(`${key}: ${value}`);
      console.log(info_table);
    });
  }
  });

}
// Create a horizontal bar chart
function addCharts(idNo) {
  d3.json(samplesPath).then((data) => {
    var metaData = data.samples;
    var filteredSampInfo = metaData.filter(obj => obj.id == idNo)[0];
    if(!filteredSampInfo){
      // alert(JSON.stringify(filteredSampInfo))
      return
    }
   
    // y-values: otu_ids
    var samp_otu_id = filteredSampInfo.otu_ids;
    // Top 10 otu_ids
    var top_otu_id = samp_otu_id.slice(0, 10);
    // Top 10 otu_ids in a string, e.g. OTU 1167
    var str_top_otu_id = top_otu_id.map(obj => "OTU " + obj);

    // x-values: sample_values *Sample values are already descending in samples.json data
    var sample_vals = filteredSampInfo.sample_values;

    // Top 10 counts of the otu_ids
    var top_sample_vals = sample_vals.slice(0, 10);

    // otu_labels (for the bubble chart)
    var otu_labs = filteredSampInfo.otu_labels;

    //Plot the bar chart
    var trace = {
      x: top_sample_vals.reverse(),
      y: str_top_otu_id.reverse(),
      type: "bar",
      orientation: 'h'
    };

    var data = [trace];

    var layout = {
      xaxis: { title: "Count" },
      yaxis: { title: "OTU ID" }
    };

    Plotly.newPlot("bar", data, layout);


    // Create a bubble chart 
    var trace = {
      x: samp_otu_id,
      y: sample_vals,
      text: otu_labs,
      mode: 'markers',
      marker: {
        size: sample_vals,
        color: sample_vals, // Colours grouped by sample_vals i.e. In this instance, grouped by size
        colorscale: 'Portland'
      }

    };

    var data = [trace];

    var layout = {
      xaxis: { title: "OTU ID" },
      yaxis: { title: "Count" },
      showlegend: false,
      height: 600,
      width: 1200
    };

    Plotly.newPlot("bubble", data, layout);

  });

};

init();
