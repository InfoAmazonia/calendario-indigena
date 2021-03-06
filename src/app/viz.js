var $ = jQuery = require('jquery');
var d3 = require('d3');
var moment = require('moment');

// GLOBALS
var 
	width = 850,
	height = 675,
	radius = 340,
	degrees_between_arc_limits = 5,
	start_date = '2005-11-17',
	end_date = '2006-10-31',
	startAngle = 2 * Math.PI * (degrees_between_arc_limits / 360) / 2,
	endAngle = 2 * Math.PI * (1 - degrees_between_arc_limits / (360 * 2)),
	totalDays = moment(end_date).diff(start_date, 'days')+1,
	startColorLevel = '#FFDE5C',
	endColorLevel = '#004C53',
	startColorRain = '#F1F1F1',
	endColorRain = '#4D5BA6',
	canvas,
	riverData,
	phasesData;

// HELPER FUNCTIONS

function dateToRadians(date, isEnd) {
	var numberOfDays = moment(date).diff(start_date, 'days');
	if (isEnd) {
		numberOfDays = numberOfDays + 1;
	}

	angle = (2 * Math.PI * numberOfDays / totalDays);
	if (angle > endAngle) 
		return endAngle;
	else if (angle < startAngle)
		return startAngle;
	else 
		return angle;
}


function loadRiverData(callback) {
	// load data from a CSV file
	d3.csv('data/river.csv', 
		function(d) {
			if(d.date >= start_date && d.date <= end_date)
				return {
					date: d.date,
					value: parseFloat(d.date),
					nivel: parseFloat(d.nivel),
					pluviometria: parseFloat(d.pluviometria),
					fases: d.fases
				}
		}, function(err, data) {
			riverData = data;
			callback();
	});
}


function loadPhasesData(callback) {
	// load data from a CSV file
	d3.csv('data/phases.csv', 
		function(d) {
			return {
				uname: d.uname,
				name: d.name,
				start: d.start,
				end: d.end
			};
		}, function(err, data) {
			phasesData = data;
			callback();
	});
}



