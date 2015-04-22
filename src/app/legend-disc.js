module.exports = function() {

  var $ = require('jquery');
  var d3 = require('d3');

  $(document).ready(function() { 

    var degrees_between_arc_limits = 5,
        startAngle = 2 * Math.PI * (degrees_between_arc_limits / 360) / 2,
        endAngle = 2 * Math.PI * (1 - degrees_between_arc_limits / (360 * 2));


    var canvas = d3.select('#calendar-legend').append('svg').attr('height', 270).attr('width', 210);

    canvas
      .append('g')
      .attr('class', 'calendar-legend-disc')
      .attr('transform', '');

    var gregArcLeg = d3.svg.arc()
        .innerRadius(11)
        .outerRadius(15)
        .startAngle(startAngle) 
        .endAngle(endAngle);

    var levelArcLeg = d3.svg.arc()
        .innerRadius(16)
        .outerRadius(25)
        .startAngle(startAngle) 
        .endAngle(endAngle);

    var rainArcLeg = d3.svg.arc()
        .innerRadius(26)
        .outerRadius(30)
        .startAngle(startAngle) 
        .endAngle(endAngle);

    var phasesArcLeg = d3.svg.arc()
        .innerRadius(31)
        .outerRadius(35)
        .startAngle(startAngle) 
        .endAngle(endAngle);

    var legenddisc = d3.select('.calendar-legend-disc').append('g').attr('transform', 'scale(3) translate(35, 40)'); 

        legenddisc.append('path')
      	.attr('d',gregArcLeg)
      	.attr('class','greg-arc-leg')
        .on('mouseover', function() { canvas.select('text[class="txt-greg"]').style('opacity',1)})
      	.on('mouseleave', function() { canvas.select('text[class="txt-greg"]').style('opacity',0)});

        legenddisc.append('path')
      	.attr('d',levelArcLeg)
      	.attr('class','level-arc-leg')
        .on('mouseover', function() { canvas.select('text[class="txt-level"]').style('opacity',1)})
      	.on('mouseleave', function() { canvas.select('text[class="txt-level"]').style('opacity',0)});

        legenddisc.append('path')
      	.attr('d',rainArcLeg)
      	.attr('class','rain-arc-leg')
        .on('mouseover', function() { canvas.select('text[class="txt-rain"]').style('opacity',1)})
      	.on('mouseleave', function() { canvas.select('text[class="txt-rain"]').style('opacity',0)});

        legenddisc.append('path')
      	.attr('d',phasesArcLeg)
      	.attr('class','phases-arc-leg')
        .on('mouseover', function() { canvas.select('text[class="txt-phases"]').style('opacity',1)})
      	.on('mouseleave', function() { canvas.select('text[class="txt-phases"]').style('opacity',0)});

    var texts = canvas.append('g');

      	texts.append('text').attr('class','txt-const')
      	.text('Constelações Tukano');

      	texts.append('text').attr('class','txt-greg')
      	.text('Calendário gregoriano');

      	texts.append('text').attr('class','txt-level')
      	.text('Nível do rio (cm3)');

      	texts.append('text').attr('class','txt-rain')
      	.text('Pluviometria (mm)');

      	texts.append('text').attr('class','txt-phases')
      	.text('Estações do ano');

      	texts.selectAll('text')
        .style("opacity", 0)
      	.attr('x',20)
      	.attr('y',260);
  });

};