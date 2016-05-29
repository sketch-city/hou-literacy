$(function(){
  var map_area = "#houstonmap";
  var margin, width, barHeight, percent, x, y, xAxis;
  var margin = {top: 10, left: 10, bottom: 10, right: 10}
  , width = parseInt(d3.select(map_area).style('width'))
  , width = width - margin.left - margin.right
  , mapRatio = .5
  , height = width * mapRatio
  , height = parseInt(d3.select(map_area).style('height'));
  console.log(width, height);
  var houstonmap;
  function addTopoData(topoData){
    topoLayer.addData(topoData);
    topoLayer.addTo(houstonmap);
    $.getJSON("literacy_data.json", function(lit_data){
      //Logic goes here...
    });
  }
  //
  var scale,
    translate,
    area; // minimum area threshold for simplification

  var clip = d3.geo.clipExtent()
      .extent([[0, 0], [width, height]]);

  var simplify = d3.geo.transform({
    point: function(x, y, z) {
      if (z >= area) this.stream.point(x * scale + translate[0], y * scale + translate[1]);
    }
  });

  var zoom = d3.behavior.zoom()
      .translate([0, 0])
      .scale(1)
      .scaleExtent([1, 8]);

  var canvas = d3.select(map_area).append("canvas")
      .attr("width", width)
      .attr("height", height);

  var context = canvas.node().getContext("2d");

  context.lineJoin = "round";
  context.lineCap = "round";

  var path = d3.geo.path()
      .projection({stream: function(s) { return simplify.stream(clip.stream(s)); }})
      .context(context);

  d3.json("census_blocks.topojson", function(error, world) {
    if (error) throw error;

    topojson.presimplify(world);

    var boundary = topojson.mesh(world, world.objects.Census2010_Blocks_CoH, function(a, b) {return a !== b; });
    console.log(boundary)
    canvas.call(zoom.on("zoom", zoomed)).call(zoom.event);

    function zoomed() {
      translate = zoom.translate();
      scale = zoom.scale();
      area = 1 / scale / scale;

      context.clearRect(0, 0, width, height);

      context.save();

      context.beginPath();
      path(boundary);
      context.strokeStyle = "#fff";
      context.stroke();

      context.restore();
    }
  });

  d3.select(self.frameElement).style("height", height + "px");

  //Events
  $(".tabs-menu a").click(function(event) {
    event.preventDefault();
    $(this).parent().addClass("current");
    $(this).parent().siblings().removeClass("current");
    var tab = $(this).attr("href");
    $(".tab-content").not(tab).css("display", "none");
    $(tab).fadeIn();
  });
  //on resize:
  d3.select(window).on('resize', resize);
  function resize() {
      width = parseInt(d3.select('#chart').style('width'), 10);
      width = width - margin.left - margin.right;
      // reset x range
      x.range([0, width]);
      // do the actual resize...
  }

})
