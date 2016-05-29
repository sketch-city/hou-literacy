String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
$(function(){
  //Setup leaflet map
  var houstonmap = L.map('houstonmap').setView([29.7604, -95.3698], 12);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> with <a href="https://github.com/SINTEF-9012/PruneCluster" target="_blank">PruneCluser</a>. More info about this <a href="http://data.houstontx.gov/dataset/city-of-houston-parking-citations">data</a> can be found in my <a href="https://github.com/jpoles1/HOUTix/blob/master/README.md">report (source, methodology)</a>'
  }).addTo(houstonmap);
  var boundaries;
  $.getJSON('census_blocks.geojson')
    .done(addTopoData);
  function addTopoData(geodata){
    boundaries = L.geoJson(geodata).addTo(houstonmap);
    $.getJSON("literacy_data.json", function(lit_data){
      //Logic goes here...
    });
  }
  $(".tabs-menu a").click(function(event) {
    event.preventDefault();
    $(this).parent().addClass("current");
    $(this).parent().siblings().removeClass("current");
    var tab = $(this).attr("href");
    $(".tab-content").not(tab).css("display", "none");
    $(tab).fadeIn();
  });
})
