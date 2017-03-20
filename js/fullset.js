var minX = -89.582541, maxX = -81.960144, minY = 36.3, maxY = 39.3;
var fullData = [];

// var color_range = {"#c24429":0.95, "#c60065":0.85, "#ca44a3": 0.75,
//                    "#b700ce":0.55, ""}

d3.csv("../data/fulldata_v2.csv", function(data){
  // data.forEach(function(d){
  //   var cordinate = [];
  //   Object.values(d).forEach(function(item){
  //   var items = item.split(" ");
  //   fullData.push({'x':parseFloat(items[0]), 'y':parseFloat(items[1])});
  //   });
  // });

  // full_update(0.01, 0.037657);
  fullData = data;
  //console.log(fullData);
  draw_full_canvas();
});

var fullzoom;
//var std = 0.01;

//var fullsvg = d3.select("#full_svg");
//var width = +fullsvg.attr("width");
//var height = +fullsvg.attr("height");
var width = 700;
var height = 500;

var fullxscale = d3.scaleLinear()
    .range([-1,width+1-100])
    .domain([minX, maxX]);

var fullyscale = d3.scaleLinear()
    .range([-maxY,-minY])
    .domain([minY,maxY]);

var fullx = d3.scaleLinear()
    .range([-1, width+1])
    .domain([-maxX, -minX]);

var fully = d3.scaleLinear()
    .range([-1, height+1])
    .domain([maxY, minY]);


function fullgetCore(std, epsilon){

  var norData = fullnormalize();

  var x = 1.0;
  var y = (maxY-minY)/(maxX-minX);
  //tao = 0.037657;

  return fullfill(norData, std, epsilon, x, y);
}

function fullfill(norData, std, max, x, y){
  var res = 200.0;
  var edge = 500.0;

  var delta = edge/res;

  var coresetData = [];

  for(var i=0.0; i<edge*x; i+=delta){
    for(var j=0.0; j<edge*y; j+=delta){
      var value = full_eval_kernel(norData, std, (i+delta/2.0)/edge, (j+delta/2.0)/edge);
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
        coresetData.push({"x":i, "y":j, "color":threshold(color_value), "delta":delta, "value": value});
      }
      // if(value > 0.95*max){
      //   coresetData.push({"x":i, "y":j, "color":"#c24429", "delta":delta});
      // }else if(value > 0.85*max){
      //   coresetData.push({"x":i, "y":j, "color":"#c60065", "delta":delta});
      // }else if(value > 0.75*max){
      //   coresetData.push({"x":i, "y":j, "color":"#ca44a3", "delta":delta});
      // }else if(value > 0.65*max){
      //   coresetData.push({"x":i, "y":j, "color":"#b700ce", "delta":delta});
      // }else if(value > 0.55*max){
      //   coresetData.push({"x":i, "y":j, "color":"#7b00d2", "delta":delta});
      // }else if(value > 0.45*max){
      //   coresetData.push({"x":i, "y":j, "color":"#3e00d5", "delta":delta});
      // }else if(value > 0.35*max){
      //   coresetData.push({"x":i, "y":j, "color":"#0001d9", "delta":delta});
      // }else if(value > 0.25*max){
      //   coresetData.push({"x":i, "y":j, "color":"#0044dd", "delta":delta});
      // }else if(value > 0.15*max){
      //   coresetData.push({"x":i, "y":j, "color":"#0089e1", "delta":delta});
      // }else if(value > 0.05*max){
      //   coresetData.push({"x":i, "y":j, "color":"#00d0e5", "delta":delta});
      // }
    }
  }
  return coresetData;
}

function full_eval_kernel(norData, std, x, y){
  var count = 0.0;
  var coeff = 1.0;

  norData.forEach(function(d){
    var dist = (x-d.x_nor)*(x-d.x_nor) + (y-d.y_nor)*(y-d.y_nor);
    //console.log(dist);
    count += coeff*Math.exp(-dist/(2.0*std*std));
  });

  return parseFloat(count)/(norData.length+1);
}

  d3.select('#full').selectAll('div').remove();
  d3.select('#full').selectAll('g').remove();

  var char_div = d3.select('#full').append('div')
      .style('left', 200);
//    .style('top', -500);

  char_div.selectAll("canvas").remove();

  var full_canvas = char_div.append("canvas")
      .attr('width', width)
      .attr('height', height)
      //.call(zoom)
      .node().getContext("2d");

  var svg = d3.select("#full").append('svg')
    .attr('width',700)
      .attr('height', 500)
      .append('g');

  var full_xAxis = d3.axisBottom(x)
      .ticks(width/height*10)
      .tickSize(height)
      .tickPadding(8 - height);

  var full_yAxis = d3.axisRight(y)
      .ticks(10)
      .tickSize(width)
      .tickPadding(8 - width);

  svg.selectAll("g").remove();
  var full_gx = svg.append("g")
      .attr("class", "axis axis-x")
      .call(full_xAxis);

  var full_gy = svg.append("g")
      .attr("class", "axis axis-y")
      .call(full_yAxis);

