var minX = -89.582541, maxX = -81.960144, minY = 36.3, maxY = 39.3;
//124.16 145.571
//24.3471 45.4094
//var minX = -75.2781, maxX = -74.9576, minY = 39.8763, maxY = 40.1372;
//var minX = 124.16, maxX = 145.571, minY = 24.3471, maxY = 45.4094;
// -75.2781 -74.9576 39.8763 40.1372
var ken = [];
var norData = [];
var coresetData = [];
var colorRange = ["rgba(194,68,41, 1.0)", "rgba(198,0,101, 1.0)","rgba(202,68,163, 1.0)", "rgba(183,0,206, 1.0)", "rgba(123,0,210, 1.0)", "rgba(62,0,213, 1.0)", "rgba(0,1,217, 1.0)", "rgba(0,68,221, 1.0)", "rgba(0,137,225, 1.0)", "rgba(0,208,229, 1.0)"];

var res = 200.0;
var edge = 500.0;
var delta = edge/res;

var max = 0.037657;
var o_max = 0.037657;

var full_size = 199162;
var full_data_length = 0;

var percent = 1.0;

var scale_value = 1.0;
var transform_x = 0.0;
var transform_y = 0.0;

var r_transform_x = 0.0;
var r_transform_y = 0.0;

var rescale_x = 0;
var rescale_y = 0;

var STD = 0.01;

var color_data = d3.entries(colorbrewer).slice(1,18);
color_data.splice(0,1);
color_data.push({key: 'Default',
                 value: {11: ["#f7f4f9","#00d0e5", "#0089e1", "#0044dd", "#0001d9", "#3e00d5","#7b00d2", "#b700ce", "#ca44a3", "#c60065", "#c24429"]}});
color_data.push({key: 'YlOrBr2',
                 value: {11: ["#ffffe5",
                              "#fff7bc",
                              "#fee391",
                              "#fec44f",
                              "#fe9929",
                              "#f28000",
                              "#ec7014",
                              "#cc4c02",
                              "#b35900",
                              //                              "#993404",
                              "#804000",
                              "#662506"]}});

// color scale.
var scale = 'Blues';

var formatPercent = d3.format(".0%");

var domain_vals = [.05, .15 ,.25, .35, .45, .55, .65, .75, .85, .95];

var threshold = d3.scaleThreshold()
    .domain(domain_vals)
    .range(["#f7f4f9","#00d0e5", "#0089e1", "#0044dd", "#0001d9", "#3e00d5","#7b00d2", "#b700ce", "#ca44a3", "#c60065", "#c24429"]);


d3.select("#colorbrewer_selection")
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

    if(length == 9){
      domain_vals = [.05, .15 ,.25, .35, .55, .65, .85, .95];
    }else{
      domain_vals = [.05, .15 ,.25, .35, .45, .55, .65, .75, .85, .95];
    }

    // update threshold
    threshold = d3.scaleThreshold()
      .domain(domain_vals)
      .range(new_colorrange);

    // update ticks.
    barAxis.tickValues(threshold.domain());

    console.log(domain_vals);
    update_color_bar(1);
    console.log(d3.values(d.value).map(JSON.stringify).join("\n"));
  })
  .selectAll(".swatch")
    .data(function(d) { return d.value[d3.keys(d.value).map(Number).sort(d3.descending)[0]]; })
  .enter().append("span")
  .attr("class", "swatch")
  .style("background-color", function(d) { return d; });

d3.select("#Default").style("background", "#aaa");

var xBar = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 340]);

var barAxis = d3.axisBottom(xBar)
    .tickSize(20)
    .tickValues(threshold.domain())
    .tickFormat(function(d) { return formatPercent(d); });


var others;

var drag = d3.drag()
    .on('start', function(d) {
      console.log("come in start");
        others = [];
        threshold.domain().forEach(function(v) {
            if ( v == d ) return;
            others.push(v);
        });
    })
    .on('drag', function(d) {
      console.log("come in drag");
        var xMin = xBar.domain()[0], xMax = xBar.domain()[1];
        var newValue = xBar.invert(d3.event.x);
        newValue =
            newValue < xMin ? xMin :
            xMax < newValue ? xMax :
            newValue;
      var newDomain = others.slice();
        newDomain.push(newValue);
        newDomain.sort();
        console.log(newDomain);
        threshold.domain(newDomain);
        barAxis.tickValues(newDomain);
        update_color_bar(1);
    });