function initCanvas() {

	// COLOR SCALES

	var rainToColor = d3.scale.linear().domain([0, 150]).range([startColorRain, endColorRain]);
	var levelToColor = d3.scale.linear().domain([0, 1500]).range([startColorLevel, endColorLevel]);

	// AXIS SCALES

	var rainToAxis = d3.scale.linear().domain([0, 150]).range([400, 0]);
	var levelToAxis = d3.scale.linear().domain([0, 1500]).range([400, 0]);

	// ARCS

	var levelArc = d3.svg.arc()
		.innerRadius(radius - 188)
		.outerRadius(radius - 73)

	var levelSecondArc = d3.svg.arc()
		.innerRadius(function (d) { return radius - 200 + parseFloat([d.data.nivel * 0.08]);})
		.outerRadius(function (d) { return radius - 199 + parseFloat([d.data.nivel * 0.08]);})
		//.style("opacity",0.4)/**/

	var rainArc = d3.svg.arc()
		.innerRadius(radius - 70)
		.outerRadius(radius - 45)


	// RIVER ARCS

	var 
		riverPie = d3.layout.pie()
						.value(function (d){ return d.value; })
						.sort(function(a,b){return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;})
						.startAngle(startAngle)
						.endAngle(endAngle);


	canvas = d3.select("#viz")

		 //.style("background-color","rgba(0,0,0,0.3")
		 .append("svg")
		 .attr("height", height)
		 .attr("width", width);

// filter stuff
/* For the shadow filter... */
// everything that will be referenced
// should be defined inside of a <defs> element ;)
var defs = canvas.append( 'defs' );

var gradient = defs.append('radialGradient')
.attr('id','brilho').attr('cx','50%').attr('cy','50%').attr('r','50%').attr('fx','50%').attr('fy','50%');

gradient.append('stop').attr('offset','0%').style('stop-color','rgba(255,255,255,1)').style('stop-opacity','0.3');
gradient.append('stop').attr('offset','100%').style('stop-color','rgba(255,255,255,1)').style('stop-opacity','0');

// append filter element
var filter = defs.append( 'filter' )
                 .attr('id', 'dropshadow' ) // !!! important - define id to reference it later;
                 .attr('x0', '-50%')
                 .attr('y0', '-50%')
                 .attr("width","200%")
                 .attr("height", "200%");

// append gaussian blur to filter
filter.append( 'feGaussianBlur' )
      .attr( 'in', 'SourceAlpha' )
      .attr( 'stdDeviation', 3 ) // !!! important parameter - blur
      .attr( 'result', 'blur' );

// append offset filter to result of gaussion blur filter
filter.append( 'feOffset' )
      .attr( 'in', 'blur' )
      .attr( 'dx', 3 ) // !!! important parameter - x-offset
      .attr( 'dy', 3 ) // !!! important parameter - y-offset
      .attr( 'result', 'offsetBlur' );

// merge result with original image
var feComposite = filter.append( 'feComposite' );

// first layer result of blur and offset
feComposite.attr( 'in2', 'SourceAlpha' )
.attr("operator","arithmetic")
.attr("k2",-1).attr("k3",1).attr("result","ShadowDiff");

// original image on top
feComposite.append( 'feFlood' )
       .attr( 'flood-color', 'rgba(0,0,0,0.1')
       .attr('flood-opacity','0.1');

feComposite.append('feComposite')
.attr('operator','in').attr('in','inset-selection').attr('result','inset-blur');

feComposite.append('feComposite')
.attr('operator','over').attr('in','inset-selection').attr('in2','inset-blur');/**/
// end filter stuff


	legendCanvas = canvas.append("g")
	                  .attr("transform", "translate(0,0)")
					  .attr("class", "legends");

	phasesCanvas = canvas.append("g")
	                  .attr("transform", "translate(425,340)")
					  .attr("class", "phases");

	rainCanvas = canvas.append("g")
	                  .attr("transform", "translate(425,340)")
	                  .attr("class", "rain");

	levelCanvas = canvas.append("g")
	                  .attr("transform", "translate(425,340)")
	                  .attr("class", "river");

	monthsCanvas = canvas.append("g")
	                  .attr("transform", "translate(425,340)")
					  .attr("class", "months");

	skyCanvas = canvas.append("g")
	                  .attr("transform", "translate(300,214)")
					  .attr("class", "sky")
					   .append("svg:image")
	                   .attr("xlink:href", "img/constelacoes.png")
	                   .attr("cx", 0)
	                   .attr("cy", 0)
	                   .attr("height", 252)
	                   .attr("width", 252);

	// Nível do Rio

	var 
		levelPie = d3.layout.pie()
						.value(function (d){ return d.value; })
						.startAngle(startAngle)
						.sort(function(a,b){return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;})
						.endAngle(endAngle);


		/**/levelSecondPie = d3.layout.pie()
						.value(function (d){ return d.value; })
						.startAngle(startAngle)
						.sort(function(a,b){return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;})
						.endAngle(endAngle);


	var levelArcs = levelCanvas.selectAll(".arc")
					.data(levelPie(riverData, [start_date,end_date]))
					.enter()
					.append("g")
					.attr("class", "arc")
					      .on("mouseover", mouseover3);


    levelArcs.append("path")
        .attr("d", levelArc)
        .attr("fill", function(d){ 
        	return levelToColor(d.data.nivel); 
        })
        .attr("stroke", "#FFF")
        .attr("stroke-width",1)
        .attr("stroke-opacity",0.2);

	levelCanvas.append("g")
			.attr("class", "secondArc")
        	d3.selectAll(".secondArc").selectAll(".arc")
			.data(levelSecondPie(riverData, [start_date,end_date]))
				.enter()
				.append("g")
				.attr("class", "secondArcHolder");

    d3.selectAll(".secondArcHolder").append("path")
        	.attr("d", levelSecondArc)
        	.attr("fill", "#FFF");/**/


	// Pluviometria

	var rainArcs = rainCanvas.selectAll(".arc")
					.data(riverPie(riverData))
					.enter()
					.append("g")
					.attr("class", "arc")
					      .on("mouseover", mouseover2);


    rainArcs.append("path")
        .attr("d", rainArc)
        .attr("fill", function(d){ 
        	return rainToColor(d.data.pluviometria); 
        });


	// River Tooltips

	// Phases

	var phaseArcs = d3.svg.arc()
		.startAngle(function(d){ return dateToRadians(d.start); })
		.endAngle(function(d){ return dateToRadians(d.end, true);})
		.innerRadius(radius - 42)
		.outerRadius(radius - 27)


	var phasesArcs = phasesCanvas.selectAll(".arc")
					.data(phasesData)
					.enter()
					.append("g")
					.attr("class", "arc");


    phasesArcs.append("path")
        .attr("d", phaseArcs)
        .attr("id", function(d) { return d.uname;})
        .attr("class", function(d) { return "phasearc " + d.uname;})
        .attr("title", function(d) { return d.name;})//;
        .attr( 'filter', 'url(#dropshadow)' ); /* !!! important - set id of predefined filter*/

	phasesCanvas.selectAll(".arc")
      .on("mouseover", mouseover);

	// Add the mouseleave handler to the bounding circle.
  	d3.selectAll(".arc").on("mouseleave", mouseleave);

	function mouseover(d) {

	  var phasestip = '<tspan class="phase-dates">' + moment(d.start).format('DD-MM-YYYY') + " - " + moment(d.end).format('DD-MM-YYYY') + '</tspan><tspan class="phase-name tukano ' + d.uname + '">' + d.name + '</tspan>';

	  d3.select("#tooltip")
	  	  .attr("text-anchor","end")
	  	  .attr("class","phasetip")
	      .html(phasestip);

	  d3.select("#explanation")
	      .style("visibility", "");
	}

	function mouseover2(d) {

	  var leveltip = '<tspan class="tukano tip-fase">' + d.data.fases + '</tspan><tspan class="tip-year">' + moment(d.data.date).format('YYYY') + '</tspan><tspan class="tip-date">' + moment(d.data.date).format('MMM, DD') + '</tspan><tspan class="tip-week">' + moment(d.data.date).format('ddd') + '</tspan><tspan class="tip-level">Nível do rio (cm): </tspan><tspan class="results">' + d.data.nivel + '</tspan><tspan class="tip-rain">Pluviometria: </tspan><tspan class="results">' + d.data.pluviometria + '</tspan>';

	  d3.select("#tooltip")
	  	  .attr("text-anchor","end")
	      .html(leveltip);

	  d3.select("#explanation")
	      .style("visibility", "");

	  d3.select(".levelAxis")
	      .style("opacity", "1");

	}

	function mouseover3(d) {

	  var raintip = '<tspan class="tukano tip-fase">' + d.data.fases + '</tspan><tspan class="tip-year">' + moment(d.data.date).format('YYYY') + '</tspan><tspan class="tip-date">' + moment(d.data.date).format('MMM, DD') + '</tspan><tspan class="tip-week">' + moment(d.data.date).format('ddd') + '</tspan><tspan class="tip-level">Nível do rio (cm): </tspan><tspan class="results">' + d.data.nivel + '</tspan><tspan class="tip-rain">Pluviometria: </tspan><tspan class="results">' + d.data.pluviometria + '</tspan>';

	  d3.select("#tooltip")
	  	  .attr("text-anchor","end")
	      .html(raintip);

	  d3.select("#explanation")
	      .style("visibility", "");

	  d3.select(".rainAxis")
	      .style("opacity", "1");

	}

	function mouseleave(d) {
	  d3.select("#explanation")
	      .style("visibility", "hidden");

	  d3.select(".rainAxis")
	      .style("opacity", "0.3");

	  d3.select(".levelAxis")
	      .style("opacity", "0.3");

	}

	// Months

	function generateMonthsArc(){

		var months = [];

		start = start_date;

		do {
			end = moment(start).endOf('month').format('YYYY-MM-DD');
			name = moment(start).format('MMM');
			months.push({
				start: start,
				end: end, 
				name: name,
				startAngle: dateToRadians(start),
				endAngle: dateToRadians(end, true)
			});
			start = moment(start).add(1, 'month').startOf('month').format('YYYY-MM-DD');
		} while (start < end_date);

		var monthArcs = d3.svg.arc()
			.startAngle(function(d){return d.startAngle})
			.endAngle(function(d){return d.endAngle})
			.innerRadius(radius - 213)
			.outerRadius(radius - 190)


		var monthsArcs = monthsCanvas.selectAll(".arc")
						.data(months)
						.enter()
						.append("g")
						.attr("class", "arc");


	    monthsArcs.append("path")
	        .attr("d", monthArcs)
	        .attr("fill", "rgba(206,206,206,0.9)")
	        .attr("stroke","#FFF")
	        .attr("stroke-width",2)
	        .attr("id", function (d) { return d.name});
	}

	generateMonthsArc();

	var label = monthsCanvas.selectAll(".arc").append('text')
	    .style('font-size', '10px')
	    .style('color', '#FFF')
	    .style('text-shadow','0px 0px 2px rgba(0,0,0,0.5)')	    
	    .attr('dx', [startAngle + 7])
	    .attr('dy', 15);


	label.append('textPath')
	    .attr('xlink:href', function(d) { return '#' + d.name;})
	    .attr("class", "label")
	    .style('fill', '#FFF')
	    .text(function(d) {
	        return d.name;
	    });

	d3.select(".legends").append("g")
    .attr("class", "date-box")
    .style("height","60px")
    .attr("transform", "translate(10,40)")
  	/*.append("text")
			.attr("x", 0)
            .attr("y", 0)
            .attr("class","ciclo-anual")
            .text( function(d) { return moment(start_date).format('YYYY') + "-" + moment(end_date).format('YYYY'); })*/;

	d3.select(".date-box").append("g")
	.attr("class","dates")
    .attr("height","60px")
	/*.append("g")
           .attr("transform", "translate(385,-35)")
		   .attr("class", "separator")
		   .append("svg:image")
           .attr("xlink:href", "img/separator.png")
           .attr("cx", 0)
           .attr("cy", 0)
           .attr("height", 35)
           .attr("width", 60)*/;

	d3.select(".dates").append("text")
    .attr("class", "dates-end")
    .attr("transform", "translate(330,-26)")
			.attr("x", 0)
            .attr("y", 0)
            .html( function(d) { return moment(end_date).format('DD-MM-YYYY') });

	d3.select(".dates").append("text")
    .attr("class", "dates-start")
    .attr("transform", "translate(455,-26)")
			.attr("x", 0)
            .attr("y", 0)
            .html( function(d) { return moment(start_date).format('DD-MM-YYYY') });



	d3.select("#explanation").append("div")
			    .attr("id","tooltip");



    var levelAxis = d3.svg.axis()
    	.scale(levelToAxis)
      	.orient("left")
		.ticks(20)
    	.tickSize(1)
    	.tickFormat(d3.format(""));

    var rainAxis = d3.svg.axis()
    	.scale(rainToAxis)
    	.orient("right")
    	.ticks(20)
    	.tickSize(1)
    	.tickFormat(d3.format(""));

	var gradientLevel = d3.select(".legends").append("svg:defs")
	  .append("svg:linearGradient")
	    .attr("id", "gradientLevel")
	    .attr("x2", "0%")
	    .attr("x1", "0%")
	    .attr("y2", "0%")
	    .attr("y1", "100%")
	    .attr("spreadMethod", "pad");
	 
	gradientLevel.append("svg:stop")
	    .attr("offset", "0%")
	    .attr("stop-color", startColorLevel)
	    .attr("stop-opacity", 1);
	 
	gradientLevel.append("svg:stop")
	    .attr("offset", "100%")
	    .attr("stop-color", endColorLevel)
	    .attr("stop-opacity", 1);

	var gradientRain = d3.select(".legends").append("svg:defs")
	  .append("svg:linearGradient")
	    .attr("id", "gradientRain")
	    .attr("x2", "0%")
	    .attr("x1", "0%")
	    .attr("y2", "0%")
	    .attr("y1", "100%")
	    .attr("spreadMethod", "pad");
	 
	gradientRain.append("svg:stop")
	    .attr("offset", "0%")
	    .attr("stop-color", startColorRain)
	    .attr("stop-opacity", 1);
	 
	gradientRain.append("svg:stop")
	    .attr("offset", "100%")
	    .attr("stop-color", endColorRain)
	    .attr("stop-opacity", 1);

	/*gradientBrilho.append("svg:stop")
		.attr()*/

	d3.select(".legends").append("g")
    .attr("class", "axis-box")
    .attr("transform", "translate(52,135)")
  	.append("g")
  	.attr("class","rainAxis")
  	.style("opacity","0.75")
    .call(levelAxis);
  	
  	d3.select(".rainAxis")
  	.append("rect")
  	.attr("height", 400)
    .attr("width", 7)
    .attr("transform","translate(1,0)")
    .style("fill", "url(#gradientLevel)");

	d3.select(".axis-box").append("g")
  	.attr("class","levelAxis")
    .attr("transform", "translate(742,0)")
  	.style("opacity","0.75")
  	.append("g")
    .call(rainAxis);

  	d3.select(".levelAxis")
  	.append("rect")
  	.attr("height", 400)
    .attr("width", 7)
    .attr("transform","translate(-8,0)")
    .style("fill", "url(#gradientRain)");

    d3.select(".legends").append("g")
    .attr("class", "legend-disc")
    .attr("transform", "translate(57,621)")
  	.append("circle")
  	.attr("class","const-arc-leg")
  	.attr("r",10)
  	.attr("cx",0)
  	.attr("cy",0)
  	.on("mouseover", function() { d3.select(".txt-const").style("opacity",1)})
  	.on("mouseleave", function() { d3.select(".txt-const").style("opacity",0)});

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

var legenddisc = d3.select(".legend-disc"); 

    legenddisc.append("path")
  	.attr("d",gregArcLeg)
  	.attr("class","greg-arc-leg")
    .on("mouseover", function() { legenddisc.select('text[class="txt-greg"]').style("opacity",1)})
  	.on("mouseleave", function() { legenddisc.select('text[class="txt-greg"]').style("opacity",0)});

    legenddisc.append("path")
  	.attr("d",levelArcLeg)
  	.attr("class","level-arc-leg")
    .on("mouseover", function() { legenddisc.select('text[class="txt-level"]').style("opacity",1)})
  	.on("mouseleave", function() { legenddisc.select('text[class="txt-level"]').style("opacity",0)});

    legenddisc.append("path")
  	.attr("d",rainArcLeg)
  	.attr("class","rain-arc-leg")
    .on("mouseover", function() { legenddisc.select('text[class="txt-rain"]').style("opacity",1)})
  	.on("mouseleave", function() { legenddisc.select('text[class="txt-rain"]').style("opacity",0)});

    legenddisc.append("path")
  	.attr("d",phasesArcLeg)
  	.attr("class","phases-arc-leg")
    .on("mouseover", function() { legenddisc.select('text[class="txt-phases"]').style("opacity",1)})
  	.on("mouseleave", function() { legenddisc.select('text[class="txt-phases"]').style("opacity",0)});

  	legenddisc.append("text").attr("class","txt-const")
  	.text("Constelações Tukano");

  	legenddisc.append("text").attr("class","txt-greg")
  	.text("Calendário gregoriano");

  	legenddisc.append("text").attr("class","txt-level")
  	.text("Nível do rio (cm3)");

  	legenddisc.append("text").attr("class","txt-rain")
  	.text("Pluviometria (mm)");

  	legenddisc.append("text").attr("class","txt-phases")
  	.text("Estações do ano");

  	legenddisc.selectAll("text")
  	.attr("x",50)
  	.attr("y",5);


    d3.select(".sky").append("g")
    .attr("class", "constelations")
    .attr("transform", "translate(0,0)");

    var constelations = d3.select(".constelations");

    constelations.append("g").attr("class","01-const");
    constelations.append("g").attr("class","02-const");
    constelations.append("g").attr("class","03-const");
    constelations.append("g").attr("class","04-const");
    constelations.append("g").attr("class","05-const");
    constelations.append("g").attr("class","06-const");
    constelations.append("g").attr("class","07-const");
    constelations.append("g").attr("class","08-const");
    constelations.append("g").attr("class","09-const");
    constelations.append("g").attr("class","10-const");
    constelations.append("g").attr("class","11-const");
    constelations.append("g").attr("class","12-const");

	var const01 = d3.selectAll('g[class="01-const"]');
	var const02 = d3.selectAll('g[class="02-const"]');
	var const03 = d3.selectAll('g[class="03-const"]');
	var const04 = d3.selectAll('g[class="04-const"]');
	var const05 = d3.selectAll('g[class="05-const"]');
	var const06 = d3.selectAll('g[class="06-const"]');
	var const07 = d3.selectAll('g[class="07-const"]');
	var const08 = d3.selectAll('g[class="08-const"]');
	var const09 = d3.selectAll('g[class="09-const"]');
	var const10 = d3.selectAll('g[class="10-const"]');
	var const11 = d3.selectAll('g[class="11-const"]');
	var const12 = d3.selectAll('g[class="12-const"]');


constelations.append("circle")
  	.attr("class","t-01-const")
  	.attr("r",26)
  	.attr("cx",190)
  	.attr("cy",58)
  	.on("mouseover", function() { const01.style("opacity",1); })
  	.on("mouseleave", function() { const01.style("opacity",0); });

constelations.append("circle")
  	.attr("class","t-02-const")
  	.attr("r",10)
  	.attr("cx",212)
  	.attr("cy",118)
  	.on("mouseover", function() { const02.style("opacity",1); })
  	.on("mouseleave", function() { const02.style("opacity",0); });

constelations.append("circle")
  	.attr("class","t-03-const")
  	.attr("r",10)
  	.attr("cx",210)
  	.attr("cy",150)
  	.on("mouseover", function() { const03.style("opacity",1); })
  	.on("mouseleave", function() { const03.style("opacity",0); });

constelations.append("circle")
  	.attr("class","t-04-const")
  	.attr("r",8)
  	.attr("cx",185)
  	.attr("cy",178)
  	.on("mouseover", function() { const04.style("opacity",1); })
  	.on("mouseleave", function() { const04.style("opacity",0); });

constelations.append("circle")
  	.attr("class","t-05-const")
  	.attr("r",12)
  	.attr("cx",190)
  	.attr("cy",203)
  	.on("mouseover", function() { const05.style("opacity",1); })
  	.on("mouseleave", function() { const05.style("opacity",0); });

constelations.append("circle")
  	.attr("class","t-06-const")
  	.attr("r",22)
  	.attr("cx",132)
  	.attr("cy",200)
  	.on("mouseover", function() { const06.style("opacity",1); })
  	.on("mouseleave", function() { const06.style("opacity",0); });

constelations.append("circle")
  	.attr("class","t-07-const")
  	.attr("r",5)
  	.attr("cx",97)
  	.attr("cy",223)
  	.on("mouseover", function() { const07.style("opacity",1); })
  	.on("mouseleave", function() { const07.style("opacity",0); });

constelations.append("circle")
  	.attr("class","t-08-const")
  	.attr("r",10)
  	.attr("cx",78)
  	.attr("cy",217)
  	.on("mouseover", function() { const08.style("opacity",1); })
  	.on("mouseleave", function() { const08.style("opacity",0); });

constelations.append("circle")
  	.attr("class","t-09-const")
  	.attr("r",20)
  	.attr("cx",46)
  	.attr("cy",175)
  	.on("mouseover", function() { const09.style("opacity",1); })
  	.on("mouseleave", function() { const09.style("opacity",0); });

constelations.append("circle")
  	.attr("class","t-10-const")
  	.attr("r",20)
  	.attr("cx",40)
  	.attr("cy",107)
  	.on("mouseover", function() { const10.style("opacity",1); })
  	.on("mouseleave", function() { const10.style("opacity",0); });

constelations.append("circle")
  	.attr("class","t-11-const")
  	.attr("r",12)
  	.attr("cx",58)
  	.attr("cy",58)
  	.on("mouseover", function() { const11.style("opacity",1); })
  	.on("mouseleave", function() { const11.style("opacity",0); });

constelations.append("circle")
  	.attr("class","t-12-const")
  	.attr("r",24)
  	.attr("cx",103)
  	.attr("cy",70)
  	.on("mouseover", function() { const12.style("opacity",1); })
  	.on("mouseleave", function() { const12.style("opacity",0); });

	   const01.append("text")
        .text('Anã')
	   const01.append('text')
	    .attr("class","trad-const")
        .text('Jararaca')
	   const01.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/01-const.png");

	   const02.append("text")
        .text('Pamõ')
	   const02.append('text')
	    .attr("class","trad-const")
        .text('Tatu')
	   const02.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/02-const.png");

	   const03.append("text")
        .text('Pamõ Oãduhka')
	   const03.append('text')
	    .attr("class","trad-const")
        .text('Osso do tatu')
	   const03.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/03-const.png");

 	   const04.append("text")
        .text('Muha')
	   const04.append('text')
	    .attr("class","trad-const")
        .text('Jacundá')
	   const04.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/04-const.png");

	   const05.append("text")
        .text('Dahsiu')
	   const05.append('text')
	    .attr("class","trad-const")
        .text('Camarão')
	   const05.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/05-const.png");

	   const06.append("text")
        .text('Yai')
	   const06.append('text')
	    .attr("class","trad-const")
        .text('Onça')
	   const06.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/06-const.png");

	   const07.append("text")
        .text('Conjunto de Estrelas')
	   const07.append('text')
	    .attr("class","trad-const")
        .text('Plêiades')
	   const07.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/07-const.png");

	   const08.append("text")
        .text('Wai Kahsa')
	   const08.append('text')
	    .attr("class","trad-const")
        .text('Moquém')
	   const08.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/08-const.png");

	   const09.append("text")
        .text('Sio Yahpu')
	   const09.append('text')
	    .attr("class","trad-const")
        .text('Cabo do enxó')
	   const09.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/09-const.png");

	   const10.append("text")
        .text('Yhe')
	   const10.append('text')
	    .attr("class","trad-const")
        .text('Garça')
	   const10.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/10-const.png");

	   const11.append("text")
        .text('Yurara')
	   const11.append('text')
	    .attr("class","trad-const")
        .text('Tartaruga')
	   const11.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/11-const.png");

	   const12.append("text")
        .text('Sio Yahpu')
	   const12.append('text')
	    .attr("class","trad-const")
        .text('Jararaca')
	   const12.append("svg:image")
	   .attr("class","thumb")
       .attr("xlink:href", "img/12-const.png");

    constelations.selectAll("circle")
           //.style("opacity",0.2)
           .style("fill","url(#brilho)")
           //.append("svg:image")
       	   //.attr("xlink:href", "img/brilho.png")
		   .attr("transform", "translate(0,0)")
       	   .style("opacity",0.3);
           //.on("mouseenter", function() { return this.style("opacity",0.6) });

    constelations.selectAll("text")
           .attr("text-anchor","end")
           .attr("x",455)
           .attr("y",420);

    constelations.selectAll(".trad-const")
           .attr('y', 400);

    constelations.selectAll("g")
           .style("opacity",0);

    constelations.selectAll('image[class="thumb"]')
           .attr("height", 70)
           .attr("width", 70)
		   .attr("transform", "translate(461,371)");

}


