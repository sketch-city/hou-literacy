String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
var current_prop = "No_HS"
var color_scale;
$(function(){
  //Setup leaflet map
  var houstonmap = L.map('houstonmap').setView([29.7604, -95.3698], 12);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> with <a href="https://github.com/SINTEF-9012/PruneCluster" target="_blank">PruneCluser</a>. More info about this <a href="http://data.houstontx.gov/dataset/city-of-houston-parking-citations">data</a> can be found in my <a href="https://github.com/jpoles1/HOUTix/blob/master/README.md">report (source, methodology)</a>'
  }).addTo(houstonmap);
  //Setup geo-data
  function highlightFeature(e) {
    var layer = e.target;
    var props = layer.feature.properties;
    $("#infoarea").html("Tract: "+props["TRACT"]+"<br>BLKGRP: "+props["BLKGRP"])
    layer.setStyle({
        fillOpacity: 1
    });
    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
  }
  function resetHighlight(e) {
    e.target.setStyle({
        fillOpacity: .7
    });

  }
  function zoomToFeature(e) {
    houstonmap.fitBounds(e.target.getBounds());
  }
  function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
  }
  getFeatureID = function(row){
    return(row["TRACT"]+"-"+row["BLKGRP"])
  }
  var boundaries = L.geoJson(null, {
    // http://leafletjs.com/reference.html#geojson-style
    style: {
      color : "black",
      fillOpacity: .7,
      fillColor: "white"
    },
    onEachFeature: onEachFeature
  });
  $.getJSON("literacy_data.json", function(lit_data){
    var changeFeature = function(){
      console.log(current_prop)
      color_scale = chroma.scale(['yellow', 'red']).domain([lit_data[current_prop]["min"],lit_data[current_prop]["max"]]);
      boundaries.eachLayer(function(layer){
        var block_id = getFeatureID(layer.feature.properties)
        layer.setStyle({
          fillColor : color_scale(lit_data[current_prop][block_id]).hex()
        });
      });
    }
    for(key in lit_data){
      $(".variable-selector").append('<option value="'+key+'">'+key+'</option>')
    }
    $(".variable-selector").val(current_prop)
    $(".variable-selector").on("change", function(){
      current_prop = $(this).val()
      console.log(current_prop);
      changeFeature();
    })
    omnivore.kml("census_blocks.kml", null, boundaries)
    boundaries.addTo(houstonmap).on('ready', changeFeature);
  });

  $(".tabs-menu a").click(function(event) {
    event.preventDefault();
    $(this).parent().addClass("current");
    $(this).parent().siblings().removeClass("current");
    var tab = $(this).attr("href");
    $(".tab-content").not(tab).css("display", "none");
    $(tab).fadeIn();
  });
})