var color_svgs = d3.select("#coreset").append("svg")
    .attr("id","color_bar_new")
    .attr("width", 500)
    .attr("height", 50);

var color_gs = color_svgs.append("g")
    .attr("class", "key")
    .attr("transform", "translate(" + 1 + "," + 2 + ")");

var color_rects = color_gs.append("g");


function update_color_bar(flag){

  var color_rect = color_rects.selectAll(".range")
        .data(threshold.range().map(function(color) {
          var d = threshold.invertExtent(color);
          if (d[0] == null) d[0] = xBar.domain()[0];
          if (d[1] == null) d[1] = xBar.domain()[1];
          console.log(d);
          return d;
        }));

  color_rect.exit().remove();

  color_rect.enter().append("rect").merge(color_rect)
    .attr("class", "range")
    .attr("height", 15)
    .attr("x", function(d) { return xBar(d[0]); })
    .attr("width", function(d) { return xBar(d[1]) - xBar(d[0]); })
    .style("fill", function(d) {
      // console.log('fill:',d[0]);
      // console.log(threshold(0));
      return threshold(d[0]);
    });

  var ticks = color_gs.call(barAxis)
      .selectAll(".tick")
      .style("cursor", "ew-resize");

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

    d.color = threshold(color_value);
    d.originColor = threshold(color_value);
  });

  if(flag == 1){
    draw();
  }else{
    draw_canvas();
  }

  //update fullset data color
  fullData.forEach(function(d){
    var percent = parseFloat(d.value)/0.037657;
    var color_value = 0.0;

    threshold.range().map(function(color) {
      var d = threshold.invertExtent(color);
      if (d[0] == null) d[0] = xBar.domain()[0];
      if (d[1] == null) d[1] = xBar.domain()[1];
      if(percent > d[0] && percent <= d[1]){
        color_value = d[0];
      }
    });

    d.color = threshold(color_value);
  });

   if(flag == 1){
    draw_full();
    zoomed_rescale();
  }else{
    draw_full_canvas();
  }
}



d3.csv("../data/kentucky_org.txt",function(data){
  console.log(data);
  update_color_bar(0);
  ken = [];
  var epsilon = 0.03;

  var size = Math.floor(1/(epsilon*epsilon)*Math.log(1000));

  //size = 199162;
  if(size > data.length){
    size = data.length;
  }

  console.log(size);
  set_data_size(size);

  percent = parseFloat(size)/parseFloat(full_size);

  if(STD > 0.01){
    STD = 0.01;
  }

  var sampleList = [];

  var tmpMinX = 10000;
  var tmpMaxX = -10000;

  var tmpMinY = 10000;
  var tmpMaxY = -10000;

  data.forEach(function(d,i){
    //nothing
    var tmpX;
    var tmpY;
    Object.values(d).forEach(function(item){
      var items = item.split(" ");
      tmpX = parseFloat(items[0]);
      tmpY = parseFloat(items[1]);
    });

    if (tmpX < tmpMinX){
      tmpMinX = tmpX;
    }
    if (tmpX > tmpMaxX){
      tmpMaxX = tmpX;
    }

    if(tmpY < tmpMinY){
      tmpMinY = tmpY;
    }

    if(tmpY > tmpMaxY){
      tmpMaxY = tmpY;
    }

    if(i<size){
      sampleList.push(d);
    }else{
      var j = Math.floor((Math.random() * i));
      if(j<size){
        sampleList[j] = d;
      }
    }
  });
  // var formatedList = [];
  console.log(tmpMinX + " " + tmpMaxX);
  console.log(tmpMinY + " " + tmpMaxY);

  sampleList.forEach(function(d){
    var cordinate = [];
    Object.values(d).forEach(function(item){
      var items = item.split(" ");
      ken.push({'x':parseFloat(items[0]), 'y':parseFloat(items[1])});
    });
  });


  full_data_length = ken.length;
  //coreset();
  d3.select("#std-value").text((STD).toFixed(4));
  d3.select("#std").property("value", parseFloat(STD));
  var d0 = performance.now();
  getCore(STD, 101, 0.15);
  var d1 = performance.now();
  console.log("full_data:" + (d1-d0));
  set_time((d1-d0)/1000);
  draw_canvas(0);
});


/**
  * Do random sampling every time when adjust the epsilon.
  * @param std: standard deviration.
  * @param epsilon: Decide the size of samples.
**/

