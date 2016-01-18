// Load libs
var d3 = require('d3');
var _ = require('lodash');

// Create widget
var widget = function(){};

// Translations
widget.lang = 'en';
widget.translations = {
    fr: require('../translations/fr.json'),
    def: require('../translations/en.json')
};

// Font-family
widget.fontFamily = 'Verdana';

// Background
widget.bkgColor = '#fff';

// Dimensions
widget.margin = {
    right: 50, 
    left: 100
};
widget.lineHeight = 20;

// Transitions
widget.transitionDuration = 2000;

// Visualization title
widget.title = '';
widget.titleHeight = 30;
widget.titleFontSize = 20;
widget.titleXMargin = 10;

// X axis
widget.axisXHeight = 27;
widget.axisXFontSize = 12;

// Groups
widget.groupTitleX = 0;
widget.groupTitleHeight = 20;
widget.groupTitleFontSize = 14;
widget.groupMarginBottom = 20;

// Legends
widget.legendsX = 80;
widget.legendsFontSize = 12;

// Values
widget.valuesFontSize = 12;

// Wind
widget.windDirectionArrowScale = 0.015;
widget.windArrowPath = 'M771.863,2.64l-754.6,246.3c-22.8,7.4-23.1,39.5-0.4,47.4l233.5,81.1c20.899,7.3,27,33.9,11.399,49.601l-241.7,241.6   c-19.5,19.5-19.5,51.2,0,70.7l78.1,78.1c19.5,19.5,51.2,19.5,70.7,0l241.7-241.7c15.7-15.699,42.3-9.5,49.6,11.4l81.1,233.5   c7.9,22.6,40,22.3,47.4-0.4l246.3-754.6C847.664,26.74,810.764-10.061,771.863,2.64z';
widget.windColorsRange = ['green', 'yellow', 'red'];

// Clouds
widget.cloudsScaleMinMax = [0.005, 0.01];
widget.cloudPath = 'M 1920,384 Q 1920,225 1807.5,112.5 1695,0 1536,0 H 448 Q 263,0 131.5,131.5 0,263 0,448 0,580 71,689.5 142,799 258,853 q -2,28 -2,43 0,212 150,362 150,150 362,150 158,0 286.5,-88 128.5,-88 187.5,-230 70,62 166,62 106,0 181,-75 75,-75 75,-181 0,-75 -41,-138 129,-30 213,-134.5 84,-104.5 84,-239.5 z';
widget.cloudsColorsRange = ['#CCC', '#000'];

// Vario
widget.totalAltitudes = 21;
widget.varioThermColorsRange = ['#FEF963', '#FF8D38'];
widget.varioColors = {
    "*": '#FFC',
    ".": '#FFC',
    "0.5": '#FFE25A',
    "1": '#FFC64F',
    "1.5": '#FA4',
    "2": '#FF8D38'
};

/**
 * Render widget
 *
 * @param target
 */
widget.render = function(target) {

    // Get target container
    this.container =  d3.select(target);

    // Get dimensions
    this.width = this.container.node().offsetWidth;
    this.height = this.container.node().offsetHeight;

    // Create containers
    this.initContainers(this.container);
    
    // Init title
    this.initTitle();

    // Init clouds
    this.initClouds();

    // Init wind
    this.initWind();

    // Init vario
    this.initVario();

    // Init X
    this.initX();

    // Remove axis lines
    this.removeAxisLines();
    
    // Update SVG height
    this.height = this.titleHeight + this.axisXHeight + this.groupMarginBottom + this.grpCloudsHeight + this.groupMarginBottom + this.grpWindHeight + this.groupMarginBottom + this.grpVarioHeight + this.groupMarginBottom + this.axisXHeight;
    this.svg.attr({
        height: this.height
    });
    
    this.svg.select('.bkg')
        .attr({
            height: this.height
        });
};

/**
 * Get translation
 * 
 * @param key
 */
widget.getTranslation = function(key) {
    var lang = this.lang;
    if (!this.translations[lang]) {
        lang = 'def';
    }
    return this.translations[lang][key];
};

/**
 * Init containers
 *
 * @param container
 */
