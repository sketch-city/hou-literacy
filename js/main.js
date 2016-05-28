String.prototype.capitalizeFirstLetter = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
}
$(function(){
  //Setup leaflet map
  var houstonmap = L.map('houstonmap').setView([29.7604, -95.3698], 12);
  L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright" target="_blank">OpenStreetMap</a> with <a href="https://github.com/SINTEF-9012/PruneCluster" target="_blank">PruneCluser</a>. More info about this <a href="http://data.houstontx.gov/dataset/city-of-houston-parking-citations">data</a> can be found in my <a href="https://github.com/jpoles1/HOUTix/blob/master/README.md">report (source, methodology)</a>'
  }).addTo(houstonmap);
  var svg = d3.select(houstonmap.getPanes().overlayPane).append("svg");
  var g = svg.append("g").attr("class", "leaflet-zoom-hide");
  //Fetch block group geodata
  d3.json("census_blocks.topojson", function(err, collection){
    collection = topojson.feature(collection, collection.objects.Census2010_Blocks_CoH)
    var transform = d3.geo.transform({point: projectPoint});
    var path = d3.geo.path().projection(transform);
    var feature = g.selectAll("path").data(collection.features).enter().append("path");
    houstonmap.on("viewreset", reset);
    reset();
    function reset() {
      var bounds = path.bounds(collection),
      topLeft = bounds[0],
      bottomRight = bounds[1];
      svg .attr("width", bottomRight[0] - topLeft[0])
      .attr("height", bottomRight[1] - topLeft[1])
      .style("left", topLeft[0] + "px")
      .style("top", topLeft[1] + "px");
      g   .attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");
      feature.attr("d", path);
    }
    function projectPoint(x, y) {
      var point = houstonmap.latLngToLayerPoint(new L.LatLng(y, x));
      this.stream.point(point.x, point.y);
    }
    //Fetch json ticket data
    $.getJSON("literacy_data.json", function(lit_data){
      //Logic goes here...
    });
  })
  $(".tabs-menu a").click(function(event) {
    event.preventDefault();
    $(this).parent().addClass("current");
    $(this).parent().siblings().removeClass("current");
    var tab = $(this).attr("href");
    $(".tab-content").not(tab).css("display", "none");
    $(tab).fadeIn();
  });
})