function randomSample(std, epsilon, flag){

  // r_transform_x = transform_x;
  // r_transform_y = transform_y;

  // x = d3.scaleLinear()
  //   .range([-1+r_transform_x, width+1+r_transform_x])
  //   .domain([-maxX, -minX]);

  // y = d3.scaleLinear()
  //   .range([-1+r_transform_y, height+1+r_transform_y])
  //   .domain([maxY, minY]);

  d3.csv("../data/kentucky_org.txt",function(data){
    ken = [];

    // Updata data set.
    var size = Math.floor(1/(epsilon*epsilon)*Math.log(1000));
    set_data_size(size);

    percent = parseFloat(size)/parseFloat(full_size);

    // When we change the epsilon, std should be porpotional to the size of samples.
    // if(epsilon < 0.2){
    //   STD = 0.01 * Math.sqrt(percent) + 0.0075;
    // }else{
    //   STD = 0.01 * Math.sqrt(percent) + 0.006;
    // }

    if(STD > 0.01){
      STD = 0.01;
    }

    // Random sample.
    var sampleList = [];
    data.forEach(function(d,i){
      if(i<size){
        sampleList.push(d);
      }else{
        var j = Math.floor((Math.random() * i));
        if(j<size){
          sampleList[j] = d;
        }
      }
    });

    // Change the data format.
    sampleList.forEach(function(d){
      var cordinate = [];
      Object.values(d).forEach(function(item){
        var items = item.split(" ");
        ken.push({'x':parseFloat(items[0]), 'y':parseFloat(items[1])});
      });
    });

    if(flag == 1){
      std = STD;
    }

    // Update std text.
    d3.select("#std-value").text((std).toFixed(4));
    d3.select("#std").property("value", parseFloat(std));

    var t0 = performance.now();
    // Get core set
    getCore(std, 501, 0.15);
    var t1 = performance.now();

    set_time((t1-t0)/1000);
    draw();
    zoomed_rescale();
    //draw_canvas(1);
  });

}


function readFile(fileName){

  d3.csv("../data/"+fileName, function(data){
  ken = [];
  var epsilon = 0.05;
  var size = Math.floor(1/(epsilon*epsilon)*Math.log(1000));
  var sampleList = [];
  data.forEach(function(d,i){
    //nothing
    if(i<size){
      sampleList.push(d);
    }else{
      var j = Math.floor((Math.random() * i));
      if(j<size){
        sampleList[j] = d;
      }
    }
  });
 // var formatedList = [];
  sampleList.forEach(function(d){
    var cordinate = [];
    Object.values(d).forEach(function(item){
      var items = item.split(" ");
      ken.push({'x':parseFloat(items[0]), 'y':parseFloat(items[1])});
    });
  });

});
}

var zoom;

// var svg = d3.select("#coreset").append('svg')
//     .attr('width',700)
//     .attr('height', 500)
//     .append('g')
//     .attr('transform', "translate(100 200)");
//var width = +svg.attr("width");
//var height = +svg.attr("height");
var width = 700;
var height = 500;

var xscale = d3.scaleLinear()
    .domain([1,501])
    .range([0.1, (maxX-minX)]);

var reverseXscale = d3.scaleLinear()
    .domain([0.1, (maxX-minX)])
    .range([1,501]);

var yscale = d3.scaleLinear()
    .range([-maxY,-minY])
    .domain([minY,maxY]);

var x = d3.scaleLinear()
    .range([-1, width+1])
    .domain([-maxX, -minX]);

var y = d3.scaleLinear()
    .range([-1, height+1])
    .domain([maxY, minY]);


/**
 * Update and get the core set.
 *
 * @param std  standard deviration.
 * @param radius use as the distance between chaos and some density.
 * @param tau the density level (0.15, 0.25 ...)
 */
function getCore(std, radius, tau){

  norData = normalize();

  var x = 1.0;
  var y = (maxY-minY)/(maxX-minX);

  // fill with density rectangles.
  fill(norData, std, x, y);
  // kill chaos.
  killChaos(std, radius, tau);

}

function killChaos(std, radius, tau){

  console.log('tau:' + tau);
  console.log('real Radius' + radius);
  coresetData.forEach(function(d){
    if(d.value >= 0.05*max){
      //console.log(">epsilon");
      var flag = false;
      coresetData.forEach(function(k){
        if(k.value >= tau*max && eval_range(d.x, d.y, k.x, k.y, std) < radius){
          flag = true;
          d.color = d.originColor;
        }
      });
      if(!flag){
        d.color = "#fff";
      }
    }
  });
  //updateHeapMap();
  //draw_canvas();
  draw();
  zoomed_rescale();
  //return coresetData;
}

