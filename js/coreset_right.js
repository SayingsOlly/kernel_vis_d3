//var minX = -89.582541, maxX = -81.960144, minY = 36.3, maxY = 39.3;
//var minX = -75.2781, maxX = -74.9576, minY = 39.8763, maxY = 40.1372;
//var minX = 124.16, maxX = 145.571, minY = 24.3471, maxY = 45.4094;
var minY = -89.582541, maxY = -81.960144, minX = 36.3, maxX = 39.3;
var centerX = (maxX+minX)/2, centerY = (maxY+minY)/2;


// var data_list = {"Kentucky":"../data/kentucky_org.txt",
//                  "Phily":"../data/crime_clean.txt",
//                  "Japan": "../data/twitter_clean_jp.txt"};

// var sorted_data_list = {"Kentucky":"../data/ken_sort.txt",
//                         "Phily":"../data/crime_sort.txt",
//                         "Japan": "../data/twitter_sort.txt"};

// var STD_list = {"Kentucky": 0.07,
//                 "Phily": 0.003,
//                 "Japan": 0.25};

// var delta_list = {"Kentucky": 0.04,
//                   "Phily":0.002,
//                   "Japan": 0.1};

// var zoom_list = {"Kentucky": 6,
//                  "Phily": 10,
//                  "Japan": 5};

//var current_file = "../data/kentucky_org.txt";
var right_current_sorted = true;
//var init_zoom = 7;
var right_ken = [];
//var norData = [];
var right_coresetData = [];


var right_ne, right_sw;

// GOOGLE map
var last_right_center;
var right_canvasLayer;
var right_context;
var right_map;
var right_mapProjection;

var right_canvasWidth;
var right_canvasHeight;

var right_rectLatLng = new google.maps.LatLng(40,-95);
var right_resolutionScale = window.devicePixelRatio || 1;

var delta = 0.0016;

// Color Range
var colorRange = ["rgba(194,68,41, 1.0)", "rgba(198,0,101, 1.0)","rgba(202,68,163, 1.0)", "rgba(183,0,206, 1.0)", "rgba(123,0,210, 1.0)", "rgba(62,0,213, 1.0)", "rgba(0,1,217, 1.0)", "rgba(0,68,221, 1.0)", "rgba(0,137,225, 1.0)", "rgba(0,208,229, 1.0)"];

// var res = 200.0;
// var edge = 500.0;

var data_length_mark = 0;

var right_max = 0;

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

/**
 *  Pre calculate and recommand the percentage and radius to users if they try to
 *  kill the chaos in the choosen range.
 **/


function right_pre_kill_chaos(){

  var chaos_list = [];
  var max_tau = 0;
  right_coresetData.forEach(function(d){

    if(d.color != "#f7f4f9"){
      var newll = new google.maps.LatLng(parseFloat(d.x), parseFloat(d.y));
      var newll_c = new google.maps.LatLng(parseFloat(d.x)+0.04, parseFloat(d.y));

      var newpoint = right_mapProjection.fromLatLngToPoint(newll);
      var newpoint_c = right_mapProjection.fromLatLngToPoint(newll_c);

      // pro_y = (newpoint_c.y - newpoint.y)/0.04;

      // pro_y = Math.abs(pro_y);
//    console.log(pro_y);

    //console.log(newpoint);
      //left_context.beginPath();

      //left_context.rect(newpoint.x, newpoint.y, pro*parseFloat(delta), pro_y*parseFloat(delta));
      if(d.color == "#f7f4f9"){

        //left_context.fillStyle = "rgba(0, 0, 0, 0)";
      }else{

        //        var ne = new google.maps.LatLng(ne.lat(), ne.lng())
        if((right_sw.lat() <= d.x && right_ne.lat() >= d.x + delta)
            && (right_ne.lng() >= d.y && right_sw.lng() <= d.y + delta)
          )
        {
          chaos_list.push(d);
          var cur_tau = d.value/right_max;
          // console.log(cur_tau);
          if(cur_tau > max_tau){
            max_tau = cur_tau;
          }
        }else{
          //left_context.fillStyle = d.color;
        }
      }
      //left_context.fill();
    }
  });
  return max_tau;
}



/**
  * -----------------------------------------------
  * Create Google map
  * -----------------------------------------------
 **/

// var map = new google.maps.Map(d3.select("#map").node(),{
//   zoom: 8,
//   center: new google.maps.LatLng(37.548834, -85.200017),
//   mapTypeId: google.maps.MapTypeId.COORDINATE
// });

