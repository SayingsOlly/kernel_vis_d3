var minX = -89.582541, maxX = -81.960144, minY = 36.3, maxY = 39.3;
var ken = [];
var norData = [];
var coresetData = [];
var colorRange = ["rgba(194,68,41, 1.0)", "rgba(198,0,101, 1.0)","rgba(202,68,163, 1.0)", "rgba(183,0,206, 1.0)", "rgba(123,0,210, 1.0)", "rgba(62,0,213, 1.0)", "rgba(0,1,217, 1.0)", "rgba(0,68,221, 1.0)", "rgba(0,137,225, 1.0)", "rgba(0,208,229, 1.0)"];

var res = 200.0;
var edge = 500.0;
var delta = edge/res;
var max = 0.037657;

d3.csv("../data/kentucky_org.txt",function(data){
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
  console.log("size: "+size);
  coreset();
});

function randomSample(epsilon){
  d3.select("#epsilon-value").text(epsilon);
  d3.select("#epsilon").property("value", epsilon);

  d3.csv("../data/kentucky_org.txt",function(data){
    ken = [];
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
    coreset();
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

  coreset();
});
}

// d3.csv("../data/ken_random_777", function(data){
//   data.forEach(function(d){
//     cordinate = [];
//     Object.values(d).forEach(function(item){
//       var items = item.split(" ");
//       ken.push({'x':parseFloat(items[0]), 'y':parseFloat(items[1])});
//     });
//   });
//   coreset();
// });

var zoom;

var svg = d3.select("#coreset_svg");
var width = +svg.attr("width");
var height = +svg.attr("height");


var xscale = d3.scaleLinear()
    .range([-1,width+1-100])
    .domain([minX, maxX]);

var yscale = d3.scaleLinear()
    .range([-maxY,-minY])
    .domain([minY,maxY]);

var x = d3.scaleLinear()
    .range([-1, width+1])
    .domain([-maxX, -minX]);

var y = d3.scaleLinear()
    .range([-1, height+1])
    .domain([maxY, minY]);


function getCore(std, radius, tau){

  norData = normalize();

  var x = 1.0;
  var y = (maxY-minY)/(maxX-minX);
  //radius = 0.037657;


 fill(norData, std, x, y);
 killChaos(std, radius, tau);
  //return coresetData;
}

function killChaos(std, radius, tau){

  coresetData.forEach(function(d){
    if(d.value > 0.05*max){
      //console.log(">epsilon");
      var flag = false;
      coresetData.forEach(function(k){
        if(k.value > tau*max && eval_range(d.x, d.y, k.x, k.y, std) < radius){
          flag = true;
          d.color = d.originColor;
        }
      });
      if(!flag){
        d.color = "#fff";
      }
    }
  });
  updateHeapMap();
  //return coresetData;
}

function eval_range(qx, qy, xx, xy, std){
  var dist = (qx-xx)*(qx-xx) + (qy-xy)*(qy-xy);
  return Math.sqrt(dist);
}

function fill(norData, std, x, y){

  coresetData = [];

  for(var i=0.0; i<edge*x; i+=delta){
    for(var j=0.0; j<edge*y; j+=delta){
      var value = kde_kernel(norData, std, (i+delta/2.0)/edge, (j+delta/2.0)/edge);
      if(value > 0.95*max){
        coresetData.push({"x":i, "y":j, "color":"rgba(194,68,41, 1.0)", "originColor": colorRange[0],"delta":delta, "value":value});
        //console.log({"x":i, "y":j, "color":"rgba(194,68,41, 1.0)", "originColor": colorRange[1],"delta":delta, "value":value});
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
}

function updateHeapMap(){

  var rects = svg.selectAll("rect").data(coresetData);

  rects.exit().remove();
  rects = rects.enter().append("rect").merge(rects);

  rects.attr("class", "rects")
    .attr("x",function(d){
      return d.x+90;
    })
    .attr("y",function(d){
      return -d.y+350;
    })
    .attr("width", function(d){
      return d.delta;
    })
    .attr("height", function(d){
      return d.delta;
    })
    .style("fill", function(d){
      return d.color;
    });

}

function coreset(){

  var color_scale_bar_g = d3.selectAll(".color_bar_svg").selectAll("g")
      .data(colorRange).enter().append("g");

  color_scale_bar_g.append("rect")
    .attr("width", 10)
    .attr("height", 20)
    .attr("x", 10)
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

  zoom = d3.zoom()
      .scaleExtent([1,40])
      .translateExtent([[-width,-height],[width, height]])
      .on("zoom", zoomed);
  //0.037657
  update(0.01, 501, 0.15);

  var xAxis = d3.axisBottom(x)
      .ticks(width/height*10)
      .tickSize(height)
      .tickPadding(8-height);

  var yAxis = d3.axisRight(y)
      .ticks(10)
      .tickSize(width)
      .tickPadding(8- width);

  svg.selectAll("g").remove();
  var gx = svg.append("g")
      .attr("class", "axis axis-x")
      .call(xAxis);

  var gy = svg.append("g")
      .attr("class", "axis axis-y")
      .call(yAxis);

  svg.call(zoom);


  function zoomed(){
    d3.selectAll(".rects").attr("transform", d3.event.transform);
    gx.call(xAxis.scale(d3.event.transform.rescaleX(x)));
    gy.call(yAxis.scale(d3.event.transform.rescaleY(y)));
  }

}
d3.select("button")
  .on("click", reset);

d3.select("#std").on("input", function(d){
  var tau = d3.select("tau").property("tau");
  var radius = d3.select("#radius").property("value");
  update(+this.value, radius, tau);
});

d3.select("#epsilon").on("input", function(d){
  randomSample(+this.value);
});

d3.select("#radius").on("input", function(d){
  var std = d3.select("#std").property("value");
  var tau = d3.select("#tau").property("value");

  d3.select("#radius-value").text(+this.value);
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
