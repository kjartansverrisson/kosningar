var width = 960,
    height = 600;

// var color = d3.scale.linear()
//   .domain([0, 0.5, 1])
//   .range(["darkblue","#eee","deeppink"]); 
var color = d3.scale.threshold()
    .domain([.5, .6, .7, .8, .9])
    .range(["#f2f0f7", "#dadaeb", "#bcbddc", "#9e9ac8", "#756bb1", "#54278f"]);

var svg = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geo.conicConformal()
    .center([0, 65])
    .rotate([18, 0])
    .parallels([18, 25])
    .scale(6500)
    .translate([width / 2, height / 2]);

d3.tsv("svf-by-gender.tsv", function(error, sveitarfelog){

  var svfById = d3.map();
  sveitarfelog.forEach(function(d, i){
    svfById.set(d.svf_id, {
      ratio: parseInt(d.konur) / (parseInt(d.karlar)+ parseInt(d.konur)), 
      konur: d.konur, 
      karlar: d.karlar,
      konurkjorskra: d.konurkjorskra,
      karlarkjorskra: d.karlarkjorskra,
      total: parseInt(d.konurkjorskra) + parseInt(d.karlarkjorskra),
      kjorsokn: 100* parseInt(d.thatttaka) / (parseInt(d.konurkjorskra) + parseInt(d.karlarkjorskra))
    });
  });

  d3.json("../maps/sveitarfelog.json", function(error, k) {
    var subunits = topojson.object(k, k.objects.sveitarfeloggeo);
    var path = d3.geo.path()
      .projection(projection);
    svg.append("path")
      .datum(subunits)
      .attr("d", path);
    svg.selectAll(".subunit")
      .data(subunits.geometries)
      .enter().append("path")
        .attr("class", function(d) { return "kjordaemi kjordaemi-" + d.id; })
        .attr("d", path)
        .attr("fill", function(d) {
          var obj = svfById.get(+d.id);
          if (obj !== undefined) {
            if (!isNaN(obj.kjorsokn)) {
              return color(obj.kjorsokn);
            } else {
              return "darkred"
            }
          } 
        });



    $('svg .kjordaemi').tipsy({
      gravity: 'w',
      html: true,
      title: function() {
        var d = this.__data__;
        var obj = svfById.get(d.id);
        if (obj !== undefined) {
          if (!isNaN(obj.kjorsokn)) {
            return d.properties.name + "<br/>Kjörsókn: " + obj.kjorsokn.toFixed(2) + "%";
          } else {
            return d.properties.name + "<br/>Kjörsókn: Gögn ekki til";
          }
        }
        else {
          return d.properties.name;
        }
      }
    });

    var legendData = [
      {value: 0.5, label: "50% kjörsókn"},
      {value: 0.6, label: ""},
      {value: 0.7, label: ""},
      {value: 0.8, label: ""},
      {value: 0.9, label: ""},
      {value: 1, label: "100% kjörsókn"}
    ];

    var legend = svg.selectAll(".legend")
          .data(legendData.reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate(-120," + (350 + i * 20) + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", function(d){ return color(d.value);});

      legend.append("text")
          .attr("x", width + 10)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "start")
          .text(function(d) { return d.label; });

  });

  
});