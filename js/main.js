String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}

var color_scale;

// Default Property to highlight
var current_prop = "No_HS"

// Begin Application
$(function(){

  //Setup leaflet map
  var houstonmap = L.map('houstonmap').setView([29.7604, -95.3698], 12);

  // Grab tile layer
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> with <a href="https://github.com/SINTEF-9012/PruneCluster" target="_blank">PruneCluser</a>. More info about this <a href="http://data.houstontx.gov/dataset/city-of-houston-parking-citations">data</a> can be found in my <a href="https://github.com/jpoles1/HOUTix/blob/master/README.md">report (source, methodology)</a>'
  }).addTo( houstonmap ); // Add to map


  // Grab JSON literacy data from server
  $.getJSON("literacy_data.json", function(lit_data){

    // Prepare interface
    function prepareInfoarea( block_id ){

      // Clear the interface
      $("#infoarea").html("");

      // Loop through properties, adding buttons for each
      for(prop in lit_data){

        // Check for active property
        var active = (prop == current_prop ? "active": "");

        // Append button
        $("#infoarea").append("<button class='prop_button "+active+"' type='button' value="+prop+">"+prop+(block_id ? ": "+lit_data[prop][block_id] : "")+"</button>")
      }
    }

    // Immediately create interface
    prepareInfoarea();

    //Setup geo-data
    function highlightFeature( e ) {
      var layer = e.target; // Select the layer that was clicked
      var layer_props = layer.feature.properties; // Grab Leaflet properties
      var block_id = getFeatureID( layer_props ); // Find the block_id

      // Build Interface with chosen Block ID
      prepareInfoarea( block_id );

      // Listen to clicks on each property button
      $(".prop_button").click(function(){
        // Set the global current property
        current_prop = $(this).val();
        console.log(current_prop);

        // Change the feature
        changeFeature();

        // Switch classes on the buttons
        $(".prop_button").removeClass("active");
        $(this).addClass("active");
      });

      // Set layer opacity after it's been loaded
      layer.setStyle({
          fillOpacity: 1
      });

      // Non IE and Opera browsers, bring the layer forward
      if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
      }
    }

    // Reset the highlighted layers
    function resetHighlight(e) {
      e.target.setStyle({
          fillOpacity: .7
      });
    }

    // Zoom
    function zoomToFeature(e) {
      //Adds a % padding to a frame around the feature of interest
      houstonmap.fitBounds(e.target.getBounds().pad(.5));
    }

    // Loop for each feature
    function onEachFeature(feature, layer) {
      layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: zoomToFeature
      });
    }

    // Composite Feature ID from data row index
    getFeatureID = function(row){
      return( row["TRACT"] + "-" + row["BLKGRP"] );
    }

    // Set boundaries for layers w/ geoJSON notation
    // http://leafletjs.com/reference.html#geojson-style
    var boundaries = L.geoJson(null, {
      style: {
        color : "black",
        fillOpacity: .7,
        fillColor: "white"
      },
      onEachFeature: onEachFeature
    });

    // Function for changing features
    // Fired when an Interface Button is clicked
    var changeFeature = function(){
      console.log(current_prop);

      // Get color scale from
      color_scale = chroma
                      .scale(['yellow', 'red']) // Color range
                      .domain([ lit_data[current_prop]["min"], lit_data[current_prop]["max"] ]); // Min/max from data

      // Loop through each layer
      boundaries.eachLayer(function(layer){

        // Get the block_id from the current layer
        var block_id = getFeatureID( layer.feature.properties );

        // Set the sytle based on the calculated scale
        layer.setStyle({
          fillColor : color_scale( lit_data[current_prop][block_id] ).hex()
        });
      });
    } // END CHANGE FEATURE


    // Loop through the data again
    for(key in lit_data){
      // Add an option to dropdown selectors
      $(".variable-selector").append( '<option value="' + key + '">' + key + '</option>' )
    }

    // Set the selector to the current property
    $(".variable-selector").val(current_prop)

    // Listen to change actions on the selector
    $(".variable-selector").on("change", function(){
      current_prop = $(this).val();
      console.log(current_prop);
      changeFeature();
    })

    // Ingest the Cenus Blocks KML data
    omnivore.kml("census_blocks.kml", null, boundaries);

    // Set options for map markers
    var markerOpts = {
      radius: 15,
      fillColor: "blue",
      weight: 1,
      opacity: 1,
      fillOpacity: .8
    };

    // Set image path
    L.Icon.Default.imagePath = "img/"

    // Create markers for literacy centers
    var lit_markers = L.geoJson(null, {
      pointToLayer: function (feature, latlng) {
        console.log(feature)
        return L.marker(latlng).bindPopup(feature.properties.name);
      }
    });

    // Ingest Providers KML and apply markers
    omnivore.kml("lit_providers.kml", null, lit_markers);

    // Add Providers to the map
    lit_markers.addTo(houstonmap);

    // add boundaries to the map
    boundaries
          .addTo(houstonmap)
          .on('ready', changeFeature ); // Fire changeFeature on load
  });

  // Handle tab menu clicks
  $(".tabs-menu a").click(function(event) {
    event.preventDefault();
    $(this).parent().addClass("current");
    $(this).parent().siblings().removeClass("current");
    var tab = $(this).attr("href");
    $(".tab-content").not(tab).css("display", "none");
    $(tab).fadeIn();
  });

}); // END PAGE LOAD