widget.initContainers = function(container) {
    this.svg = container.append('svg')
        .attr({
            version: 1.1,
            xmlns: 'http://www.w3.org/2000/svg',
            width: this.width
        });

    this.svg.append('rect')
        .attr({
            class: 'bkg',
            x: 0,
            y: 0,
            width: this.width,
            fill: this.bkgColor
        });
};

/**
 * Init title
 */
widget.initTitle = function() {
    this.titleText = this.svg.append('text')
        .attr({
            x: this.titleXMargin,
            y: 20,
            style: 'font-family: ' + this.fontFamily + '; font-size: ' + this.titleFontSize + 'px'
        });
};

/**
 * Init clouds
 */
widget.initClouds = function() {
    
    // Calculate height
    this.grpCloudsHeight = this.groupTitleHeight + this.lineHeight * 4;

    // Create group
    var grpY = this.titleHeight + this.axisXHeight + this.groupMarginBottom;
    this.grpClouds = this.svg.append('g')
        .attr({
            class: 'group clouds',
            transform: 'translate(0, ' + grpY + ')'
        });

    // Group title
    this.drawGroupTitle(this.grpClouds, 0, this.getTranslation('clouds'));
    
    // Legends
    this.drawLegend(this.grpClouds, this.groupTitleHeight + this.lineHeight / 2, this.getTranslation('clouds_high'));
    this.drawLegend(this.grpClouds, this.groupTitleHeight + this.lineHeight + this.lineHeight / 2, this.getTranslation('clouds_middle'));
    this.drawLegend(this.grpClouds, this.groupTitleHeight + this.lineHeight * 2 + this.lineHeight / 2, this.getTranslation('clouds_low'));
    this.drawLegend(this.grpClouds, this.groupTitleHeight + this.lineHeight * 3 + this.lineHeight / 2, this.getTranslation('clouds_rainfall'));
    
    // Init size scale
    this.scaleCloudSize = d3.scale.linear()
        .domain([0, 8])
        .range(this.cloudsScaleMinMax);
    
    // Init color scale
    this.scaleCloudColor = d3.scale.linear()
        .domain([0, 8])
        .range(this.cloudsColorsRange);
};

/**
 * Init wind
 */
widget.initWind = function() {

    // Calculate height
    this.grpWindHeight = this.groupTitleHeight + this.lineHeight * 3;

    // Create group
    var grpY = this.titleHeight + this.axisXHeight + this.groupMarginBottom + this.grpCloudsHeight + this.groupMarginBottom;
    this.grpWind = this.svg.append('g')
        .attr({
            class: 'group wind',
            transform: 'translate(0, ' + grpY + ')'
        });

    // Group title
    this.drawGroupTitle(this.grpWind, 0, this.getTranslation('wind'));

    // Legends
    this.drawLegend(this.grpWind, this.groupTitleHeight + this.lineHeight / 2, this.getTranslation('wind_direction'));
    this.drawLegend(this.grpWind, this.groupTitleHeight + this.lineHeight + this.lineHeight / 2, this.getTranslation('wind_speed'));
    this.drawLegend(this.grpWind, this.groupTitleHeight + this.lineHeight * 2 + this.lineHeight / 2, this.getTranslation('wind_turbulence'));

    // Create color scale
    this.scaleColorsWind = d3.scale.linear()
        .domain([0, 15, 30])
        .range(this.windColorsRange);
};

/**
 * Init vario
 */
