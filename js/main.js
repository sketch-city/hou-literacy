
// Map of terms to use in the UI and their labels
var litmap_term_map = {
  No_HS : "No High School",
  Percent_No_HS : "% No High School",
  Percent_Only_Spanish : "% Only Spanish",
  Percent_Other_Languages : "% Other Languages",
  HS_Graduate : "High School Graduate",
  Some_College : "Some College",
  BS_and_Higher : "BS and Higher",
  Percent_HS_Graduate : "% High School Graduate",
  Percent_Some_College : "% Some College",
  Percent_BS_and_Higher : "% BS and Higher",
  Median_HHI : "Median Household Income",
  Median_House_Value : "Median House Value",
  Only_English : "Only English",
  Only_Spanish : "Only Spanish",
  Other_Languages : "Other Languages",
  Percent_Only_English : "% Only English",
}




////////////////////////////////
////////////////////////////////
// Main Litmap Application
var litmap = new Vue({
  el: '.litmap', // Target Element for App

  data: { // Data we're binding to
    literacy_data: null,
    color_scale : null, // Color Scale for Heatmap
    boundaries : null,
    map_view: null,
    term_map: litmap_term_map,
    current_prop: "No_HS", // Property to highlight
    block_id: null, // Property to highlight
    current_block: null, // Data for currently highlighted block

    map : {
        element : "houstonmap",
        center : [29.7604, -95.3698],
        zoom: 12,
        style: { //    http://leafletjs.com/reference.html#geojson-style
            color : "red",
            fillOpacity: .7,
            fillColor: "white",
            weight: 1,
            pointerEvents: "all"
        }
    },

    datasources : {
      literacy_data : "literacy_data.json",
      census_blocks : "census_blocks.kml",
      literacy_providers : "lit_providers.kml",
      tile_layer : "http://{s}.tile.osm.org/{z}/{x}/{y}.png"
    }
  },

  // Initialize application
  created: function () {
    var self = this;

    // Fetch the data
    this.fetchData(function( response ){
      // Update the literacy data
      self.literacy_data = response.data;

      // Callback on successful fetch
      self.createMap();
    });
  },

  // Watch for changes to these properties
  watch: {
    current_prop: 'changeFeature', // Fire changeFeature when current_prop changes
    block_id: 'blockData' // Fire blockData when block_id changes
  },



  // Methods used in the application
  methods: {

    // Fetch data from the server
    fetchData: function ( success_callback, error_callback ) {
      var self = this;

      // GET request
      this.$http( { url: self.datasources.literacy_data , method: 'GET' } )
        .then( function( response ) {
          // success callback
          if( typeof success_callback == "function" ){
              success_callback( response );
          }

        }, function(response) {
            // error callback
            if( typeof error_callback == "function" ){
                error_callback( response );
            }
        });
    },


    // Create Map View
    createMap: function(){
      var self = this;

      //Setup leaflet map
      this.map_view = L.map( this.map.element ).setView( this.map.center, this.map.zoom );

      // Grab tile layer
      L.tileLayer( this.datasources.tile_layer, {
        attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a>. More info about this data can be found in the <a href="https://github.com/sketch-city/hou-literacy">repository</a>'
      }).addTo( this.map_view ); // Add to map

      // Set boundaries for layers w/ geoJSON notation
      // http://leafletjs.com/reference.html#geojson-style
      this.boundaries = L.geoJson(null, {
        style: self.map.style,
        onEachFeature: self.onEachFeature
      });

      // Ingest the Cenus Blocks KML data
      omnivore.kml("census_blocks.kml", null, this.boundaries);

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
          //console.log( feature )
          return L.marker(latlng).bindPopup(feature.properties.name);
        }
      });

      // Ingest Providers KML and apply markers
      omnivore.kml("lit_providers.kml", null, lit_markers);

      // Add Providers to the map
      lit_markers.addTo( this.map_view );

      // add boundaries to the map
      this.boundaries
            .addTo( this.map_view )
            .on('ready', this.changeFeature ); // Fire changeFeature on load
    },

    // Composite Feature ID from data row index
    getFeatureID: function(row){
      return( row["TRACT"] + "-" + row["BLKGRP"] );
    },


    // Function for changing map feature
    changeFeature: function(){
      var self = this;

      // Get color scale from
      this.color_scale = chroma
                          .scale(['yellow', 'red']) // Color range
                          .domain([ this.literacy_data[ self.current_prop ]["min"], this.literacy_data[ self.current_prop ]["max"] ]); // Min/max from data

      // Loop through each layer
      this.boundaries.eachLayer( function( layer ){

        // Get the block_id from the current layer
        var block_id = self.getFeatureID( layer.feature.properties );

        // Set the sytle based on the calculated scale
        layer.setStyle({
          fillColor : self.color_scale( self.literacy_data[ self.current_prop ][ block_id ] ).hex()
        });

      });
    }, // END CHANGE FEATURE

    // Highlight Feature
    highlightFeature: function( e ){
      var layer = e.target; // Select the layer that was clicked
      var layer_props = layer.feature.properties; // Grab Leaflet properties

      // Build Interface with chosen Block ID
      this.block_id = this.getFeatureID( layer_props );

      // Set layer opacity after it's been loaded
      layer.setStyle({
          fillOpacity: 1
      });

      // Non IE and Opera browsers, bring the layer forward
      if (!L.Browser.ie && !L.Browser.opera) {
          layer.bringToFront();
      }
    },

    // Reset the highlighted layers
    resetHighlight: function(e) {
      e.target.setStyle({
          fillOpacity: .7
      });
    },

    // Zoom
    zoomToFeature: function(e) {
      //Adds a % padding to a frame around the feature of interest
      this.map_view.fitBounds( e.target.getBounds().pad( .5 ) );
    },

    // Loop for each feature
    onEachFeature: function(feature, layer) {
      var self = this;

      layer.on({
          mouseover: self.highlightFeature,
          mouseout: self.resetHighlight,
          click: self.zoomToFeature
      });
    },

    // Gather all of the data for a single block
    blockData: function(){
      var block_data = [];

      // Make sure we have a block_id
      if( this.block_id ){

        // Loop through our property map
        for( property in this.term_map ){

          // If we have data for this property and this block
          if( this.literacy_data.hasOwnProperty( property ) > -1  && this.literacy_data[ property ].hasOwnProperty( this.block_id ) > -1 ) {

              // Add it to the array
              block_data.push({
                      name: property,
                      label: this.term_map[ property ],
                      value: this.literacy_data[ property ][ this.block_id ]
                    });
          }
        }

        this.current_block = block_data;
      }

    } // END block_data


  }


});
