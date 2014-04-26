/**
## Bubble Mixin

Includes: [Color Mixin](#color-mixin)

This Mixin provides reusable functionalities for any chart that needs to visualize data using rects.

**/
dc.rectMixin = function (_chart) {
    var _maxBubbleRelativeSize = 0.3;
    var _minRadiusWithLabel = 10;

    _chart.RECT_NODE_CLASS = "node";
    _chart.RECT_CLASS = "rectunit";
    _chart.MIN_RADIUS = 10;

    _chart = dc.colorMixin(_chart);

    _chart.renderLabel(true);
    _chart.renderTitle(true);

    _chart.data(function(group) {
        return group.top(Infinity);
    });

    var _widthValueAccessor = function(d) {
        return d.width;
    };

    var _heightValueAccessor = function(d) {
        return d.height;
    };

    
    /**
    #### .width([widthScale])
    Get or set rect width scale. By default rect chart uses ```_chart.x()``` as it's width scale .

    **/
    _chart.widthScale = function (_) {
        if (!arguments.length) return _widthScale;
        _widthScale = _;
        return _chart;
    };

    /**
    #### .widthValueAccessor([radiusValueAccessor])
    Get or set the width value accessor function. The width value accessor function if set will be used to retrieve data value
    for each and every rect rendered. The data retrieved then will be mapped using r scale to be used as the actual rect
    width. In other words, this allows you to encode a data dimension using rect size.

    **/
    _chart.widthValueAccessor = function (_) {
        if (!arguments.length) {return _widthValueAccessor;}
        _widthValueAccessor = _;
        return _chart;
    };

    /**
    #### .heightValueAccessor([radiusValueAccessor])
    Get or set the height value accessor function. The height value accessor function if set will be used to retrieve data value
    for each and every rect rendered. The data retrieved then will be mapped using r scale to be used as the actual rect
    height. In other words, this allows you to encode a data dimension using rect size.

    **/
    _chart.heightValueAccessor = function (_) {
        if (!arguments.length) return _heightValueAccessor;
        _heightValueAccessor = _;
        return _chart;
    };

    _chart.rectWidth = function (d) {
        var value = _chart.widthValueAccessor()(d);
        var domain = _chart.x().domain();
        var range = _chart.x().range();
        // should be set globally ? 
        var widthScale;
        if (_chart.isOrdinal()) {
            // [0,1] -> [0, width between the two firsts] 
            widthScale = d3.scale.linear().domain([0,1]).range([0,range[1]-range[0]]);
        }
        else {
            // [0, width max] -> [0, width max]
            widthScale = d3.scale.linear().domain([0, domain[1] - domain[0]]).range([0, range[1] - range[0]]);
        }

        var w = widthScale(value);
        if (isNaN(w) || value <= 0)
            w = 0;
        return w;
    };

    _chart.rectHeight = function (d) {
        var value = _chart.heightValueAccessor()(d);
        var domain = _chart.y().domain();
        var range = _chart.y().range();
        // should be set globally
        var heightScale = d3.scale.linear().domain([0, domain[1] - domain[0]]).range([0, Math.max(range[0], range[1]) - Math.min(range[0], range[1])]);

        var w = heightScale(value);
        if (isNaN(w) || value <= 0)
            w = 0;
        return w;
    };

    var labelFunction = function (d) {
        return _chart.label()(d);
    };

    var labelOpacity = function (d) {
        // FIXME
        return 1;
    };

    _chart._doRenderLabel = function (rectGEnter) {
        if (_chart.renderLabel()) {
            var label = rectGEnter.select("text");

            if (label.empty()) {
                label = rectGEnter.append("text")
                    .attr("text-anchor", "middle")
                    .attr("dy", ".3em")
                    .on("click", _chart.onClick);
            }

            label
                .attr("opacity", 0)
                .text(labelFunction);
            dc.transition(label, _chart.transitionDuration())
                .attr("opacity", labelOpacity);
        }
    };

    _chart.doUpdateLabels = function (rectGEnter) {
        if (_chart.renderLabel()) {
            var labels = rectGEnter.selectAll("text")
                .text(labelFunction);
            dc.transition(labels, _chart.transitionDuration())
                .attr("opacity", labelOpacity);
        }
    };

    var titleFunction = function (d) {
        return _chart.title()(d);
    };

    _chart._doRenderTitles = function (g) {
        if (_chart.renderTitle()) {
            var title = g.select("title");
            if (title.empty()) {
                g.append("title").text(titleFunction);
            }
        }
    };

    _chart.doUpdateTitles = function (g) {
        if (_chart.renderTitle()) {
            g.selectAll("title").text(titleFunction);
        }
    };

    /**
    #### .minRadiusWithLabel([radius])
    Get or set the minimum radius for label rendering. If a rect's radius is less than this value then no label will be rendered.
    Default value: 10.

    **/
    _chart.minRadiusWithLabel = function (_) {
        if (!arguments.length) return _minRadiusWithLabel;
        _minRadiusWithLabel = _;
        return _chart;
    };

    /**
    #### .maxBubbleRelativeSize([relativeSize])
    Get or set the maximum relative size of a rect to the length of x axis. This value is useful when the radius differences among
    different rects are too great. Default value: 0.3

    **/
    _chart.maxBubbleRelativeSize = function (_) {
        if (!arguments.length) return _maxBubbleRelativeSize;
        _maxBubbleRelativeSize = _;
        return _chart;
    };

    _chart.fadeDeselectedArea = function () {
        if (_chart.hasFilter()) {
            _chart.selectAll("g." + _chart.RECT_NODE_CLASS).each(function (d) {
                if (_chart.isSelectedNode(d)) {
                    _chart.highlightSelected(this);
                } else {
                    _chart.fadeDeselected(this);
                }
            });
        } else {
            _chart.selectAll("g." + _chart.RECT_NODE_CLASS).each(function (d) {
                _chart.resetHighlight(this);
            });
        }
    };

    _chart.isSelectedNode = function (d) {
        return _chart.hasFilter(d.key);
    };

    _chart.onClick = function (d) {
        var filter = d.key;
        dc.events.trigger(function () {
            _chart.filter(filter);
            dc.redrawAll(_chart.chartGroup());
        });
    };

    return _chart;
};