// RUN VISUALIZATION

loadRiverData(function(){
	loadPhasesData(function(){
		initCanvas();
	})
})


$(document).ready(function(){
	$('a[href="#2005"]').click(function(){
		$(this).unbind("mouseenter mouseleave");
		//$('.menu').style("height","60px");
		$('.menu li a').removeAttr("class");
		$(this).attr("class","active");
		$('#viz').empty();
		start_date = '2005-11-17';
		end_date = '2006-10-31';
		loadRiverData(function(){
			loadPhasesData(function(){
				initCanvas();
			})
		})
	});	

	$('a[href="#2006"]').click(function(){
		$(this).unbind("mouseenter mouseleave");
		//$('.menu').style("height","60px");
		$('.menu li a').removeAttr("class");
		$(this).attr("class","active");
		$('#viz').empty();
		start_date = '2006-11-01';
		end_date = '2007-11-16';
		loadRiverData(function(){
			loadPhasesData(function(){
				initCanvas();
			})
		})
	});

	$('a[href="#2007"]').click(function(){
		$(this).unbind("mouseenter mouseleave");
		//$('.menu').style("height","60px");
		$('.menu li a').removeAttr("class");
		$(this).attr("class","active");
		$('#viz').empty();
		start_date = '2007-11-17';
		end_date = '2008-10-31';
		loadRiverData(function(){
			loadPhasesData(function(){
				initCanvas();
			})
		})
	});
});