function eval_range(qx, qy, xx, xy, std){
  var dist = (qx-xx)*(qx-xx) + (qy-xy)*(qy-xy);
  return Math.sqrt(dist);
}


/**
 * Update and get the core set.
 *
 * @param norData normalized data.
 * @param std standard deviation.
 * @param x x boundry.
 * @param y y boundry.
 */
function fill(norData, std, x, y){

  coresetData = [];

  console.log("norData");
  console.log(norData);
  // Update the max density.
  var v = 0.0;
  var cur_max = 0.0;
  for(var i=0.0; i<edge*x; i+=delta){
    for(var j=0.0; j<edge*y; j+=delta){
      v = kde_kernel(norData, std, (i+delta/2.0)/edge, (j+delta/2.0)/edge);
      if (v > cur_max){
        cur_max = v;
      }
    }
  }

  max = cur_max;
  console.log("max:" + max);

  /**
   * Fill the rectangles base on the density
   * x  location x.
   * y  location y.
   * color  density color.
   * originColor  remenber the original color.
   * delta  retangle size.
   * value  density value.
   */

  for(var i=0.0; i<edge*x; i+=delta){
    for(var j=0.0; j<edge*y; j+=delta){
      var value = kde_kernel(norData, std, (i+delta/2.0)/edge, (j+delta/2.0)/edge);
      var percent = parseFloat(value)/max;

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

      if(color_value >= 0.05){
        coresetData.push({"x":i, "y":j, "color": threshold(color_value), "originColor": threshold(color_value) ,"delta":delta, "value":value});
      }
      // if(value > 0.95*max){
      //   coresetData.push({"x":i, "y":j, "color":"rgba(194,68,41, 1.0)", "originColor": colorRange[0],"delta":delta, "value":value});
      // }else if(value > 0.85*max){
      //   coresetData.push({"x":i, "y":j, "color":"rgba(198,0,101, 1.0)", "originColor": colorRange[1],"delta":delta, "value":value});
      // }else if(value > 0.75*max){
      //   coresetData.push({"x":i, "y":j, "color":"rgba(202,68,163, 1.0)", "originColor": colorRange[2], "delta":delta, "value":value});
      // }else if(value > 0.65*max){
      //   coresetData.push({"x":i, "y":j, "color":"rgba(183,0,206, 1.0)", "originColor": colorRange[3], "delta":delta, "value":value});
      // }else if(value > 0.55*max){
      //   coresetData.push({"x":i, "y":j, "color":"rgba(123,0,210, 1.0)", "originColor": colorRange[4],"delta":delta, "value":value});
      // }else if(value > 0.45*max){
      //   coresetData.push({"x":i, "y":j, "color":"rgba(62,0,213, 1.0)", "originColor": colorRange[5],"delta":delta, "value":value});
      // }else if(value > 0.35*max){
      //   coresetData.push({"x":i, "y":j, "color":"rgba(0,1,217, 1.0)", "originColor": colorRange[6],"delta":delta, "value":value});
      // }else if(value > 0.25*max){
      //   coresetData.push({"x":i, "y":j, "color":"rgba(0,68,221, 1.0)", "originColor": colorRange[7],"delta":delta, "value":value});
      // }else if(value > 0.15*max){
      //   coresetData.push({"x":i, "y":j, "color":"rgba(0,137,225, 1.0)", "originColor": colorRange[8],"delta":delta, "value":value});
      // }else if(value > 0.05*max){
      //   coresetData.push({"x":i, "y":j, "color":"rgba(0,208,229, 1.0)", "originColor": colorRange[9],"delta":delta, "value":value});
      // }
    }
  }
  //return coresetData;
}

function kde_kernel(norData, std, x, y){
  var count = 0.0;
  var coeff = 1.0;
  STD = 0.01;

  norData.forEach(function(d){
    var dist = (x-d.x_nor)*(x-d.x_nor) + (y-d.y_nor)*(y-d.y_nor);
    //console.log(dist);
   // if (dist <= 8.0*std/(maxX - minX)){
    count += coeff*Math.exp(-dist/(2.0*STD*STD));
   //console.log(count);
  //  }
  });

  return parseFloat(count)/(norData.length+1);
}

