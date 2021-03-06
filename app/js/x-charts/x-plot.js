'use strict';

angular.module('x-plot', []).directive('plotChart', ['xUtil', function(xUtil) {
  var link = function(scope, element, attrs, ctrl) {
    
    var b = xUtil.bootstrap(960, 500, element[0]);
    var colors = xUtil.colorScale();
    
    scope.redraw = function() {
      var start = new Date().getTime();
      
      b.svg.selectAll('*').remove()
      
      var data = scope.data;
      var options = scope.options;
      if (!data || !options) {
        return;
      }
      
      xUtil.straightenData(options.series, options.abscissas, data);
      
      b.scales.x.domain(d3.extent(data, function(d) {return d[options.abscissas];}));
      b.scales.y.domain(xUtil.yExtent(options.series, data)).nice();
      b.scales.y2.domain(xUtil.y2Extent(options.series, data)).nice();
      
      xUtil.addXAxis(b);
      xUtil.addYAxis(b, options.axes.y.label);
      
      if (xUtil.hasRightAxis(options.series)) {
        xUtil.addY2Axis(b, options.axes.y2.label);
      }
      
      var abscissa = b.svg.selectAll(".abscissa")
        .data(data)
        .enter().append("g")
        .attr("class", "g")
        .attr("transform", function(d) {
          return "translate(" + b.scales.x(d[options.abscissas]) + ",0)";
        });

      abscissa.selectAll(".dot")
        .data(function(d) { return d.values; })
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", 2.5)
          .attr("cy", function(d) { return b.scales[d.axis](d.value); })
        .style("fill", function(d) { return colors(d.name); })
        .style("fill-opacity", .8)
        .on("mouseover", function(d) {
          xUtil.tooltipEnter(d3.select(this), b.tooltip, d, colors);
        })
        .on("mouseout", function(d) {
          xUtil.tooltipExit(d3.select(this), b.tooltip, d, colors);
        })
      
      var end = new Date().getTime();
      console.debug("took " + (end - start) + " ms to draw");
      
    }
      
    scope.$watch('options', scope.redraw, true); // true -> deep watching
    scope.$watch('data', scope.redraw);
    
    scope.redraw();
  }
  
  
  return {
    restrict: "E",
    replace: true,
    transclude: true,
    scope: {
      data: "=data",
      options: "=options"
    },
    template: '<div></div>',
    link: link
  };
}])