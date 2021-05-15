// Create a function to set colors corresponding to earthquake depth
function depthColor(depth) {
    var color = "";
    if (depth > 90) {
        color = "#ff3333"
    }   else if (depth > 70) {
        color = "#ff5c33"
    }   else if (depth > 50) {
        color = "#ffad33"
    }   else if (depth > 30) {
        color = "#ffd633"
    }   else if (depth > 10) {
        color = "#ccff33"
    }   else if (depth > -10) {
        color = "#99ff33"
    };
    return color
}

// Create a function to set map marker size corresponding to earthquake magnitude
function getRadius(magnitude) {
    var magnitude = "";
}

// Store our API endpoints
var quakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_plates.json"

// Import MapBox map tile layers
// Define satellite layer
var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
	attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>", 
	maxZoom: 18,
	id: "satellite-v9",
	accessToken: API_KEY
});

// Define lightmap layer
var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
});

// Define outdoors layer
var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/outdoors-v11",
    accessToken: API_KEY
});

// Define a baseMaps object to hold our base layers
var baseMaps = {
    "Satellite": satellitemap,
    "Grayscale": lightmap,
    "Outdoors": outdoors
};

// Define two map layers to toggle between
var earthquakes = new L.LayerGroup(earthquakes);
var tecplates = new L.LayerGroup();

var overlays = {
    "Tectonic Plates": tecplates,
    "Earthquakes": earthquakes
    };

// Create our map, giving it the satellite layer to display on load
var myMap = L.map("map", {
    center: [
    45, -45
    ],
    zoom: 2.5,
    layers: [satellitemap, earthquakes, tecplates]
});

// Perform a GET request to the query URL
d3.json(quakeURL).then(function(data) {
    console.log(data)

    // Load GeoJSON data and create circle markers based on lat/lng coordinates
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
        return L.circleMarker(latlng);
        },

    // Color coordinate fill color of circles based on depth of earthquakes
    style: function (feature) {
        return {
            radius: feature.properties.mag * 4,
            fillColor: depthColor(feature.geometry.coordinates[2]),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }
    },

    // Give each feature a popup describing the place and time of the earthquake
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3> Location: &nbsp;" + feature.properties.place +
        "</h3><hr><p> Date & Time:  " + new Date(feature.properties.time) + "</p>" + "<h3> Magnitude: &nbsp;" 
        + feature.properties.mag + "<h3> Depth (in km): &nbsp;" + feature.geometry.coordinates[2]);
    }

    // Add to map
    }).addTo(myMap);

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlays, {
        collapsed: false
    }).addTo(myMap);

    // Create legend
    var legend = L.control({
        position: "bottomright",
    });

    // Add details to legend
    legend.onAdd = function() {
        var div = L.DomUtil.create("div", "info legend");
        var grades = [-10, 10, 30, 50, 70, 90];
        var colors = [
            "#99ff33",
            "#ccff33",
            "#ffd633",
            "#ffad33",
            "#ff5c33",
            "#ff3333"
        ];

        // Loop through earthquake magnitudes to set colors
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML += "<i style = 'background: " + colors[i] + "'></i>"
            + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
        }
        return div;
    };

    // Add legend to map
    legend.addTo(myMap);

});

//Perform a GET request to the tectonic plates URL
d3.json(platesURL).then(function (plates) {
    console.log(plates)

    // Load GeoJSON data and create fault lines based on JSON polygon coordinates
    L.geoJSON(plates, {
        color: "orange"

    // Add layer to map
    }).addTo(tecplates)
    tecplates.addTo(map);
});