widget.initVario = function() {

    // Calculate height
    this.grpVarioHeight = this.groupTitleHeight + this.lineHeight * 2 + this.lineHeight * this.totalAltitudes;

    // Create group
    var grpY = this.titleHeight + this.axisXHeight + this.groupMarginBottom + this.grpCloudsHeight + this.groupMarginBottom + this.grpWindHeight + this.groupMarginBottom;
    this.grpVario = this.svg.append('g')
        .attr({
            class: 'group vario',
            transform: 'translate(0, ' + grpY + ')'
        });

    // Group title
    this.drawGroupTitle(this.grpVario, 0, this.getTranslation('vario'));

    // Legends
    this.drawLegend(this.grpVario, this.groupTitleHeight + this.lineHeight / 2, this.getTranslation('vario_cumuli'));
    this.drawLegend(this.grpVario, this.groupTitleHeight + this.lineHeight + this.lineHeight / 2, this.getTranslation('vario_average'));

    // Create Y scale
    var domain = d3.range(400, 4600, 200);
    this.scaleY = d3.scale.linear()
        .range([this.lineHeight * this.totalAltitudes, 0])
        .domain([domain[0], domain[domain.length - 1]]);

    // Create Y axis
    this.axisY = d3.svg.axis()
        .orient('left')
        .scale(this.scaleY)
        .tickFormat(function(d) {
            return d + 'm';
        })
        .tickValues(domain);

    var axisXPos = this.legendsX + 8;
    var axisYPos = this.groupTitleHeight + this.lineHeight * 2 + this.lineHeight / 2;
    this.grpAxisY = this.grpVario.append('g')
        .attr({
            class: 'axis y',
            transform: 'translate(' + axisXPos + ', ' + axisYPos + ')'
        })
        .call(this.axisY);
    
    this.updateAxisLegendsY();

    // Create colors scales
    this.scaleColors = d3.scale.ordinal()
        .domain(_.keys(this.varioColors))
        .range(_.values(this.varioColors));

    this.scaleColorsTherm = d3.scale.linear()
        .domain([0, 2])
        .range(this.varioThermColorsRange);
};

/**
 * Init X axis
 */
widget.initX = function() {

    // Create X scale
    this.scaleX = d3.time.scale()
        .range([this.margin.left, this.width - this.margin.right]);

    // Create X axis
    this.axisX = d3.svg.axis()
        .orient('bottom')
        .scale(this.scaleX)
        .ticks(d3.time.minutes, 30)
        .tickFormat(d3.time.format('%H:%M'));

    var lineStyle = 'stroke: #000; stroke-width: 2;';

    // Top axis
    this.grpTopAxis = this.svg.append('g')
        .attr({
            class: 'axis x top',
            transform: 'translate(0, ' + this.titleHeight + ')'
        });
    this.drawLegend(this.grpTopAxis, this.legendsFontSize + 2, this.getTranslation('time'));
    this.grpTopAxis.append('line')
        .attr({
            x1: 0,
            y1: 1,
            x2: this.width,
            y2: 1,
            style: lineStyle
        });
    this.grpTopAxis.append('line')
        .attr({
            x1: 0,
            y1: this.axisXHeight - 1,
            x2: this.width,
            y2: this.axisXHeight - 1,
            style: lineStyle
        });

    // Bottom axis
    var bottomAxisY = this.titleHeight + this.axisXHeight + this.groupMarginBottom + this.grpCloudsHeight + this.groupMarginBottom + this.grpWindHeight + this.groupMarginBottom + this.grpVarioHeight + this.groupMarginBottom;
    this.grpBottomAxis = this.svg.append('g')
        .attr({
            class: 'axis x bottom',
            transform: 'translate(0, ' + bottomAxisY + ')'
        });
    this.drawLegend(this.grpBottomAxis, this.legendsFontSize + 2, this.getTranslation('time'));
    this.grpBottomAxis.append('line')
        .attr({
            x1: 0,
            y1: 1,
            x2: this.width,
            y2: 1,
            style: lineStyle
        });
    this.grpBottomAxis.append('line')
        .attr({
            x1: 0,
            y1: this.axisXHeight - 1,
            x2: this.width,
            y2: this.axisXHeight - 1,
            style: lineStyle
        });
};

/**
 * Remove axis lines
 */
widget.removeAxisLines = function() {
    d3.selectAll('.axis .domain')
        .attr({
            fill: 'none'
        });
};

/**
 * Update Y axis legends
 */
widget.updateAxisLegendsY = function() {
    d3.selectAll('.axis.y .tick text')
        .attr({
            style: 'font-size: ' + this.legendsFontSize + 'px; text-anchor: end;'
        });
};

/**
 * Update data
 * 
 * @param data
 */
widget.updateData = function(data) {
    
    // Calculate col width
    this.colWidth = (this.width - this.margin.left - this.margin.right) / data.hours.length;

    // Update X
    this.updateX(data);
    
    // Remove axis lines
    this.removeAxisLines();

    // Update data
    this.updateTitle(data);
    this.updateCloudsGroup(this.grpClouds, data);
    this.updateWindGroup(this.grpWind, data);
    this.updateVarioGroup(this.grpVario, data);
};