function draw_full_canvas(){

  var transform = d3.zoomIdentity;

  // var zoom = d3.zoom()
  //     .scaleExtent([1,40])
  //     .translateExtent([[-width,-height],[width, height]])
  //     .on("zoom", zoomed);


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

  draw_full();


  // function zoomed(){

  //   transform = d3.event.transform;
  //   // console.log(d3.event.translateX);
  //   console.log(d3.event.transform.translate);
  //   full_canvas.save();
  //   canvas.clearRect(0, 0, width, height);

  //   canvas.translate(transform.x, transform.y);
  //   canvas.scale(transform.k, transform.k);

  //   draw_full();
  //   canvas.restore();

  //   gx.call(xAxis.scale(d3.event.transform.rescaleX(x)));
  //   gy.call(yAxis.scale(d3.event.transform.rescaleY(y)));
  // }

}

  function draw_full(){

    fullData.forEach(function(d){
      full_canvas.beginPath();
      full_canvas.rect(parseFloat(d.x)+90, -parseFloat(d.y)+350, parseFloat(d.delta), parseFloat(d.delta));
      full_canvas.fillStyle = d.color;
      full_canvas.fill();
      //canvas.closePath();
    });

  }
function full_update(std, epsilon){

  // if(epsilon == -1){
  //   d3.select("#std-value").text(std);
  //   d3.select("#std").property("value", std);
  //   epsilon = d3.select("#epsilon").property("value");
  // }else if(std == -1){
  //   d3.select("#epsilon-value").text(epsilon);
  //   d3.select("#epsilon").property("value", epsilon);
  //   std = d3.select("#std").property("value");
  // }

  var coresetData = fullgetCore(std, epsilon);
  // console.log("coreset");
  // console.log(coresetData);

  for(var key in coresetData[0]){
    console.log(key);
  }
  console.log(coresetData.length);
  var csvContent = "data:text/csv;charset=utf-8,";
  csvContent +="x,y,color,delta,value\n";
  coresetData.forEach(function(infoArray){
    var dataString = "";
    for(var key in infoArray){
      dataString += infoArray[key]+",";
    }
    csvContent += dataString+ "\n";

  });

  var encodedUri = encodeURI(csvContent);
  window.open(encodedUri);
}
  // var rects = fullsvg.selectAll("rect").data(fullData);

//   rects.exit().remove();
//   rects = rects.enter().append("rect").merge(rects);

//   rects.attr("class", "full_rects")
//     .attr("x",function(d){
//       return parseFloat(d.x)+90;
//     })
//     .attr("y",function(d){
//       return parseFloat(-d.y)+350;
//     })
//     .attr("width", function(d){
//       return parseFloat(d.delta);
//     })
//     .attr("height", function(d){
//       return parseFloat(d.delta);
//     })
//     .style("fill", function(d){
//       return d.color;
//     });
  // }

  // var full_xAxis = d3.axisBottom(fullx)
  //     .ticks(width/height*10)
  //     .tickSize(height)
  //     .tickPadding(8-height);

  // var full_yAxis = d3.axisRight(fully)
  //     .ticks(10)
  //     .tickSize(width)
  //     .tickPadding(8- width);

  // var full_gx = fullsvg.append("g")
  //     .attr("class", "axis axis-x")
  //     .call(xAxis);

  // var full_gy = fullsvg.append("g")
  //     .attr("class", "axis axis-y")
  //     .call(yAxis);

function fullset(){


  // var color_scale_bar_g = d3.select("#color_bar_svg").selectAll("g")
  //     .data(colorRange).enter().append("g");

  // color_scale_bar_g.append("rect")
  //   .attr("width", 10)
  //   .attr("height", 20)
  //   .attr("x", 10)
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

  fullzoom = d3.zoom()
      .scaleExtent([1,40])
      .translateExtent([[-width,-height],[width, height]])
      .on("zoom", zoomed);
  //0.037657
  full_update(0.01, 0.037657);


  fullsvg.call(fullzoom);

  function zoomed(){
    d3.selectAll(".full_rects").attr("transform", d3.event.transform);
    gx.call(xAxis.scale(d3.event.transform.rescaleX(fullx)));
    gy.call(yAxis.scale(d3.event.transform.rescaleY(fully)));
  }

}

function fullnormalize(){
  var diff = maxX - minX > maxY - minY ? maxX - minX : maxY - minY;
  norData = [];

  fullData.forEach(function(d){
    norData.push({"x": d.x, "y": d.y, "x_nor": (d.x - minX)/diff, "y_nor": (d.y - minY)/diff, "color":"#fff"});
  });
  return norData;
}
