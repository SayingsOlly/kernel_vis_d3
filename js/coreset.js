var minX = -89.582541, maxX = -81.960144, minY = 36.3, maxY = 39.3;
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

var STD = 0.01;



d3.csv("../data/kentucky_org.txt",function(data){
  ken = [];
  var epsilon = 0.03;

  var size = Math.floor(1/(epsilon*epsilon)*Math.log(1000));

  //size = 199162;
  set_data_size(size);

  percent = parseFloat(size)/parseFloat(full_size);

  STD = 0.01 * Math.sqrt(percent) + 0.0075;

  if(STD > 0.01){
    STD = 0.01;
  }

  console.log("new std: " + STD);

  var sampleList = [];
  console.log('fulldata length: ' + data.length);
  console.log('0.03 size: ' + size);
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

  d3.csv("../data/kentucky_org.txt",function(data){
    ken = [];

    // Updata data set.
    var size = Math.floor(1/(epsilon*epsilon)*Math.log(1000));
    set_data_size(size);

    percent = parseFloat(size)/parseFloat(full_size);

    // When we change the epsilon, std should be porpotional to the size of samples.
    if(epsilon < 0.2){
      STD = 0.01 * Math.sqrt(percent) + 0.0075;
    }else{
      STD = 0.01 * Math.sqrt(percent) + 0.006;
    }

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
    draw_canvas(1);
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
  draw_canvas();
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

  // max = cur_max;
  //console.log(max);

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
      if(value > 0.95*max){
        coresetData.push({"x":i, "y":j, "color":"rgba(194,68,41, 1.0)", "originColor": colorRange[0],"delta":delta, "value":value});
      }else if(value > 0.85*max){
        coresetData.push({"x":i, "y":j, "color":"rgba(198,0,101, 1.0)", "originColor": colorRange[1],"delta":delta, "value":value});
      }else if(value > 0.75*max){
        coresetData.push({"x":i, "y":j, "color":"rgba(202,68,163, 1.0)", "originColor": colorRange[2], "delta":delta, "value":value});
      }else if(value > 0.65*max){
        coresetData.push({"x":i, "y":j, "color":"rgba(183,0,206, 1.0)", "originColor": colorRange[3], "delta":delta, "value":value});
      }else if(value > 0.55*max){
        coresetData.push({"x":i, "y":j, "color":"rgba(123,0,210, 1.0)", "originColor": colorRange[4],"delta":delta, "value":value});
      }else if(value > 0.45*max){
        coresetData.push({"x":i, "y":j, "color":"rgba(62,0,213, 1.0)", "originColor": colorRange[5],"delta":delta, "value":value});
      }else if(value > 0.35*max){
        coresetData.push({"x":i, "y":j, "color":"rgba(0,1,217, 1.0)", "originColor": colorRange[6],"delta":delta, "value":value});
      }else if(value > 0.25*max){
        coresetData.push({"x":i, "y":j, "color":"rgba(0,68,221, 1.0)", "originColor": colorRange[7],"delta":delta, "value":value});
      }else if(value > 0.15*max){
        coresetData.push({"x":i, "y":j, "color":"rgba(0,137,225, 1.0)", "originColor": colorRange[8],"delta":delta, "value":value});
      }else if(value > 0.05*max){
        coresetData.push({"x":i, "y":j, "color":"rgba(0,208,229, 1.0)", "originColor": colorRange[9],"delta":delta, "value":value});
      }
    }
  }
  //return coresetData;
}

function kde_kernel(norData, std, x, y){
  var count = 0.0;
  var coeff = 1.0;

  norData.forEach(function(d){
    var dist = (x-d.x_nor)*(x-d.x_nor) + (y-d.y_nor)*(y-d.y_nor);
    count += coeff*Math.exp(-dist/(2.0*std*std));
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

function draw_canvas(flag){


  var transform = d3.zoomIdentity;
  var zoom = d3.zoom()
      .scaleExtent([1,40])
      .translateExtent([[-width,-height],[width, height]])
      .on("zoom", zoomed);

  d3.select('#coreset').selectAll('div').remove();
  d3.select('#coreset').selectAll('g').remove();

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


  core_canvas.call(zoom);

  var canvas = core_canvas.node().getContext("2d");

  d3.selectAll('.coreset_svg').remove();
  var svg = d3.select("#coreset").append('svg')
      .attr('width',700)
      .attr('height', 500)
      .attr('class', 'coreset_svg')
      .append('g');

  var xAxis = d3.axisBottom(x)
      .ticks(width/height*10)
      .tickSize(height)
      .tickPadding(8 - height);

  var yAxis = d3.axisRight(y)
      .ticks(10)
      .tickSize(width)
      .tickPadding(8 - width);

  svg.selectAll("g").remove();
  var gx = svg.append("g")
      .attr("class", "axis axis-x")
      .call(xAxis);

  var gy = svg.append("g")
      .attr("class", "axis axis-y")
      .call(yAxis);

  var color_scale_bar_g = d3.selectAll(".color_bar_svg").selectAll("g")
      .data(colorRange).enter().append("g");

  color_scale_bar_g.append("rect")
    .attr("width", 10)
    .attr("height", 20)
    .attr("x", 20)
    .attr("y", function(d,i){
      return i*20;
    })
    .attr("fill", function(d){
      return d;
    });

  color_scale_bar_g.append("text")
    .attr("x",20)
    .attr("y",function(d,i){
      return (i+1)*20;
    })
    .text(function(d,i){
      return (95-(i)*10)+"%";
    });
  //0.037657

  //getCore(0.01, 501, 0.15);

  draw();

  function draw(){

    coresetData.forEach(function(d){
      canvas.beginPath();
      canvas.rect(d.x+90, -d.y+350, d.delta, d.delta);
      canvas.fillStyle = d.color;
      canvas.fill();
      //canvas.closePath();
    });

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

    draw();
    canvas.restore();
    //console.log(zoom.scale());
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
}

function clickFunction(){

  var radius = d3.select("#radius").property("value");
  console.log(radius);
  console.log(d3.event.clientX);

  d3.select('.coreset_svg').append("circle")
    .attr("cx", d3.event.pageX-8)
    .attr("cy", d3.event.pageY-294)
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
  console.log('???: ' + epsilon);
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