/**
 * Draw group title
 * 
 * @param grp
 * @param y
 * @param title
 */
widget.drawGroupTitle = function(grp, y, title) {
    grp.append('text')
        .attr({
            x: this.legendsX,
            y: y,
            style: 'alignment-baseline: hanging; font-family: ' + this.fontFamily + '; font-size: ' + this.groupTitleFontSize + 'px; fill: #3299CC; text-anchor: end;'
        })
        .text(title);
};

/**
 * Draw legend
 * 
 * @param grp
 * @param y
 * @param legend
 */
widget.drawLegend = function(grp, y, legend) {
    grp.append('text')
        .attr({
            x: this.legendsX,
            y: y,
            style: 'font-family: ' + this.fontFamily + '; font-size: ' + this.legendsFontSize + 'px; text-anchor: end; alignment-baseline: middle;'
        })
        .text(legend);
};

/**
 * Draw text line
 * 
 * @param grp
 * @param y
 * @param data
 * @param property
 * @param nodeClasses
 */
widget.drawTextLine = function(grp, y, data, property, nodeClasses) {
    var scaleX = this.scaleX;
    var lineHeight = this.lineHeight;
    var blockWidth = this.colWidth;

    // Values
    var items = grp.selectAll(nodeClasses.map(function(item) { return '.' + item; }).join(''))
        .data(data.data, function() {
            return Math.random();
        });

    // Enter
    items.enter().append('text')
        .attr({
            class: nodeClasses.join(' '),
            x: function(d) {
                return scaleX(d.time) + blockWidth / 2;
            },
            y: y + lineHeight / 2,
            opacity: 0,
            style: 'font-family: ' + this.fontFamily + '; font-size: ' + this.valuesFontSize + 'px; text-anchor: middle; alignment-baseline: middle;'
        });

    // Update
    items
        .transition()
        .duration(this.transitionDuration)
        .attr({
            opacity: 1
        })
        .text(function(d) {
            return d[property];
        });
    
    // Remove
    items.exit()
        .transition()
        .duration(this.transitionDuration)
        .attr({
            opacity: 0
        })
        .remove();
};

/**
 * Update title
 * 
 * @param data
 */
widget.updateTitle = function(data) {
    var month = data.date.getMonth() + 1;
    this.title = data.region + ', ' + data.date.getDate() + '.' + month + '.' + data.date.getFullYear();
    
    this.titleText.text(this.title);  
};

/**
 * Update X
 * 
 * @param data
 */
widget.updateX = function(data) {

    // Update X scale
    this.scaleX.domain([data.hours[0], data.hours[data.hours.length - 1]]);

    // Update X axis
    this.grpTopAxis.call(this.axisX);
    this.grpBottomAxis.call(this.axisX);

    // Update X axis legends
    var xTrans = this.colWidth / 2;
    d3.selectAll('.axis.x .tick text')
        .attr({
            transform: 'translate(' + xTrans + ', 0)',
            style: 'font-family: ' + this.fontFamily + '; font-size: ' + this.axisXFontSize + 'px; text-anchor: middle;'
        });
    
    // Update vertical lines
    d3.selectAll('.vertical-line').remove();
    var nbLines = Math.floor(data.hours.length / 4);
    var lineX = 0;
    for (var i = 1; i < nbLines; i++) {
        lineX = this.scaleX(data.hours[i * 4]) - 1;
        this.svg.append('line')
            .attr({
                class: 'vertical-line',
                x1: lineX,
                y1: this.titleHeight + this.axisXHeight,
                x2: lineX,
                y2: this.height - this.axisXHeight,
                stroke: '#999',
                "stroke-width": '1px',
                "stroke-opacity": 0.2
            });
    }
};

/**
 * Update clouds group
 * 
 * @param grp
 * @param data
 */
widget.updateCloudsGroup = function(grp, data) {
    var y = this.groupTitleHeight;
    this.updateClouds(grp, y, data, 'ch', ['cloud', 'high']);
    this.updateClouds(grp, y + this.lineHeight, data, 'cm', ['cloud', 'middle']);
    this.updateClouds(grp, y + this.lineHeight * 2, data, 'cl', ['cloud', 'low']);
    this.drawTextLine(grp, y + this.lineHeight * 3, data, 'ns', ['value', 'precipitation']);
};