function right_init_googlemap(){

  var mapOptions = {
    zoom:init_zoom,
    center: new google.maps.LatLng(centerX, centerY),
    mapTypeId: google.maps.MapTypeId.COORDINATE,
    styles: map_styles
  };

  d3.select("#map-div-right").remove();
  d3.select("#full").append("div")
    .attr("id","map-div-right")
    .style("width","95%")
    .style("height", "60%");

  var mapDiv = document.getElementById('map-div-right');

  right_map = new google.maps.Map(mapDiv, mapOptions);

  var canvasLayerOptions = {
    map: right_map,
    resizeHandler: right_map_resize,
    ainimate: false,
    updateHandler: right_map_update,
    resolutionScale: right_resolutionScale
  };

  right_canvasLayer = new CanvasLayer(canvasLayerOptions);
  right_context = right_canvasLayer.canvas.getContext('2d');

    // Rectangle, pre kill chaos.

  var bounds = {
          north: centerX,
          south: centerX+0.001,
          east:  centerY,
          west:  centerY-0.001
  };

  var rectangle = new google.maps.Rectangle({
          bounds: bounds,
          editable: true,
          draggable: true
  });

  rectangle.setMap(right_map);

  // Add an event listener on the rectangle.
  rectangle.addListener('bounds_changed', showNewRect);
  var infoWindow = new google.maps.InfoWindow();

  rectangle.addListener('dragend', function(){
    right_ne = rectangle.getBounds().getNorthEast();
    right_sw = rectangle.getBounds().getSouthWest();

    var max_tau = right_pre_kill_chaos();

    max_tau = parseFloat(max_tau.toFixed(3))+0.001;
    var max_value =  (max_tau*right_max).toFixed(6);
    var contentString = '<b>Max value: ' + max_value + '</b><br>' +
        'Recommend min percentage: ' + max_tau + '<br>' +
        'Recommend min radius: 0.01';

        // Set the info window's content and position.
    infoWindow.setContent(contentString);
    infoWindow.setPosition(right_ne);

    infoWindow.open(right_map);
  });

  // Define an info window on the map.

  function showNewRect(event) {
  }

}

function right_map_resize(){
// do nothing.
}

function right_map_update(){
  right_canvasWidth = right_canvasLayer.canvas.width;
  right_canvasHeight = right_canvasLayer.canvas.height;
  right_context.clearRect(0,0, right_canvasWidth, right_canvasHeight);
  right_context.globalAlpha = 0.5;

  /* We need to scale and translate the map for current view.
   * see https://developers.google.com/maps/documentation/javascript/maptypes#MapCoordinates
   */
  right_mapProjection = right_map.getProjection();

  /**
   * Clear transformation from last update by setting to identity matrix.
   * Could use context.resetTransform(), but most browsers don't support
   * it yet.
   */
  right_context.setTransform(1, 0, 0, 1, 0, 0);

  // scale is just 2^zoom
  // If canvasLayer is scaled (with resolutionScale), we need to scale by
  // the same amount to account for the larger canvas.
  var scale = Math.pow(2, right_map.zoom) * right_resolutionScale;
  right_context.scale(scale, scale);

  if(left_map != undefined){
    left_map.setZoom(right_map.zoom);
  if(left_map.getCenter()!=right_map.getCenter()){
    last_right_center = right_map.getCenter();
     left_map.setCenter(right_map.getCenter());
  }
  }

   /* If the map was not translated, the topLeft corner would be 0,0 in
    * world coordinates. Our translation is just the vector from the
    * world coordinate of the topLeft corder to 0,0.
    */
  if(right_mapProjection != undefined){
    var offset = right_mapProjection.fromLatLngToPoint(right_canvasLayer.getTopLeft());
    right_context.translate(-offset.x, -offset.y);
    right_map_draw();
  }

  //draw
}

function right_map_draw(){

  //console.log("**************** right draw ****************");
  right_context.clearRect(0,0, right_canvasWidth, right_canvasHeight);
  right_context.globalAlpha = 0.5;
  // var newpoint;

  var test1 = new google.maps.LatLng(30.00, -100.04);
  var test2 = new google.maps.LatLng(30.00, -100.08);

  right_mapProjection = right_map.getProjection();
  if(right_mapProjection == undefined){
    right_mapProjection = mapProjection;
  }
    var point1 = right_mapProjection.fromLatLngToPoint(test1);
    var point2 = right_mapProjection.fromLatLngToPoint(test2);

    var pro = (point1.x - point2.x)/0.04;
    var pro_y;

  right_coresetData.forEach(function(d){

    if(d.color != "#f7f4f9"){
    var newll = new google.maps.LatLng(parseFloat(d.x), parseFloat(d.y));
    var newll_c = new google.maps.LatLng(parseFloat(d.x)+0.04, parseFloat(d.y));

    var newpoint = right_mapProjection.fromLatLngToPoint(newll);
    var newpoint_c = right_mapProjection.fromLatLngToPoint(newll_c);

    pro_y = (newpoint_c.y - newpoint.y)/0.04;
    //console.log(newpoint);
    right_context.beginPath();
    right_context.rect(newpoint.x, newpoint.y, pro*parseFloat(delta), pro_y*parseFloat(delta));
    if(d.color == "#f7f4f9"){
      right_context.fillStyle = "rgba(0, 0, 0, 0)";
    }else{
      right_context.fillStyle = d.color;
    }
    right_context.fill();
    }
  });

    document.getElementById("compare_btn").disabled = false;
    document.getElementById("tau_confirm").disabled = false;
    document.getElementById("epsilon_confirm").disabled = false;
    document.getElementById("radius_confirm").disabled = false;
}

/**
  * -----------------------------------------------
  * File reading, random sampling.
  * -----------------------------------------------
  **/

