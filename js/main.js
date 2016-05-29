String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
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
    console.log(props)
    $("#infoarea").html("Tract: "+props["TRACT"]+"<br>BLKGRP: "+props["BLKGRP"])

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
    }
  }
  function resetHighlight(e) {
    boundaries.resetStyle(e.target);
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
      style: function(feature) {
        console.log("No HS:", clean_data[getFeatureID(feature.properties)]["No_HS"])
      },
      onEachFeature: onEachFeature
  });;
  //omnivore.topojson('census_blocks.topojson').addTo(houstonmap);
  var clean_data = {};
  $.getJSON("literacy_data.json", function(lit_data){
    for(row_id in lit_data){
      row = lit_data[row_id]
      clean_data[getFeatureID(row)] = row;
    }
    console.log(clean_data);
    omnivore.kml("census_blocks.kml", null, boundaries).addTo(houstonmap);
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
