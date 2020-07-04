//Building the query url to bring in the earthquake data for the last 7 days

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// Bind the popups to the markers

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
  };

  // Bind the circles 
  let earthquakes = L.geoJSON(earthquakeData, {
  pointToLayer: function(geodata, latlng)
  {
    return L.circleMarker(latlng, { radius: markerSize(geodata.properties.mag) });
  },

  style: function (geoJsonFeature) {
  return {
            fillColor: markerColor(geoJsonFeature.properties.mag),
            fillOpacity: 0.7,
            weight: 0.1,
            color: 'black'

        }
    },

    onEachFeature: onEachFeature,
  });

// Sending our earthquakes layer to the createMap function
  createMap(earthquakes);
}

// markerColor function to determine the color based on the size of the magnitude 
function markerColor(magnitude){
  if (magnitude >= 8) {
    return "maroon"
  }
  else if (magnitude >= 7) {
    return "firebrick"
  }
  else if (magnitude >= 6) {
    return "red"
  }
  else if (magnitude >= 5){
    return "indianred"
  }
  else if (magnitude >= 4) {
    return "salmon"
  }
  else if (magnitude >= 3){
    return "orange"
  }
  else if (magnitude >= 2){
    return "yellow"
  }
  else if (magnitude >= 1){
    return "green"
  }
  else if (magnitude >= 0) {
    return "lightgreen"
  }
  else { return "black"}
};

// markerSize function to determine the scale the magnitdue
function markerSize(magnitude) {
  return magnitude * 5;
};

// CreateMap function to create the base and overlay layers
function createMap(earthquakes) {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 12,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 12,
    id: "dark-v10",
    accessToken: API_KEY
  });

  var SatelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 12,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  var highContrastMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 12,
    zoomOffset: -1,
    id: "mapbox/outdoors-v10",
    accessToken: API_KEY
  });

  var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 12,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });


  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Satellite map": SatelliteMap,
    "High Contrast map": highContrastMap,
    "Light map": lightMap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the lightmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      39.09, -109.71
    ],
    zoom: 5,
    layers: [lightMap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // create legend
  let legend = L.control({position:"bottomleft"});

      legend.onAdd = function(map) 
      {
  
          let div = L.DomUtil.create('div'),
              // the magintude keys to be displayed on DOM   
              keys = [0, 1, 2, 3, 4, 5, 6, 7, 8],
              labels = [];
  
          div.innerHTML += "<h5 style='margin:2px background-color: bisque;'>Magnitude</h5>"
          
          for (let i = 0; i < keys.length; i++){
            div.innerHTML += '<i style="width:20px; height:10px; margin-right:2px; background-color:'+ markerColor(keys[i]) + '">___</i>' + 
              keys[i] + (keys[i + 1] ? '&ndash;' + keys[i + 1] + '<br>': '+');
          }
      
          return div;
      };
  legend.addTo(myMap);
}