function update(std, radius, tau){

  d3.select("#std-value").text(std);
  d3.select("#std").property("value", std);

  getCore(std, radius, tau);

  //updateHeapMap(coresetData);
  //draw_canvas();
}

var canvas;

  d3.selectAll('.coreset_svg').remove();

  var svg = d3.select("#coreset").append('svg')
      .attr('width',700)
      .attr('height', 500)
      .attr('class', 'coreset_svg')
      .append('g');
      //.call(zoom);

  var xAxis = d3.axisBottom(x)
      .ticks(width/height*10)
      .tickSize(height)
      .tickPadding(8 - height);

  var yAxis = d3.axisRight(y)
      .ticks(10)
      .tickSize(width)
      .tickPadding(8 - width);

  //svg.selectAll("g").remove();
  var gx = svg.append("g")
      .attr("class", "axis axis-x")
      .call(xAxis);

  var gy = svg.append("g")
      .attr("class", "axis axis-y")
      .call(yAxis);

  function draw(){


    // canvas.save();
    // canvas.clearRect(0, 0, width, height);
    // canvas.translate(transform_x, transform_y);
    // canvas.scale(scale_value, scale_value);

    console.log(coresetData);
    coresetData.forEach(function(d){
      canvas.beginPath();
      canvas.rect(d.x+90, -d.y+350, d.delta, d.delta);
      canvas.fillStyle = d.color;
      canvas.fill();
      //canvas.closePath();
    });
  }

function draw_canvas(flag){


  //if(flag == 0){
    var transform = d3.zoomIdentity;
    var zoom = d3.zoom()
      .scaleExtent([1/scale_value,40/scale_value])
      .translateExtent([[-width,-height],[width, height]])
      .on("zoom", zoomed);
  //}
  d3.select('#coreset').selectAll('div').remove();
  //d3.select('#coreset').selectAll('g').remove();

  var char_div = d3.select('#coreset').append('div')
      .attr('id','char_div')
      .style('left', 200)
      .style('top', -500);

  char_div.selectAll("canvas").remove();

  var core_canvas = char_div.append("canvas")
      .attr('id','main_canvas')
      .attr('width', width)
      .attr('height', height)
      .on("click", clickFunction);



  canvas = core_canvas.node().getContext("2d");


  d3.selectAll(".coreset_svg").call(zoom);


  // var color_scale_bar_g = d3.selectAll(".color_bar_svg").selectAll("g")
  //     .data(colorRange).enter().append("g");

  // color_scale_bar_g.append("rect")
  //   .attr("width", 10)
  //   .attr("height", 20)
  //   .attr("x", 20)
  //   .attr("y", function(d,i){
  //     return i*20;
  //   })
  //   .attr("fill", function(d){
  //     return d;
  //   });

  // color_scale_bar_g.append("text")
  //   .attr("x",20)
  //   .attr("y",function(d,i){
  //     return (i+1)*20;
  //   })
  //   .text(function(d,i){
  //     return (95-(i)*10)+"%";
  //   });
  //0.037657

  //getCore(0.01, 501, 0.15);

  draw();


}


function zoomed_rescale(){

    canvas.save();
    canvas.clearRect(0, 0, width, height);

    canvas.translate(transform_x, transform_y);
    canvas.scale(scale_value, scale_value);

    // scale_value = transform.k;
    // transform_x = transform.x;
    // transform_y = transform.y;

    // rescale_x = d3.event.transform.rescaleX(x);
    // rescale_y = d3.event.transform.rescaleY(y);

    draw();
  canvas.restore();

  full_canvas.save();
  full_canvas.clearRect(0, 0, width, height);

  full_canvas.translate(transform_x, transform_y);
  full_canvas.scale(scale_value, scale_value);

  draw_full();
  full_canvas.restore();

  if(rescale_x == 0){
    return;
  }
    gx.call(xAxis.scale(rescale_x));
    gy.call(yAxis.scale(rescale_y));
    full_gx.call(full_xAxis.scale(rescale_x));
    full_gy.call(full_yAxis.scale(rescale_y));
}
  function zoomed(){

    transform = d3.event.transform;
    // console.log(d3.event.translateX);

    canvas.save();
    canvas.clearRect(0, 0, width, height);

    canvas.translate(transform.x, transform.y);
    canvas.scale(transform.k, transform.k);

    scale_value = transform.k;
    transform_x = transform.x;
    transform_y = transform.y;

    rescale_x = d3.event.transform.rescaleX(x);
    rescale_y = d3.event.transform.rescaleY(y);

    console.log(scale_value);
    console.log(transform_x);
    console.log(transform_y);

    draw();
    canvas.restore();

    gx.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    gy.call(yAxis.scale(d3.event.transform.rescaleY(y)));

    //console.log(xAxis.rescale());

    full_canvas.save();
    full_canvas.clearRect(0, 0, width, height);

    full_canvas.translate(transform.x, transform.y);
    full_canvas.scale(transform.k, transform.k);



    draw_full();
    full_canvas.restore();

    full_gx.call(full_xAxis.scale(d3.event.transform.rescaleX(x)));
    full_gy.call(full_yAxis.scale(d3.event.transform.rescaleY(y)));
  }