/**
 * Update clouds
 * 
 * @param grp
 * @param y
 * @param data
 * @param property
 * @param nodeClasses
 */
widget.updateClouds = function(grp, y, data, property, nodeClasses) {
    var scaleX = this.scaleX;
    var scaleSize = this.scaleCloudSize;
    var scaleColor = this.scaleCloudColor;
    var lineHeight = this.lineHeight;
    var blockWidth = this.colWidth;

    // Values
    var items = grp.selectAll(nodeClasses.map(function(item) { return '.' + item; }).join(''))
        .data(data.data);

    // Enter
    items.enter().append('path')
        .attr({
            class: nodeClasses.join(' '),
            d: this.cloudPath,
            transform: transform(false),
            fill: this.bkgColor,
            style: 'stroke: #000; stroke-width: 200px;'
        });

    // Update
    items
        .transition()
        .duration(this.transitionDuration)
        .attr({
            transform: transform(true),
            fill: function(d) {
                return scaleColor(d[property]);
            }
        });

    // Remove
    items.exit().remove();
    
    function transform(hasScale) {
        return function(d) {
            var height = d3.select(this).node().getBBox().height;
            var width = d3.select(this).node().getBBox().width;
            var scale = hasScale ? scaleSize(d[property]) : 0;

            var tx = scaleX(d.time) + blockWidth / 2 - width * scale / 2;
            var ty = y + lineHeight / 2 - height * scale / 2;
            return 'translate(' + tx + ', ' + ty + ') scale(' + scale + ') rotate(180, ' + width / 2 + ', ' + height / 2 + ')';
        };
    }
};

/**
 * Update wind group
 * 
 * @param grp
 * @param data
 */
widget.updateWindGroup = function(grp, data) {
    var y = this.groupTitleHeight;
    this.updateWindDirection(grp, y, data);
    this.drawTextLine(grp, y + this.lineHeight, data, 'wind_kmh', ['value', 'wind-kmh']);
    this.drawTextLine(grp, y + this.lineHeight * 2, data, 'turb', ['value', 'turbulence']);
};

/**
 * Update wind direction
 * 
 * @param grp
 * @param y
 * @param data
 */
widget.updateWindDirection = function(grp, y, data) {
    var scaleX = this.scaleX;
    var scaleColors = this.scaleColorsWind;
    var lineHeight = this.lineHeight;
    var blockWidth = this.colWidth;
    var windDirectionArrowScale = this.windDirectionArrowScale;
    
    // Values
    var directions = grp.selectAll('.wind.direction')
        .data(data.data);

    // Enter
    directions.enter().append('path')
        .attr({
            class: 'wind direction',
            d: this.windArrowPath,
            transform: transform(false),
            fill: this.bkgColor
        });

    // Update
    directions
        .transition()
        .duration(this.transitionDuration)
        .attr({
            transform: transform(true),
            fill: function(d) {
                return scaleColors(d.wind_kmh);
            }
        });
    
    // Remove
    directions.exit().remove();
    
    function transform(hasScale) {
        return function(d) {
            var height = d3.select(this).node().getBBox().height;
            var width = d3.select(this).node().getBBox().width;
            var scale = hasScale ? windDirectionArrowScale : 0;

            var orientation = -45 + d.wind_deg + 180;
            var tx = scaleX(d.time) + blockWidth / 2 - width * windDirectionArrowScale / 2;
            var ty = y + lineHeight / 2 - height * windDirectionArrowScale / 2;
            return 'translate(' + tx + ', ' + ty + ') scale(' + windDirectionArrowScale + ') rotate(' + orientation + ', ' + width / 2 + ', ' + height / 2 + ')';
        };
    }
};

/**
 * Update vario group
 * 
 * @param grp
 * @param data
 */
widget.updateVarioGroup = function(grp, data) {
    var y = this.groupTitleHeight;
    this.drawTextLine(grp, y, data, 'cumuli', ['value', 'cumuli']);
    this.updateTherm(grp, y + this.lineHeight, data);
    this.updateVario(grp, y + this.lineHeight * 2, data);
};

