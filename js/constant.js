/**
  *   map styles config json.
  **/

var map_styles = [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#f5f5f5"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#ffffff"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#dadada"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "transit.line",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#e5e5e5"
      }
    ]
  },
  {
    "featureType": "transit.station",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#eeeeee"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#c9c9c9"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  }
];


/**
  *   Spinners.
  **/

var spinner_left;
var spinner_right;


// loader settings
var opts_left = {
  lines: 9, // The number of lines to draw
  length: 9, // The length of each line
  width: 5, // The line thickness
  zIndex: 3e9,
  shadow: true,
  top: '800px', // Top position relative to parent
  left: '350px', // Left position relative to parent
  radius: 14, // The radius of the inner circle
  color: '#EE3124', // #rgb or #rrggbb or array of colors
  speed: 1.9, // Rounds per second
  trail: 40, // Afterglow percentage
  className: 'spinner' // The CSS class to assign to the spinner
};

var opts_right = {
  lines: 9, // The number of lines to draw
  length: 9, // The length of each line
  width: 5, // The line thickness
  zIndex: 3e9,
  shadow: true,
  top: '800px', // Top position relative to parent
  left: '1150px', // Left position relative to parent
  radius: 14, // The radius of the inner circle
  color: '#EE3124', // #rgb or #rrggbb or array of colors
  speed: 1.9, // Rounds per second
  trail: 40, // Afterglow percentage
  className: 'spinner' // The CSS class to assign to the spinner
};





//

var minY = -89.582541, maxY = -81.960144, minX = 36.3, maxX = 39.3;
var centerX = (maxX+minX)/2, centerY = (maxY+minY)/2;


var data_list = {"Kentucky":"../data/kentucky_org.txt",
                 "Philadelphia Crimes":"../data/crime_clean.txt",
                 "Japan": "../data/twitter_clean_jp.txt",
                 "Synthetic": "../data/nonuniform_2D.txt"};

var sorted_data_list = {"Kentucky":"../data/ken_sort.txt",
                        "Philadelphia Crimes":"../data/crime_sort.txt",
                        "Japan": "../data/twitter_sort.txt",
                        "Synthetic" : "../data/nonuniform_2D_Zorder_sort.txt"};

var full_data_size = {"Kentucky": 199163,
                      "Philadelphia Crimes": 683499,
                      "Japan": 153586,
                      "Synthetic": 532899};

var full_data_time = {"Kentucky" : 120.5,
                      "Japan": 311.6,
                      "Philadelphia Crimes":1443.3,
                      "Synthetic": 1000.0};

var STD_list = {"Kentucky": 0.07,
                "Philadelphia Crimes": 0.003,
                "Japan": 0.46,
                "Synthetic": 0.008};

var delta_list = {"Kentucky": 0.04,
                  "Philadelphia Crimes":0.002,
                  "Japan": 0.1,
                  "Synthetic": 0.008};

var zoom_list = {"Kentucky": 7,
                 "Philadelphia Crimes": 11,
                 "Japan": 6,
                 "Synthetic": 9};

var full_data_list = {"Kentucky": "../data/kentucky_coreset_full.csv",
                      "Philadelphia Crimes": "../data/crime_full_new2.csv",
                      "Japan": "../data/japan_coreset.csv",
                      "Synthetic": '../data/synthetic_full.csv'};