function right_init_kernel(fileName, is_sorted, is_right){

  d3.csv(fileName,function(data){
  //right_init_googlemap();
    right_init_googlemap();

    // update_color_bar(0);
    //update_color_bar(0);
    right_ken = [];
    var epsilon = 0.03;

    var size = Math.floor(1/(epsilon*epsilon)*Math.log(1000));

    // mark data length.
    data_length_mark = size;

    set_right_data_size(size);

    //size = 199162;
    // if(size > data.length){
    //   size = data.length;
    // }
    percent = parseFloat(size)/parseFloat(full_size);

    // if(STD > 0.01){
    //   STD = 0.01;
    // }
    //var d0 = performance.now();

    var sampleList = [];

    var tmpMinX = 10000;
    var tmpMaxX = -10000;

    var tmpMinY = 10000;
    var tmpMaxY = -10000;

    if (!is_sorted){
      data.forEach(function(d,i){
        //nothing
        // var tmpX;
        // var tmpY;
        // Object.values(d).forEach(function(item){
        //   var items = item.split(" ");
        //   tmpX = parseFloat(items[0]);
        //   tmpY = parseFloat(items[1]);
        // });

        // if (tmpX < tmpMinX){
        //   tmpMinX = tmpX;
        // }
        // if (tmpX > tmpMaxX){
        //   tmpMaxX = tmpX;
        // }

        // if(tmpY < tmpMinY){
        //   tmpMinY = tmpY;
        // }

        // if(tmpY > tmpMaxY){
        //   tmpMaxY = tmpY;
        // }

        // if(i<size){
        //   sampleList.push(d);
        // }
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
      // console.log(tmpMinX + " " + tmpMaxX);
      // console.log(tmpMinY + " " + tmpMaxY);

      sampleList.forEach(function(d){
        var cordinate = [];
        Object.values(d).forEach(function(item){
          var items = item.split(" ");
          right_ken.push({'y':parseFloat(items[0]), 'x':parseFloat(items[1])});
        });
      });

    }else{
      /**
       *  Use sorting sampling data
       **/

      for(var i=0; i<size; i++){
        var cordinate = [];
        Object.values(data[i]).forEach(function(item){
          var items = item.split(" ");
          right_ken.push({'y':parseFloat(items[0]), 'x':parseFloat(items[1])});
        });
      }
    }

    full_data_length = right_ken.length;

    //right_getCore(is_right, STD, 101, 0.05);
    // var d1 = performance.now();
    // set_right_time((d1-d0)/1000);
    //right_map_draw();
    //map_draw();
    //coreset();
    // if(is_left){
    //   d3.select("#std-value").text((STD).toFixed(4));
    //   d3.select("#std").property("value", parseFloat(STD));
    //   getCore(is_left, STD, 101, 0.15);
    //   var d1 = performance.now();
    //   console.log("full_data:" + (d1-d0));
    //   set_time((d1-d0)/1000);

    //   draw_canvas(0);

    // }else{
    //   d3.select("#std-value").text((STD).toFixed(4));
    //   d3.select("#std").property("value", parseFloat(STD));
    //   getCore(is_left, STD, 101, 0.15);
    //   console.log("im right!!!!!!!!");
    //   draw_full_canvas();
    // }

     getMax(101, 0.1, STD);


    var x = 1.0;
    var y = (maxY-minY)/(maxX-minX);

    // left fill

    if(!left_is_origin){
      fill(0, 101, 0.1, 0.01, x, y, true);
    }

    // right fill

    right_fill(0, 101, 0.1, 0.01, x, y, true);
  });

}


function init_right(data_select, is_sorted, is_origin, is_right){

  current_data = data_select;
  if(data_select == "Japan"){
    minY = 124.16, maxY = 145.571, minX = 24.3471, maxX = 45.4094;
  }else if(data_select == "Philadelphia Crimes"){
    minY = -75.2781, maxY = -74.9576, minX = 39.8763, maxX = 40.1372;
  }else if(data_select == "Kentucky"){
    minY = -89.582541, maxY = -81.960144, minX = 36.3, maxX = 39.3;
  }

  centerX = (maxX+minX)/2, centerY = (maxY+minY)/2;
  if(is_origin){
    d3.csv(full_data_list[current_data], function(error, data){
      if(error) throw error;

      // console.log("right full data!!!!!!!!!!");
      set_right_data_size(1);
      set_right_time(1);
      right_coresetData = data;

      var cur_max = 0;
      // console.log("init right!!!!!");
      right_coresetData.forEach(function(d){
        if(parseFloat(d.value) > cur_max){
          cur_max = d.value;
        }
      });

      right_max = cur_max;
      // console.log("current max:" + right_max);

      right_init_googlemap();
      right_map_draw();
      right_current_file = fileName;
      //right_map_update();
    });
  }else{


    delta = delta_list[data_select];
    STD = STD_list[data_select];
    init_zoom = zoom_list[data_select];
    right_current_sorted = is_sorted;

    var fileName = "";
    if(!is_sorted){
      fileName = data_list[data_select];
    }else{
      fileName = sorted_data_list[data_select];
    }

    right_current_file = fileName;

    right_init_kernel(fileName, is_sorted, true);
  }
}

//initiation
//init_right("Kentucky", false, false, true);


/**
  * Do random sampling every time when adjust the epsilon.
  * @param std: standard deviration.
  * @param epsilon: Decide the size of samples.
**/

function right_randomSample(std, epsilon, flag){

  // Update std text.
  // d3.select("#std-value").text(parseFloat(std).toFixed(4));
  // d3.select("#std").property("value", parseFloat(std));

  if(right_is_origin){
    set_right_data_size(size);
    set_right_time(1);
    return;
  }

  //console.log("keep random sampling");

  d3.csv(right_current_file,function(data){

    //update_color_bar(0);
    right_ken = [];
    // var epsilon = 0.03;

    var size = Math.floor(1/(epsilon*epsilon)*Math.log(1000));

    // mark data length.
    data_length_mark = size;

    //size = 199162;
    // if(size > data.length){
    //   size = data.length;
    // }
    set_right_data_size(size);

    // percent = parseFloat(size)/parseFloat(full_size);

    // if(STD > 0.01){
    //   STD = 0.01;
    // }
    var sampleList = [];

    var tmpMinX = 10000;
    var tmpMaxX = -10000;

    var tmpMinY = 10000;
    var tmpMaxY = -10000;

    if (!right_current_sorted){
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

        // if(i<size){
        //   sampleList.push(d);
        // }
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
      // console.log(tmpMinX + " " + tmpMaxX);
      // console.log(tmpMinY + " " + tmpMaxY);

      sampleList.forEach(function(d){
        var cordinate = [];
        Object.values(d).forEach(function(item){
          var items = item.split(" ");
          right_ken.push({'y':parseFloat(items[0]), 'x':parseFloat(items[1])});
        });
      });

    }else{
      /**
       *  Use sorting sampling data
       **/

      for(var i=0; i<size; i++){
        var cordinate = [];
        Object.values(data[i]).forEach(function(item){
          var items = item.split(" ");
          right_ken.push({'y':parseFloat(items[0]), 'x':parseFloat(items[1])});
        });
      }
    }

    full_data_length = right_ken.length;
    right_getCore(true, STD, 101, 0.05);
    // var d1 = performance.now();
    // set_right_time((d1-d0)/1000);
    //right_map_draw();
    //map_draw();
    //coreset();
    // if(is_left){
    //   d3.select("#std-value").text((STD).toFixed(4));
    //   d3.select("#std").property("value", parseFloat(STD));
    //   getCore(is_left, STD, 101, 0.15);
    //   console.log("full_data:" + (d1-d0));
    //   set_time((d1-d0)/1000);

    //   draw_canvas(0);

    // }else{
    //   d3.select("#std-value").text((STD).toFixed(4));
    //   d3.select("#std").property("value", parseFloat(STD));
    //   getCore(is_left, STD, 101, 0.15);
    //   var d1 = performance.now();
    //   console.log("full_data:" + (d1-d0));
    //   set_time((d1-d0)/1000);
    //   console.log("im right!!!!!!!!");
    //   draw_full_canvas();
    // }
  });

  // r_transform_x = transform_x;
  // r_transform_y = transform_y;

  // x = d3.scaleLinear()
  //   .range([-1+r_transform_x, width+1+r_transform_x])
  //   .domain([-maxX, -minX]);

  // y = d3.scaleLinear()
  //   .range([-1+r_transform_y, height+1+r_transform_y])
  //   .domain([maxY, minY]);

  // var size = Math.floor(1/(epsilon*epsilon)*Math.log(1000));
  // set_data_size(size);

  // if (size <= data_length_mark){
  //   ken = ken.slice(0,size);
  //   data_length_mark = size;
  //    // Get core set
  //   var t0 = performance.now();
  //   getCore(std, 501, 0.15);
  //   var t1 = performance.now();

  //   set_time((t1-t0)/1000);
  //   draw();
  //   zoomed_rescale();
  // }else{

  // d3.csv("../data/crime_sort.txt",function(data){

  //   // Updata data set.

  //   percent = parseFloat(size)/parseFloat(full_size);

  //   // When we change the epsilon, std should be porpotional to the size of samples.
  //   // if(epsilon < 0.2){
  //   //   STD = 0.01 * Math.sqrt(percent) + 0.0075;
  //   // }else{
  //   //   STD = 0.01 * Math.sqrt(percent) + 0.006;
  //   // }

  //   // if(STD > 0.01){
  //   //   STD = 0.01;
  //   // }

  //   for(var i = data_length_mark; i<=size; i++){
  //     Object.values(data[i]).forEach(function(item){
  //        var items = item.split(" ");
  //        ken.push({'x':parseFloat(items[0]), 'y':parseFloat(items[1])});
  //      });
  //   }
  //   // // Random sample.
  //   // var sampleList = [];
  //   // data.forEach(function(d,i){
  //   //   if(i<size){
  //   //     sampleList.push(d);
  //   //   }else{
  //   //     var j = Math.floor((Math.random() * i));
  //   //     if(j<size){
  //   //       sampleList[j] = d;
  //   //     }
  //   //   }
  //   // });

  //   // // Change the data format.
  //   // sampleList.forEach(function(d){
  //   //   var cordinate = [];
  //   //   Object.values(d).forEach(function(item){
  //   //     var items = item.split(" ");
  //   //     ken.push({'x':parseFloat(items[0]), 'y':parseFloat(items[1])});
  //   //   });
  //   // });

  //   // if(flag == 1){
  //   //   std = STD;
  //   // }

  //   // // Update std text.
  //   // d3.select("#std-value").text((std).toFixed(4));
  //   // d3.select("#std").property("value", parseFloat(std));

  //   // Get core set
  //   var t0 = performance.now();
  //   getCore(std, 501, 0.15);
  //   var t1 = performance.now();

  //   set_time((t1-t0)/1000);
  //   draw();
  //   zoomed_rescale();
  //   //draw_canvas(1);
  // });
  // }
}


// function readFile(fileName){

//   d3.csv("../data/"+fileName, function(data){
//   ken = [];
//   var epsilon = 0.05;
//   var size = Math.floor(1/(epsilon*epsilon)*Math.log(1000));
//   var sampleList = [];
//   data.forEach(function(d,i){
//     //nothing
//     if(i<size){
//       sampleList.push(d);
//     }else{
//       var j = Math.floor((Math.random() * i));
//       if(j<size){
//         sampleList[j] = d;
//       }
//     }
//   });
//  // var formatedList = [];
//   sampleList.forEach(function(d){
//     var cordinate = [];
//     Object.values(d).forEach(function(item){
//       var items = item.split(" ");
//       ken.push({'x':parseFloat(items[0]), 'y':parseFloat(items[1])});
//     });
//   });

// });
// }

// var zoom;

// // var svg = d3.select("#coreset").append('svg')
// //     .attr('width',700)
// //     .attr('height', 500)
// //     .append('g')
// //     .attr('transform', "translate(100 200)");
// //var width = +svg.attr("width");
// //var height = +svg.attr("height");
// var width = 700;
// var height = 500;

// var xscale = d3.scaleLinear()
//     .domain([1,501])
//     .range([0.1, (maxX-minX)]);

// var reverseXscale = d3.scaleLinear()
//     .domain([0.1, (maxX-minX)])
//     .range([1,501]);

// var yscale = d3.scaleLinear()
//     .range([-maxY,-minY])
//     .domain([minY,maxY]);

// var x = d3.scaleLinear()
//     .range([-1, width+1])
//     .domain([-maxX, -minX]);

// var y = d3.scaleLinear()
//     .range([-1, height+1])
//     .domain([maxY, minY]);


/**
 * Update and get the core set.
 *
 * @param std  standard deviration.
 * @param radius use as the distance between chaos and some density.
 * @param tau the density level (0.15, 0.25 ...)
 */
function right_getCore(is_left, std, radius, tau){

  console.log("-------------------right get core --------------------");
  //no norData
  var target_right = document.getElementById("full");

  spinner_right = new Spinner(opts_right).spin();
  target_right.appendChild(spinner_right.el);
  var norData = right_ken;

  var x = 1.0;
  var y = (maxY-minY)/(maxX-minX);

  // fill with density rectangles.
  right_fill(norData, radius, tau, std, x, y, is_left);
  // kill chaos.
  //right_killChaos(std, radius, tau);

}

function right_killChaos(std, radius, tau){

  right_coresetData.forEach(function(d){
    d.color = d.originColor;
  });

  right_coresetData.forEach(function(d){
    if(d.color !="#f7f4f9" && d.value < tau*right_max){
      //console.log(">epsilon");
      var flag = false;
      right_coresetData.forEach(function(k){
        if(k.value >= tau*right_max){
          if(eval_range(d.x, d.y, k.x, k.y, std) < radius){
            flag = true;
            d.color = d.originColor;
          }
        }
      });
      if(!flag){
        d.color ="#fff";
      }
    }
  });
  //updateHeapMap();
  //draw_canvas();
  //console.log("right coreset data in killing", + right_coresetData.length);
  right_map_draw();

  //right_map_update();
  //zoomed_rescale();
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
function right_fill(norData, radius, tau, std, x, y, is_right){


  // Update the max density.
  // var v = 0.0;
  // var cur_max = 0.0;
  // for(var i=0.0; i<edge*x; i+=delta){
  //   for(var j=0.0; j<edge*y; j+=delta){
  //     v = kde_kernel(norData, std, (i+delta/2.0)/edge, (j+delta/2.0)/edge);
  //     if (v > cur_max){
  //       cur_max = v;
  //     }
  //   }
  // }

  // max = cur_max;
  // console.log("max:" + max);

  /**
   * Fill the rectangles base on the density
   * x  location x.
   * y  location y.
   * color  density color.
   * originColor  remenber the original color.
   * delta  retangle size.
   * value  density value.
   */

 d3.csv(full_data_list[current_data], function(error, data){
   var d2 = performance.now();
   if(error) throw error;

   var fullData = data;
   /**
    *  map
    *
    **/
   right_coresetData = [];
  //  var sum = 0.0;
  //  var count = 0;
  // var v = 0.0;
  // var cur_max = 0.0;
  // for(var i=minX; i<=maxX; i+=delta){
  //   for(var j=minY; j<=maxY; j+=delta){
  //     v = right_kde_kernel(right_ken, std, i+delta/2.0, j+delta/2.0);

  //     if(right_is_diff!=0){

  //       v = (parseFloat(fullData[count].value) - v);

  //       v = Math.abs(v);
  //       if(right_is_diff == 2){
  //         if(fullData[count].value != 0){
  //           v = v/parseFloat(fullData[count].value);
  //           if (v > 1){
  //             // console.log("coreset position: x:" + i + "y:" + j);
  //             // console.log("full data position : x:" + fullData[count].x + "y:" + fullData[count].y);
  //             // console.log("full data value:" + fullData[count].value + " data value:" + v*parseFloat(fullData[count].value));
  //           }
  //         }else{
  //           v = 0;
  //         }
  //       }

  //       count += 1;
  //     }

  //     sum += v;
  //     if (v > cur_max){
  //       cur_max = v;
  //     }
  //   }
  // }

  //  console.log("right average difference: " + sum/parseFloat(count));
  //  right_max = cur_max;
   //console.log("right max no origin:" + right_max);

   if(!left_is_origin){
     right_max = max_max;
   }

   console.log("right_max:" + right_max);
   var count = 0;
   var max_diff = 0;
   for(var i=minX; i<=maxX; i+=delta){
    for(var j=minY; j<=maxY; j+=delta){
      var value = right_kde_kernel(right_ken, std, i+delta/2.0, j+delta/2.0);
       if(right_is_diff!=0){

         // for(var data_i = 0; data_i < fullData.length; data_i ++){
         //   if(i == fullData[data_i].x && j == fullData[data_i].y){
         //     value = (fullData[data_i].value - value);
         //     value = Math.abs(value);

         //     if(right_is_diff == 2){
         //       value = value/fullData[data_i];
         //     }
         //   }
         // }

         // console.log("coreset position: x:" + i + "y:" + j);
        // console.log("full data position : x:" + full_Data[count].x + "y:" + full_Data[count].y);
        // console.log("full data value:" + full_Data[count].value + " data value:" + value);
        value = (parseFloat(fullData[count].value) - value);

        // if(value < 0){
        //       console.log("value < 0", value);
        //       console.log("value > 0", Math.abs(value));
        // }
        value = Math.abs(value);
        if(right_is_diff == 2){
          if(fullData[count].value != 0){
            value = value/parseFloat(fullData[count].value);
          }else{
            value = 0;
          }
        }
        // console.log(value);
        // console.log(max);
        // for(var data_i = 0; data_i < full_Data.length; data_i ++){
        //   if(i == full_Data[data_i].x && j == full_Data[data_i].y){
        //     value = (full_Data[data_i].value - value);
        //     if(value < 0){
        //       console.log("value < 0", value);
        //       console.log("value > 0", Math.abs(value));
        //     }
        //     value = Math.abs(value);
        //     if(left_is_diff == 2){
        //       value = value/full_Data[data_i];
        //     }
        // }
        // }

         if(value > max_diff){
           max_diff = value;
         }

         count += 1;

       }

      var percent = parseFloat(value)/right_max;

      var color_value = 0.0;

      threshold.range().map(function(color) {
        var d = threshold.invertExtent(color);
        if (d[0] == null) d[0] = xBar.domain()[0];
        if (d[1] == null) d[1] = xBar.domain()[1];
        if(percent > d[0] && percent <= d[1]){
          color_value = d[0];
        }
      });

      if(color_value >= -0.05){
          right_coresetData.push({"x":i, "y":j, "color": threshold(color_value), "originColor": threshold(color_value) ,"delta":delta, "value":value});
      }



  /**
   *  original
   **/
  // for(var i=0.0; i<edge*x; i+=delta){
  //   for(var j=0.0; j<edge*y; j+=delta){
  //     var value = kde_kernel(norData, std, (i+delta/2.0)/edge, (j+delta/2.0)/edge);
  //     for(var data_i = 0; data_i < fullData.length; data_i ++){
  //       if(i == fullData[data_i].x && j == fullData[data_i].y){
  //         value = (fullData[data_i].value - value)/fullData[data_i];
  //       }
  //     }

  //     var percent = parseFloat(value)/max;

  //     var color_value = 0.0;

  //     threshold.range().map(function(color) {
  //       var d = threshold.invertExtent(color);
  //       if (d[0] == null) d[0] = xBar.domain()[0];
  //       if (d[1] == null) d[1] = xBar.domain()[1];
  //       if(percent > d[0] && percent <= d[1]){
  //         color_value = d[0];
  //       }
  //     });

  //     if(color_value >= 0.05){
  //       if(is_left){
  //         coresetData.push({"x":i, "y":j, "color": threshold(color_value), "originColor": threshold(color_value) ,"delta":delta, "value":value});
  //       }else{
  //         console.log("fill, Im right!!!!!!!1");
  //         fullData.push({"x":i, "y":j, "color": threshold(color_value), "originColor": threshold(color_value) ,"delta":delta, "value":value});
  //       }
   //     }


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
   console.log("max_diff_right:" + max_diff);
   //spinner_right.stop();
   //right_map_update();
   right_killChaos(std, radius, tau);
   var d3 = performance.now();
   console.log("d3" + d3);
   set_right_time((d3-d2)/1000);
 });

}

function right_kde_kernel(norData, std, x, y){
  var count = 0.0;
  var coeff = 1.0;
  // STD = 0.0028;

  norData.forEach(function(d){
    var dist = (x-d.x)*(x-d.x) + (y-d.y)*(y-d.y);
   if (dist <= 5.0*STD/(maxY - minY)){
    count += coeff*parseFloat(Math.exp(-dist/(2.0*STD*STD)));
   }
  });

  return parseFloat(count)/(norData.length+1);
}

// function update(std, radius, tau){

//   d3.select("#std-value").text(std);
//   d3.select("#std").property("value", std);

//   getCore(std, radius, tau);

//   //updateHeapMap(coresetData);
//   //draw_canvas();
// }

// var canvas;

//   d3.selectAll('.coreset_svg').remove();

//   var svg = d3.select("#coreset").append('svg')
//       .attr('width',700)
//       .attr('height', 500)
//       .attr('class', 'coreset_svg')
//       .append('g');
//       //.call(zoom);

//   var xAxis = d3.axisBottom(x)
//       .ticks(width/height*10)
//       .tickSize(height)
//       .tickPadding(8 - height);

//   var yAxis = d3.axisRight(y)
//       .ticks(10)
//       .tickSize(width)
//       .tickPadding(8 - width);

//   //svg.selectAll("g").remove();
//   var gx = svg.append("g")
//       .attr("class", "axis axis-x")
//       .call(xAxis);

//   var gy = svg.append("g")
//       .attr("class", "axis axis-y")
//       .call(yAxis);

  // function draw(){


  //   // canvas.save();
  //   // canvas.clearRect(0, 0, width, height);
  //   // canvas.translate(transform_x, transform_y);
  //   // canvas.scale(scale_value, scale_value);

  //   coresetData.forEach(function(d){
  //     canvas.beginPath();
  //     canvas.rect(parseFloat(d.x)+90, -parseFloat(d.y)+350, parseFloat(d.delta), parseFloat(d.delta));
  //     canvas.fillStyle = d.color;
  //     canvas.fill();
  //     //canvas.closePath();
  //   });
  // }

// function draw_canvas(flag){


//   console.log("comming in draw canvas");
//   //if(flag == 0){
//     var transform = d3.zoomIdentity;
//     var zoom = d3.zoom()
//       .scaleExtent([1/scale_value,40/scale_value])
//       .translateExtent([[-width,-height],[width, height]])
//       .on("zoom", zoomed);
//   //}
//   d3.select('#coreset').selectAll('div').remove();
//   //d3.select('#coreset').selectAll('g').remove();

//   var char_div = d3.select('#coreset').append('div')
//       .attr('id','char_div')
//       .style('left', 200)
//       .style('top', -500);

//   char_div.selectAll("canvas").remove();

//   var core_canvas = char_div.append("canvas")
//       .attr('id','main_canvas')
//       .attr('width', width)
//       .attr('height', height)
//       .on("click", clickFunction);



 //  canvas = core_canvas.node().getContext("2d");


//   d3.selectAll(".coreset_svg").call(zoom);


//   // var color_scale_bar_g = d3.selectAll(".color_bar_svg").selectAll("g")
//   //     .data(colorRange).enter().append("g");

//   // color_scale_bar_g.append("rect")
//   //   .attr("width", 10)
//   //   .attr("height", 20)
//   //   .attr("x", 20)
//   //   .attr("y", function(d,i){
//   //     return i*20;
//   //   })
//   //   .attr("fill", function(d){
//   //     return d;
//   //   });

//   // color_scale_bar_g.append("text")
//   //   .attr("x",20)
//   //   .attr("y",function(d,i){
//   //     return (i+1)*20;
//   //   })
//   //   .text(function(d,i){
//   //     return (95-(i)*10)+"%";
//   //   });
//   //0.037657

//   //getCore(0.01, 501, 0.15);

//   draw();


// }


// function zoomed_rescale(){

//     canvas.save();
//     canvas.clearRect(0, 0, width, height);

//     canvas.translate(transform_x, transform_y);
//     canvas.scale(scale_value, scale_value);

//     // scale_value = transform.k;
//     // transform_x = transform.x;
//     // transform_y = transform.y;

//     // rescale_x = d3.event.transform.rescaleX(x);
//     // rescale_y = d3.event.transform.rescaleY(y);

//     draw();
//   canvas.restore();

//   full_canvas.save();
//   full_canvas.clearRect(0, 0, width, height);

//   full_canvas.translate(transform_x, transform_y);
//   full_canvas.scale(scale_value, scale_value);

//   draw_full();
//   full_canvas.restore();

//   if(rescale_x == 0){
//     return;
//   }
//     gx.call(xAxis.scale(rescale_x));
//     gy.call(yAxis.scale(rescale_y));
//     full_gx.call(full_xAxis.scale(rescale_x));
//     full_gy.call(full_yAxis.scale(rescale_y));
// }
//   function zoomed(){

//     transform = d3.event.transform;
//     // console.log(d3.event.translateX);

//     canvas.save();
//     canvas.clearRect(0, 0, width, height);

//     canvas.translate(transform.x, transform.y);
//     canvas.scale(transform.k, transform.k);

//     scale_value = transform.k;
//     transform_x = transform.x;
//     transform_y = transform.y;

//     rescale_x = d3.event.transform.resc
  //   aleX(x);
  //   rescale_y = d3.event.transform.rescaleY(y);

  //   console.log(scale_value);
  //   console.log(transform_x);
  //   console.log(transform_y);

  //   draw();
  //   canvas.restore();

  //   gx.call(xAxis.scale(d3.event.transform.rescaleX(x)));
  //   gy.call(yAxis.scale(d3.event.transform.rescaleY(y)));

  //   //console.log(xAxis.rescale());

  //   full_canvas.save();
  //   full_canvas.clearRect(0, 0, width, height);

  //   full_canvas.translate(transform.x, transform.y);
  //   full_canvas.scale(transform.k, transform.k);



  //   draw_full();
  //   full_canvas.restore();

  //   full_gx.call(full_xAxis.scale(d3.event.transform.rescaleX(x)));
  //   full_gy.call(full_yAxis.scale(d3.event.transform.rescaleY(y)));
  // }

// function clickFunction(){

//   var radius = d3.select("#radius").property("value");
//   console.log(radius);
//   console.log(d3.event.clientX);

//   d3.select('.coreset_svg').append("circle")
//     .attr("cx", d3.event.pageX-8)
//     .attr("cy", d3.event.pageY-534)
//     .attr("r", +radius*scale_value)
//     .attr("fill-opacity","0")
//     .attr("stroke","red")
//     .transition()
//       .duration(1000)
//       //.ease(Math.sqrt)
//       .remove();

// }


// d3.select("button")
//   .on("click", reset);


// function set_data_size(size){
//   console.log("set data size");
//   d3.select("#sample_value").text(+size);
// }

// function set_time(time){
//   console.log("set time size");
//   d3.select("#sample_time_value").text((+time).toFixed(1));
// }

// d3.select("#std").on("input", function(d){
//   // var tau = d3.select("tau").property("tau");
//   // var radius = d3.select("#radius").property("value");
//   var epsilon = d3.select("#epsilon").property("value");

//   d3.select("#std-value").text(+this.value);
//   d3.select("#std").property("value", +this.value);
//   //update(+this.value, radius, tau);
//   randomSample(+this.value, epsilon, 0);

// });

// d3.select("#epsilon").on("input", function(d){
//   var std = d3.select("#std").property("value");

//   d3.select("#epsilon-value").text(+this.value);
//   d3.select("#epsilon").property("value", +this.value);

//   randomSample(std, +this.value, 1);

// });

// d3.select("#radius").on("input", function(d){
//   var std = d3.select("#std").property("value");
//   var tau = d3.select("#tau").property("value");

//   d3.select("#radius-value").text(xscale(+this.value).toFixed(2));
//   d3.select("#radius").property("value", +this.value);
//   killChaos(std, +this.value, tau);
// });

// d3.select("#tau").on("input",function(d){
//   var std = d3.select("#std").property("value");
//   var radius = d3.select("#radius").property("value");

//   d3.select("#tau-value").text(+this.value);
//   d3.select("#tau").property("value", +this.value);

//   killChaos(std, radius, +this.value);
// });


// function handleRadiusClick(event){

//   var std = d3.select("#std").property("value");
//   var value = document.getElementById("radius_input").value;

//   var tau = d3.select("#tau").property("value");

//   d3.select("#radius-value").text(value);
//   d3.select("#radius").property("value", reverseXscale(parseFloat(value)));
//   killChaos(std, reverseXscale(parseFloat(value)), tau);
//   return false;
// }

// function handleTauClick(event){

//   var std = d3.select("#std").property("value");
//   var value = document.getElementById("tau_input").value;

//   var radius = d3.select("#radius").property("value");

//   d3.select("#tau-value").text(value);
//   d3.select("#tau").property("value", +value);
//   killChaos(std, radius, +value);
//   return false;
// }

// function handleEpsilonClick(event){

//   var std = d3.select("#std").property("value");
//   var value = document.getElementById("epsilon_input").value;

//   d3.select("#epsilon-value").text(value);
//   d3.select("#epsilon").property("value", parseFloat(value));
//   randomSample(std, parseFloat(value), 1);
//   return false;
// }

// function handleStdClick(event){

//   var epsilon = d3.select("#epsilon-value").text();
//   var value = document.getElementById("std_input").value;

//   d3.select("#std-value").text((+value).toFixed(4));
//   d3.select("#std").property("value", parseFloat(value));
//   randomSample(parseFloat(value), +epsilon, 0);
//   return false;
// }

// function handleCompare(event){
//   var data_value = document.getElementById("data_type_select").value;
//   var left_dropdown_value = document.getElementById("map_type_select_left").value;
//   var right_dropdown_value = document.getElementById("map_type_select_right").value;
//   var is_sorted = true;
//   var is_origin = false;

//   if(left_dropdown_value.includes("coreset")){
//     is_sorted = true;
//   }else{
//     is_sorted = false;
//   }

//   if(left_dropdown_value == "Original"){
//     is_origin = true;
//   }else{
//     is_origin = false;
//   }


//   // init left and right
//   init_left(data_value, is_sorted, is_origin, true);
//   //init_right(data_value, is_sorted, is_origin, false);


// }


// function reset(){
//   svg.transition().duration(500)
//     .call(zoom.transform, d3.zoomIdentity);
// }

function set_right_time(time){

  console.log("set right time zone!!!!");
  if(right_is_origin == true){
    console.log("lallala right!");
    d3.select("#right_sample_time_value").text(full_data_time[current_data]);
  }else{
    d3.select("#right_sample_time_value").text((+time).toFixed(1));

  }
  d3.select("#right_full_time_value").text(full_data_time[current_data]);
}

function set_right_data_size(size){

  if(right_is_origin == true){
    d3.select("#right_sample_value").text(full_data_size[current_data]);
  }else{
    d3.select("#right_sample_value").text(+size);
  }
  d3.select("#right_full_value").text(full_data_size[current_data]);
}


function normalize(){
  var diff = maxX - minX > maxY - minY ? maxX - minX : maxY - minY;
  norData = [];

  ken.forEach(function(d){
    norData.push({"x": d.x, "y": d.y, "x_nor": (d.x - minX)/diff, "y_nor": (d.y - minY)/diff, "color":"#fff"});
  });
  return norData;
}

//document.addEventListener('DOMContentLoaded', init_left, false);