function clickFunction(){

  var radius = d3.select("#radius").property("value");
  console.log(radius);
  console.log(d3.event.clientX);

  d3.select('.coreset_svg').append("circle")
    .attr("cx", d3.event.pageX-8)
    .attr("cy", d3.event.pageY-534)
    .attr("r", +radius*scale_value)
    .attr("fill-opacity","0")
    .attr("stroke","red")
    .transition()
      .duration(1000)
      //.ease(Math.sqrt)
      .remove();

}


d3.select("button")
  .on("click", reset);


function set_data_size(size){
  console.log("set data size");
  d3.select("#sample_value").text(+size);
}

function set_time(time){
  console.log("set time size");
  d3.select("#sample_time_value").text((+time).toFixed(1));
}

d3.select("#std").on("input", function(d){
  // var tau = d3.select("tau").property("tau");
  // var radius = d3.select("#radius").property("value");
  var epsilon = d3.select("#epsilon").property("value");

  d3.select("#std-value").text(+this.value);
  d3.select("#std").property("value", +this.value);
  //update(+this.value, radius, tau);
  randomSample(+this.value, epsilon, 0);

});

d3.select("#epsilon").on("input", function(d){
  var std = d3.select("#std").property("value");

  d3.select("#epsilon-value").text(+this.value);
  d3.select("#epsilon").property("value", +this.value);

  randomSample(std, +this.value, 1);

});

d3.select("#radius").on("input", function(d){
  var std = d3.select("#std").property("value");
  var tau = d3.select("#tau").property("value");

  d3.select("#radius-value").text(xscale(+this.value).toFixed(2));
  d3.select("#radius").property("value", +this.value);
  killChaos(std, +this.value, tau);
});

d3.select("#tau").on("input",function(d){
  var std = d3.select("#std").property("value");
  var radius = d3.select("#radius").property("value");

  d3.select("#tau-value").text(+this.value);
  d3.select("#tau").property("value", +this.value);

  killChaos(std, radius, +this.value);
});


function handleRadiusClick(event){

  var std = d3.select("#std").property("value");
  var value = document.getElementById("radius_input").value;

  var tau = d3.select("#tau").property("value");

  d3.select("#radius-value").text(value);
  d3.select("#radius").property("value", reverseXscale(parseFloat(value)));
  killChaos(std, reverseXscale(parseFloat(value)), tau);
  return false;
}

function handleTauClick(event){

  var std = d3.select("#std").property("value");
  var value = document.getElementById("tau_input").value;

  var radius = d3.select("#radius").property("value");

  d3.select("#tau-value").text(value);
  d3.select("#tau").property("value", +value);
  killChaos(std, radius, +value);
  return false;
}

function handleEpsilonClick(event){

  var std = d3.select("#std").property("value");
  var value = document.getElementById("epsilon_input").value;

  d3.select("#epsilon-value").text(value);
  d3.select("#epsilon").property("value", parseFloat(value));
  randomSample(std, parseFloat(value), 1);
  return false;
}

function handleStdClick(event){

  var epsilon = d3.select("#epsilon-value").text();
  var value = document.getElementById("std_input").value;

  d3.select("#std-value").text((+value).toFixed(4));
  d3.select("#std").property("value", parseFloat(value));
  randomSample(parseFloat(value), +epsilon, 0);
  return false;
}




function reset(){
  svg.transition().duration(500)
    .call(zoom.transform, d3.zoomIdentity);
}

function normalize(){
  var diff = maxX - minX > maxY - minY ? maxX - minX : maxY - minY;
  norData = [];

  ken.forEach(function(d){
    norData.push({"x": d.x, "y": d.y, "x_nor": (d.x - minX)/diff, "y_nor": (d.y - minY)/diff, "color":"#fff"});
  });
  return norData;
}