/**
 * Update therm
 * 
 * @param grp
 * @param y
 * @param data
 */
widget.updateTherm = function(grp, y, data) {
    var bkgColor = this.bkgColor;
    var scaleX = this.scaleX;
    var scaleColors = this.scaleColorsTherm;
    var blockHeight = this.lineHeight;
    var blockWidth = this.colWidth;
    
    var therm = grp.selectAll('.therm')
        .data(data.data, function() {
            return Math.random();
        });
    
    // Enter
    var g = therm.enter().append('g')
        .attr({
            class: 'therm',
            opacity: 0
        });
    
    g.append('rect')
        .attr({
            class: 'therm-bkg',
            x: function(d) {
                return scaleX(d.time);
            },
            y: y,
            height: blockHeight,
            width: blockWidth,
            fill: this.bkgColor
        });
    
    g.append('text')
        .attr({
            class: 'therm-legend',
            x: function(d) {
                return scaleX(d.time) + blockWidth / 2;
            },
            y: y + blockHeight / 2,
            style: 'font-family: ' + this.fontFamily + '; font-size: ' + this.valuesFontSize + 'px; text-anchor: middle; alignment-baseline: middle;'
        })
        .text(function(d) {
            return d.therm;
        });

    // Update
    therm.transition()
        .duration(this.transitionDuration)
        .attr({
            opacity: 1
        });
    
    therm.select('.therm-bkg')
        .transition()
        .duration(this.transitionDuration)
        .attr({
            fill: function(d) {
                return d.therm ? scaleColors(d.therm) : bkgColor;
            }
        });

    // Remove
    therm.exit()
        .transition()
        .duration(this.transitionDuration)
        .attr({
            opacity: 0
        })
        .remove();
};

/**
 * Update vario
 * 
 * @param grp
 * @param y
 * @param data
 */
widget.updateVario = function(grp, y, data) {
    var scaleX = this.scaleX;
    var scaleY = this.scaleY;
    var scaleColors = this.scaleColors;
    var blockHeight = this.lineHeight;
    var blockWidth = this.colWidth;

    // Update Y scale
    this.scaleY
        .range([this.lineHeight * data.altitudes.length, 0])
        .domain([data.altitudes[0], data.altitudes[data.altitudes.length - 1]]);

    // Update Y axis
    this.axisY.tickValues(data.altitudes);
    this.grpAxisY.call(this.axisY);

    // Update Y axis legends
    this.updateAxisLegendsY();

    var full = [];
    data.data.forEach(function(time) {
        data.altitudes.forEach(function(alt, i) {
            if (time.vario[i] != '-') {
                full.push({
                    time: time.time,
                    alt: alt,
                    vario: time.vario[i]
                });
            }
        });
    });
    
    var blocks = grp.selectAll('.block')
        .data(full, function() {
            return Math.random();
        });
    
    // Enter
    var g = blocks.enter().append('g')
        .attr({
            class: 'block',
            opacity: 0
        });

    g.append('rect')
        .attr({
            class: 'block-bkg',
            x: function(d) {
                return scaleX(d.time);
            },
            y: function(d) {
                return y + scaleY(d.alt);
            },
            height: blockHeight,
            width: blockWidth,
            fill: this.bkgColor
        });

    g.append('text')
        .attr({
            class: 'block-legend',
            x: function(d) {
                return scaleX(d.time) + blockWidth / 2;
            },
            y: function(d) {
                return y + scaleY(d.alt) + blockHeight / 2;
            },
            style: 'font-family: ' + this.fontFamily + '; font-size: ' + this.valuesFontSize + 'px; text-anchor: middle; alignment-baseline: middle;'
        })
        .text(function(d) {
            return d.vario;
        });

    // Update
    blocks.transition()
        .duration(this.transitionDuration)
        .attr({
            opacity: 1
        });

    blocks.select('.block-bkg')
        .transition()
        .duration(this.transitionDuration)
        .attr({
            fill: function(d) {
                return scaleColors(d.vario);
            }
        });

    // Remove
    blocks.exit()
        .transition()
        .duration(this.transitionDuration)
        .attr({
            opacity: 0
        })
        .remove();
};

module.exports = widget;
