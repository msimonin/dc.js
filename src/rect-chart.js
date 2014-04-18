/**
## Bubble Chart

Includes: [Bubble Mixin](#rect-mixin), [Coordinate Grid Mixin](#coordinate-grid-mixin)

A concrete implementation of a general purpose rect chart that allows data visualization using the following dimensions:

* x axis position
* y axis position
* rect radius
* color

Examples:
* [Nasdaq 100 Index](http://dc-js.github.com/dc.js/)
* [US Venture Capital Landscape 2011](http://dc-js.github.com/dc.js/vc/index.html)

#### dc.rectChart(parent[, chartGroup])
Create a rect chart instance and attach it to the given parent element.

Parameters:
* parent : string - any valid d3 single selector representing typically a dom block element such as a div.
* chartGroup : string (optional) - name of the chart group this chart instance should be placed in. Once a chart is placed
   in a certain chart group then any interaction with such instance will only trigger events and redraw within the same
   chart group.

Return:
A newly created rect chart instance

```js
// create a rect chart under #chart-container1 element using the default global chart group
var rectChart1 = dc.rectChart("#chart-container1");
// create a rect chart under #chart-container2 element using chart group A
var rectChart2 = dc.rectChart("#chart-container2", "chartGroupA");
```

**/
dc.rectChart = function(parent, chartGroup) {
    var _chart = dc.rectMixin(dc.coordinateGridMixin({}));

    _chart.transitionDuration(750);

    var rectLocator = function(d) {
        return "translate(" + (rectX(d)) + "," + (rectY(d)) + ")";
    };

    _chart.plotData = function() {
        
        var rectG = _chart.chartBodyG().selectAll("g." + _chart.RECT_NODE_CLASS)
            .data(_chart.data(), function (d) { return d.key; });
  
        renderNodes(rectG);

        updateNodes(rectG);

        removeNodes(rectG);
          
        _chart.fadeDeselectedArea();

    };

    function renderNodes(rectG) {
        var rectGEnter = rectG.enter().append("g");

        rectGEnter
            .attr("class", _chart.RECT_NODE_CLASS)
            .attr("transform", rectLocator)
            .append("rect").attr("class", function(d, i) {
                return _chart.RECT_CLASS + " _" + i;
            })
            .attr("width", "0")
            .attr("height","10")
            .on("click", _chart.onClick)
            .attr("fill", _chart.getColor);

        dc.transition(rectG, _chart.transitionDuration())
            .selectAll("rect." + _chart.RECT_CLASS)
            .attr("width", function(d){return _chart.rectWidth(d);})
            .attr("height", function(d){return _chart.rectHeight(d);})
            .attr("opacity", function(d) {
                return 0.5;
            });

        //_chart._doRenderLabel(rectGEnter);

        _chart._doRenderTitles(rectGEnter);
    }

    function updateNodes(rectG) {
        dc.transition(rectG, _chart.transitionDuration())
            .attr("transform", rectLocator)
            .selectAll("rect." + _chart.RECT_CLASS)
            .attr("fill", _chart.getColor)
            .attr("width", function(d){return _chart.rectWidth(d);})
            .attr("height", function(d){return _chart.rectHeight(d);})
            .attr("opacity", function(d) {
                return 0.5;
            });

        _chart.doUpdateLabels(rectG);
        _chart.doUpdateTitles(rectG);
    }

    function removeNodes(rectG) {
        rectG.exit().remove();
    }

    function rectX(d) {
       // FIXME center rect option
        var x = _chart.x()(_chart.keyAccessor()(d));
        if (isNaN(x))
            x = 0;
        return x;
    }

    function rectY(d) {
       // FIXME center rect option
        var y = _chart.y()(_chart.valueAccessor()(d)); // - _chart.rectHeight(d)/2;
        if (isNaN(y))
            y = 0;
        return y;
    }

    _chart.renderBrush = function(g) {
        // override default x axis brush from parent chart
    };

    _chart.redrawBrush = function(g) {
        // override default x axis brush from parent chart
        _chart.fadeDeselectedArea();
    };

    return _chart.anchor(parent, chartGroup);
};
