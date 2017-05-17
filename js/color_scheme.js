/**
  *   Color scheme and color bar related functions.
  **/

// Get color scheme from color brewer, slice(1, 18) only get the sequential ones.
var color_data = d3.entries(colorbrewer).slice(1,18);

var default_color_scheme = ["#f7f4f9",
                              "#00d0e5",
                              "#0089e1",
                              "#0044dd",
                              "#0001d9",
                              "#3e00d5",
                              "#7b00d2",
                              "#b700ce",
                              "#ca44a3",
                              "#c60065",
                              "#c24429"];

// Add the default color scheme.
color_data.push({key: 'Default',
                 value: {11: default_color_scheme}});

// Add the YlOrBr2 scheme 11 version.
color_data.push({key: 'YlOrBr2',
                 value: {11: ["#f7f4f9",
                              "#fff7bc",
                              "#fee391",
                              "#fec44f",
                              "#fe9929",
                              "#f28000",
                              "#ec7014",
                              "#cc4c02",
                              "#b35900",
                              "#804000",
                              "#662506"]}});

// color_data.push({key: 'Default',
//                  value: {11: ["#f7f4f9","#00d0e5", "#0089e1", "#0044dd", "#0001d9", "#3e00d5","#7b00d2", "#b700ce","#ef3b2c", "#cb181d", "#a50f15"]}});

// Add white to be the color less than 5% to every color scheme.
color_data.forEach(function(d){
  var color_scheme = d["value"][9];
  if(color_scheme != undefined){
  for(var i = color_scheme.length-1; i>=0; i--){
    color_scheme[i+1] = color_scheme[i];
  }
    color_scheme[0] = "#f7f4f9";
  }
});

// Default domain.
var domain_vals = [.05, .15 ,.25, .35, .45, .55, .65, .75, .85, .95];

// color scale threshold.
var threshold = d3.scaleThreshold()
    .domain(domain_vals)
    .range(default_color_scheme);


// Color bar
d3.select("#color_bar_span")
  .selectAll(".palette")
  .data(color_data)
  .enter().append("span")
  .attr("class", "palette")
  .attr("id",function(d){
    return d.key;
  })
  .attr("title", function(d) { return d.key; })
  .on("click", function(d) {

    d3.selectAll(".palette").style("background", "#fff");
    d3.select(this).style("background", "#aaa");

    new_colorrange = d3.values(d.value)[d3.values(d.value).length-1];
    var length = new_colorrange.length;

    if(length == 10){
      domain_vals = [.05, .10 , .35, .45, .55, .65, .75, .85, .95];
    }else{
      domain_vals = [.05, .15 ,.25, .35, .45, .55, .65, .75, .85, .95];
    }

    // update threshold
    threshold = d3.scaleThreshold()
      .domain(domain_vals)
      .range(new_colorrange);

    // update ticks.
    barAxis.tickValues(threshold.domain());
    update_color_bar(1);
  })
  .selectAll(".swatch")
    .data(function(d) { return d.value[d3.keys(d.value).map(Number).sort(d3.descending)[0]]; })
  .enter().append("span")
  .attr("class", "swatch")
  .style("background-color", function(d) { return d; });

d3.select("#Default").style("background", "#aaa");


// color bar drag function.

var drag = d3.drag()
    .on('start', function(d) {
        others = [];
        threshold.domain().forEach(function(v) {
            if ( v == d ) return;
            others.push(v);
        });
    })
    .on('drag', function(d) {

      // In case the draged threshold pass through lower or higher threshold.
      var xMin = xBar.domain()[0], xMax = xBar.domain()[1];
      var newValue = xBar.invert(d3.event.x);
      newValue =
        newValue < xMin ? xMin :
        xMax < newValue ? xMax :
        newValue;
      var newDomain = others.slice();
        newDomain.push(newValue);
        newDomain.sort();
        threshold.domain(newDomain);
        barAxis.tickValues(newDomain);
        update_color_bar(1);
    });


// color bar svg.
var color_svgs = d3.selectAll(".button_div").append("svg")
    .attr("id","color_bar_new")
    .attr("width", "350px")
    .attr("height", "50px");

var color_gs = color_svgs.append("g")
    .attr("class", "key")
    .attr("transform", "translate(" + 1 + "," + 2 + ")");

var color_rects = color_gs.append("g");



/**
  *  Update color bar when adjuesting color bar and change of color scheme.
  *
  *  @param flag: Decide wether to update the maps.
  **/

function update_color_bar(flag){

  // update color bar.
  var color_rect = color_rects.selectAll(".range")
        .data(threshold.range().map(function(color) {
          var d = threshold.invertExtent(color);
          if (d[0] == null) d[0] = xBar.domain()[0];
          if (d[1] == null) d[1] = xBar.domain()[1];
          return d;
        }));

  color_rect.exit().remove();

  color_rect.enter().append("rect").merge(color_rect)
    .attr("class", "range")
    .attr("height", 15)
    .attr("x", function(d) { return xBar(d[0]); })
    .attr("width", function(d) { return xBar(d[1]) - xBar(d[0]); })
    .on("click",function(){
      modal.style.display = "block";
    })
    .style("fill", function(d) {
      return threshold(d[0]);
    })
    .style("cursor","pointer");

  // update color ticks.
  var ticks = color_gs.call(barAxis)
      .selectAll(".tick")
      .style("cursor", "ew-resize");

  // ticks call drag callback function.
  ticks.call(drag)
            .append("rect")
            .attr("x", -3)
            .attr("width", 6)
            .attr("height", 13)
    .attr("fill-opacity", 0);


  // update coreset data color
  coresetData.forEach(function(d){
    var percent = parseFloat(d.value)/max;
    var color_value = 0.0;

    threshold.range().map(function(color) {
      var d = threshold.invertExtent(color);
      if (d[0] == null) d[0] = xBar.domain()[0];
      if (d[1] == null) d[1] = xBar.domain()[1];
      if(percent > d[0] && percent <= d[1]){
        //console.log(d[0]);
        color_value = d[0];
      }
    });

    // if d.color equals #fff, means the the density region has been seen as chaos.
    // adjusting color bar or color scheme would be seen as unvalid.
    if(d.color != "#fff"){
      d.color = threshold(color_value);
    }
    d.originColor = threshold(color_value);
  });


  // update right coreset data color
  right_coresetData.forEach(function(d){
    var percent = parseFloat(d.value)/right_max;
    var color_value = 0.0;

    threshold.range().map(function(color) {
      var d = threshold.invertExtent(color);
      if (d[0] == null) d[0] = xBar.domain()[0];
      if (d[1] == null) d[1] = xBar.domain()[1];
      if(percent > d[0] && percent <= d[1]){
        //console.log(d[0]);
        color_value = d[0];
      }
    });

    // if d.color equals #fff, means the the density region has been seen as chaos.
    // adjusting color bar or color scheme would be seen as unvalid.
    if(d.color != "#fff"){
      d.color = threshold(color_value);
    }
    d.originColor = threshold(color_value);

    //d.originColor = threshold(color_value);
  });

  // If flag equals to 0, do not update the maps.
  if(flag == 1){
    map_draw();
    right_map_draw();
  }
}
