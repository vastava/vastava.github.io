var fullMargin = {top: 30, right: 30, bottom: 30, left: 30},
    fullHeight = 764 
	// - fullMargin.left - fullMargin.right,
    fullWidth = (1000 - fullMargin.top - fullMargin.bottom);

// append the canoneventline object to the body of the page
var svg = d3.select("#events_full_timeline")
  .append("svg")
    .attr("width", fullWidth + fullMargin.left + fullMargin.right)
    .attr("height", fullHeight + fullMargin.top + fullMargin.bottom)
    .style("margin", "30px")
  .append("g")
    .attr("transform",
          "translate(" + fullMargin.left + "," + fullMargin.top + ")");

var container = d3.select("#events_full_timeline")
    .append("div")
        .attr("width", fullWidth)
        .attr("height", fullHeight)    
    .attr("id", "myContainer")
    .style("position", "absolute")
    .style("margin-right", "auto")
    .style("top", function(d) { return fullMargin.top + "px"; })
    .style("left", function(d) { return fullMargin.left + "px"; })

//Build checkboxes
var filter_list = ["Original Trilogy", "Prequel Trilogy", "Sequel Trilogy", "Anthology Films", "The Clone Wars", "The Mandalorian", "Rebels", "Resistance", "Extended Universe"]

var swcolors_media = ["#78ED74", "#A43837", "#E0AA5A", "#70318F" , "#EEF0F1", "#5F91CA", "#EF7219", "#8CDBE2", "#CC88D3"]
var media_color = d3.scaleOrdinal()
		 .domain(filter_list)
		 .range(swcolors_media)

// d3.select("#filter")
//     .selectAll("input")
//     .data(filter_list)
//     .enter()
//     .append("label")
//     .attr("class", "switch")
//     .append("input")
//     .attr("type", "checkbox")
//     .attr("class", "filter-check")
//     .property("checked", true)
//     .attr("value", function (d) {
//         return d
//     })
//     .attr("id", function (d) {
//         return d
//     });

// var spans = d3.selectAll("label")
//     .data(filter_list)
//     // .attr("class", "checkbox")	    	    
//     .append("span")
//     .attr("class", "saber-switch")
//     .attr("id", function(d, i) { return d.split(' ').join('_') +"sabers"; })
//     // .data([1,2])
//     // .enter()
//     // .append("span")
//     // .attr("class", "bar")

// spans.append("span")
// 	.attr("class", "bar")
// 	.style("border-right-color", function(d) {
// 		return media_color(d);
// 	})
// 	.style("box-shadow", function(d) {
// 		return "0.4em 0 0.6em 0.1em " + media_color(d);
// 	})

// spans.append("span")
// 	.attr("class", "bar")
// 	.style("border-right-color", function(d) {
// 		return media_color(d);
// 	})
// 	.style("box-shadow", function(d) {
// 		return "0.4em 0 0.6em 0.1em " + media_color(d);
// 	})

// d3.selectAll("label")
//     .data(filter_list)
//     // .attr("class", "checkbox")	    	    
//     .append("text")
//     .attr("class", "text-label")
//     .text(function (d) {
//         return d
//     })
//     .style('color', function(d) {
//     	return media_color(d)
//     })
    // .style('color', "black")    

var formatDate = d=> d < 0 ? `${d3.format(",")(-d)} BBY` : `${d}`
//unnecessary
var num_cols = 5;

function loadTimeline(choices, filter) {
	d3.csv("starwars_src_cleaned_v2_copy.csv", function(data) {
		d3.selectAll(".rect-event").remove();
		d3.select("#vline").remove();
		d3.selectAll(".svg-label").remove()

		data = data.sort(function(a,b) {return a.yr_cleaned - b.yr_cleaned});
		var years = d3.set(data.map(function(d) {return d.yr_cleaned})).values();
		// years.push(2024)
		years.sort(function(a, b) {
			return b - a;
		});			
		console.log(years)
		//append 2024 to years
		// years.push(2024)
		// var sz = (fullHeight - fullMargin.bottom - fullMargin.top)/years.length;        
        var sz = (fullWidth - fullMargin.left - fullMargin.right)/years.length;
		var szh = (fullHeight - fullMargin.bottom - fullMargin.top)/years.length;
        console.log(sz)
        var spacing = 1.8;
		//master color scheme for eras
		var swcolors_master = ["#A1A333", "#D5BE78", "#EFAF82", "#E7250A", "#9E5B60", "#0E5AA1", "#5FA0DE", "#453110", "#FBFFFE", "#3D5E78", "#D8DA8E", "#0C9198", "#353E9F", "#027693", "#A7281C", "#FBA411", "#0387E9", "#F26C28", "#BFAB87", "#5AC2F1", "#E7250A", "#1D652F", "#8A2239", "#32E6AC", "#AF639E", "#343D9D"]

		var color;
		//nest data by era
		if (filter == "era_cleaned") {
			var sumstat = d3.nest()
				.key(function(d) { return d.era;})
				.entries(data);

			var eras = sumstat.map(function(d){return d.key});    

			color = d3.scaleOrdinal()
					.domain(eras)
					.range(swcolors_master)	
		}	
		else {
			color = media_color
		}

		if (choices.length > 0) {
		    data = data.filter(function (d, i) {
		    	return choices.indexOf(d["source_cleaned"]) >= 0;
		        // return _.includes(decodeURIComponent(choices), d["source_cleaned"]);
		    });
		} else {
		    data = csv; // so that no boxes checked shows all data
		}	

		// var years = d3.set(data.map(function(d) {return d.yr_cleaned})).values();

	

		var y = d3.scaleBand()
			.domain(years)
			.range([0, fullHeight - fullMargin.top - fullMargin.bottom])

		var x = d3.scaleLinear()
			.domain([-d3.max(data, function(d) { return +d["y-key"]; }), d3.max(data, function(d) { return +d["y-key"]; })])
			.range([0, fullWidth - fullMargin.left - fullMargin.right])

		var yr_cleanedDate = d3.min(data, function(d) { return +d.yr_cleaned; });
		var endDate = d3.max(data, function(d) { return +d.yr_cleaned; });
		var num_days = (endDate)- (yr_cleanedDate)
		var w_axis = x(endDate)-x(yr_cleanedDate)


	    // var movieData = []

	    // movieData[0] = {"yr_cleaned": -32, "end": -19, "section": 2, "text": "Prequel Trilogy", "text_x": -25}
	    // movieData[1] = {"yr_cleaned": 0, "end": 4, "section": 3, "text": "Original Trilogy", "text_x": 0}
	    // movieData[2] = {"yr_cleaned": 34, "end": 35, "section": 3, "text": "Sequel Trilogy", "text_x": 34}	
	    
	    // svg.selectAll(".myRects")
	    // 	.data(movieData)
	    // 	.enter()
	    // 	.append("rect")
	    // 	.attr("class", "movie-rect")
	    // 	.attr("x", 0)
	    // 	.attr("y", function(d) {return y(d.yr_cleaned)})		
	    // 	.attr("width", fullWidth)
	    // 	.attr("height", function(d) {return y(d.end) - y(d.yr_cleaned)})
	    // 	.style("fill", function(d) {
	    // 		if (d.text != "Sequel Trilogy") {
	    // 			return media_color(d.text);
	    // 		}
	    // 		return "yellow";
	    // 	})
	    // 	.style("fill-opacity", 0.33)

	    // svg.selectAll(".myLabels")
	    // 	.data(movieData)
	    // 	.enter()
	    // 	.append("text")
	    // 	.attr("class", "movie-rect")
	    // 	.attr("x", 0+5)
	    // 	.attr("y", function(d) {return y(d.yr_cleaned)-5})		
	    // 	.text(function(d) {return d.text});

		var yrs = []
		var events = ["okokok", "lalala", "hahahah"]	

		yrs = yrs.map( function(x, i) { return {"year": x, "event": events[i]}});

		var yrs_canon = [];
		var events_canon = ["mymymy"];

		yrs_canon = yrs_canon.map( function(x, i) { return {"year": x, "event": events_canon[i]}});

		console.log(years)
		console.log(yrs)
		console.log(yrs.filter(function(d) {return years.includes(d.year.toString())}))

		//Canon annotations 	

		svg.selectAll(".annotation")
			.data(yrs.filter(function(d) {return years.includes(d.year.toString())}))
			.enter()
			.append("line")
			.attr("class", "svg-label")
		 	.attr("x1", x(0) + sz*2)
		 	.attr("x2", x(0) + 300)  
		 	.attr("z-index", 0)
		 	.attr("y1", function(d) {return y(d.year) + sz*spacing/4})
		 	.attr("y2", function(d) {return y(d.year) + sz*spacing/4})
		 	.attr("stroke", "black")
		 	.attr("stroke-width", 1)

		svg.selectAll(".annotation")
			.data(yrs.filter(function(d) {return years.includes(d.year.toString())}))
			.enter()
			.append("text")
			.attr("class", "svg-label")
		 	.attr("x", x(0) + sz*2)
		 	.attr("x", x(0) + 300)  
		 	.attr("y", function(d) {return y(d.year) + sz*spacing/4})
		 	.text(function(d) {return d.event})	
		 	.attr("text-anchor", "end") 
		 	.attr("alignment-baseline", "hanging")	
		 	.style("font-weight", "lighter")	

		svg.selectAll(".annotation")
			.data(yrs.filter(function(d) {return years.includes(d.year.toString())}))
			.enter()
			.append("text")
			.attr("class", "svg-label")
		 	.attr("x", x(0) + sz*2)
		 	.attr("x", x(0) + 300)  
		 	// .attr("y", y(-13000000000)+sz*spacing/4 - 5)
		 	.attr("y", function(d) {return y(d.year) + sz*spacing/4 - 5})
		 	.text(function(d) {return formatDate(d.year)})
		 	.attr("text-anchor", "end") 
		 	// .attr("alignment-baseline", "hanging")	
		 	.style("font-weight", "lighter")
		svg.selectAll(".annotation")
			.data(yrs_canon.filter(function(d) {return years.includes(d.year.toString())}))
			.enter()
			.append("line")
			.attr("class", "svg-label")
		 	.attr("x1", x(0) - sz*2)
		 	.attr("x2", x(0) - 300)  
		 	// .attr("y1", y(-13000000000)+sz*spacing/4)
		 	.attr("y1", function(d) {return y(d.year) + sz*spacing/4})
		 	// .attr("y2", y(-13000000000)+sz*spacing/4)
		 	.attr("y2", function(d) {return y(d.year) + sz*spacing/4})
		 	.attr("stroke", "black")
		 	.attr("stroke-width", 1)

		svg.selectAll(".annotation")
			.data(yrs_canon.filter(function(d) {return years.includes(d.year.toString())}))
			.enter()
			.append("text")
			.attr("class", "svg-label")
		 	.attr("x", x(0) - sz*2)
		 	.attr("x", x(0) - 300)  
		 	// .attr("y", y(-13000000000)+sz*spacing/4)
		 	.attr("y", function(d) {return y(d.year) + sz*spacing/4})
		 	.text(function(d) {return d.event})	
		 	.attr("text-anchor", "yr_cleaned") 
		 	.attr("alignment-baseline", "hanging")	
		 	.style("font-weight", "lighter")	

		svg.selectAll(".annotation")
			.data(yrs_canon.filter(function(d) {return years.includes(d.year.toString())}))
			.enter()
			.append("text")
			.attr("class", "svg-label")
		 	.attr("x", x(0) - sz*2)
		 	.attr("x", x(0) - 300)  
		 	// .attr("y", y(-13000000000)+sz*spacing/4 - 5)
		 	.attr("y", function(d) {return y(d.year) + sz*spacing/4 - 5})
		 	.text(function(d) {return formatDate(d.year)})
		 	.attr("text-anchor", "yr_cleaned") 
		 	// .attr("alignment-baseline", "hanging")	
		 	.style("font-weight", "lighter")	

		svg.append("line")
			 .attr("id", "vline")
			  .attr("x1", x(0) + sz/(spacing*2))
			  .attr("x2", x(0) + sz/(spacing*2))  
			  .attr("y1", 0)
			  .attr("y2", fullHeight - fullMargin.top - fullMargin.bottom) 
			  .attr("stroke", "black")
			  .attr("stroke-width", 1)	
			  .attr("tranform", "translate(" + sz + "," + sz + ")")
 
		 svg.append("line")
			  .attr("x1", x(0) - 30 + sz/(spacing*2))
			  .attr("x2", x(0) + 30 + sz/(spacing*2))  
			  .attr("y1", 0 - 5)
			  .attr("y2", 0 - 5) 
			  .attr("stroke", "black")
			  .attr("stroke-width", 1)	
			  // .attr("tranform", "translate(" + sz/2 + "," + -sz + ")")		 	
 
 
		 svg.append("line")
			  .attr("x1", x(0) - 30 + sz/(spacing*2))
			  .attr("x2", x(0) + 30 + sz/(spacing*2))  
			  .attr("y1", fullHeight - fullMargin.top - fullMargin.bottom + 5)
			  .attr("y2", fullHeight - fullMargin.top - fullMargin.bottom + 5)
			  .attr("stroke", "black")
			  .attr("stroke-width", 1)	

		//horizontal dashed line	  
		svg.append("line")
			  .attr("x1", x(-1))
			  .attr("x2", x(0))  
			  .attr("y1",y(2023) + szh/3)
			  .attr("y2", y(2023) + szh/3)
			  .attr("stroke", "black")
			  .attr("stroke-width", 1)	
			  .attr("stroke-dasharray", ("1, 3"))			
			  
		svg.append("line")
			  .attr("x1", x(0) + sz/(spacing*2))
			  .attr("x2", x(3))  
			  .attr("y1",y(2023) + szh/12)
			  .attr("y2", y(2023) + szh/12)
			  .attr("stroke", "black")
			  .attr("stroke-width", 1)	
			  .attr("stroke-dasharray", ("1, 3"))					  

		svg.selectAll(".label")
			.data(years)
			.enter()
			.append("rect")
			.attr("class", "svg-label")
			.attr("x", x(0) + 30)	
			// .attr("y", function(d) {return y(d) + sz/(spacing*2) - 15})
			.attr("y", function(d) {return y(d) + szh/2 - 17})
			.attr("width", "30px")
			.attr("height", "23px")
			// .style("font-weight", "lighter")
			.style("fill", "white")
			// .style("stroke", "white") 
			// .style("stroke-width", "0.5px")		
			.style("z-index", 20)				  

		svg.selectAll(".label")
			.data(years)
			.enter()
			.append("text")
			.attr("class", "svg-label")
			.attr("x", x(0) + 30)	
			// .attr("y", function(d) {return y(d) + sz/(spacing*2)})
			.attr("y", function(d) {return y(d) + szh/2})
			.text(function(d) {return formatDate(d)})
			.attr("text-anchor", "start") 
			// .style("font-weight", "lighter")
			.style("fill", "black")
			// .style("stroke", "white") 
			// .style("stroke-width", "0.5px")		
			.style("z-index", 1000)				

	 	
	  	// var sz = (fullHeight - fullMargin.bottom - fullMargin.top)/years.length;

	  	//width calc height calc
	  	//console.log(d3.max(data, function(d) { return +d["y-key"]})*sz + fullMargin.left + fullMargin.right)
          console.log("height", d3.max(data, function(d) { return +d["y-key"]})*sz + fullMargin.top + fullMargin.bottom)

		var tip = d3.tip()
		 .attr('class', 'd3-tip')
		 .offset(d => [-10, 0])
		 .html(function(d) {
		  // console.log(d);
		   return "<div>" +
		           "<span style='color:black; font-weight:600'>" + formatDate(d.yr_cleaned) + "</span>" +
		           // "<span style='color:black; font-weight:600'>" + d.yr_cleaned + "</span>"  +
		           "<span style='color:" + color(d.era) + "; font-weight:600'> (" + d.era + ")</span><br/>" +
		           "<span style='color:black'>" + d.event_cleaned + "</span><br/><br/>" +
		           "<span style='color:black'>Source Text: " + d.source_text + "</span><br/>"
		           "</div>"
		 })
		svg.call(tip)	  

		// svg.selectAll(".svgRect")
		//  .data(data)
		//  .enter()
		//  .append("rect")
		//  .attr("class", "rect-event")
		//  .attr("x", function(d, i) {
		// 		let w = sz/(spacing*4);
		// 		if (+d["anno_flag"] == 1) {
		// 			w -= sz/2;
		// 		}
		// 		if (+d["sub-key"] <= 0) {	 			
        //             return x(Math.floor((+d["sub-key"]))) + w;
		//  		}
		//  		else {
		//  			return x(Math.floor((+d["sub-key"]))) - w;
		//  		}
		//  })
		//  .attr("y", function(d, i) {
		//  		return y(d["yr_cleaned"])
		//  })
		//  .attr("width", sz/spacing)
		//  .attr("height", sz/spacing)
		//  .attr("z-index", 10)
		//  // .attr("height", y.bandwidth()*.8)
		//  .style("fill", function(d) {
		//  	if (false) {		
        //         //put code here? 		
		//  		// return color(d.era)
        //          return "url(#pattern-" + "/img/allergies.png" + ")";
		//  	}
		//  	else {
		//  		return "white"
		//  	}
		//  })

		var containers = container.selectAll(".divContainers")
		 .data(data)
		 .enter()
		 .append("div")
		 .attr("class", "container-event")
         .style("position", "absolute")
		 .style("left", function(d, i) {
				if (+d["sub-key"] <= 0) {	
                    let w = x(Math.floor((+d["sub-key"]))) + sz/(spacing*4) + fullMargin.left; 			
                    return w + 'px';
		 		}
		 		else {
                    let w = x(Math.floor((+d["sub-key"]))) - sz/(spacing*4) + fullMargin.left;
		 			return w + 'px';
		 		}
		 })
		 .style("top", function(d, i) {
                let h = y(d["yr_cleaned"]);
		 		return h + 'px'
		 })
		 .style("width", sz/spacing)
		 .style("height", sz/spacing)
		 .attr("z-index", 20)

        //  containers.html(function(d) {
        //     return "<img src='" + d["img-path"] + "' alt='Image " + d["sub-key"] + d["y-key"] + "' width='" + sz/spacing + "' height='" + sz/spacing + "'>";
        //   });         
		
		svg.append("line")
		  .attr("id", "vline-dotted")
		   .attr("x1", x(0))
		   .attr("x2", x(0))  
		   .attr("y1", y(2023))
		   .attr("y2", y(2021) + sz/2) 
		   .attr("stroke", "black")
		   .attr("stroke-width", 1)	
		   .style("stroke-dasharray", ("1, 3"))
		//    .attr("tranform", "translate(" + sz + "," + sz + ")")

		var circleData = [{"year": 2021, "y_adjust": sz/2, "color": "#4C4082"}, {"year": 2022, "y_adjust": szh*5/12, "color": "#800035"}, {"year": 2023, "y_adjust": 0, "color": "#800035"}]
		svg.selectAll("mycircle")
			 .data(circleData)
			 .enter()
			 .append("circle")
			   .attr("cx", function(d) { return x(0); })
			   .attr("cy", function(d) { return y(d.year) + d.y_adjust; })
			   .attr("r", "6")
			   .style("fill", function(d) { return d.color; })		
			//    .style("opacity", 0.75)	

		var firefly = container.append("div")
		.attr("class", "container-annotation")
		.style("position", "absolute")
		.style("left", x(0) - sz*1.4 + 'px')
		.style("top", y(2023) + 'px')

		var glitchme = container.append("div")
		.attr("class", "container-annotation")
		.style("position", "absolute")
		.style("left", x(0) + sz*.67 + 'px')
		.style("top", y(2023) + 'px')		

		var hyperlinkURL = "https://www.redsharknews.com/adobe-express-with-firefly-moves-out-of-beta"

		firefly.node().innerHTML =    
		"<div style='border: 2px solid #800035; border-radius: 15px; padding: 10px; text-align: center; background-color: white; width: 220px;'>" +
		"<div style='display: flex; align-items: center;'>" +
		  "<img src='img/express.png' alt='Express Image' style='width:" + sz/3 + "px; height:" + sz/3 + "px; border-radius: 10px;'>" +
		  "<span style='margin: 0 10px;'>+</span>" +
		  "<img src='img/firefly.png' alt='Firefly Image' style='width:" + sz/3 + "px; height:" + sz/3 + "px; border-radius: 10px;'>" +
		  "<span style='margin-left: 10px; border-left: 1px solid black; padding-left: 10px; height: " + sz/3 + "px;'> " +
			"<p style='margin-left: 0; margin-right: 0; font-family: Lato; font-weight: normal; width: 100%;'>August 2023</p>" +
		  "</span>" +
		"</div>" +
		"<p style='margin-top: 10px; margin-left: 0; margin-right: 0; font-family: Lato; font-weight: 300; width: 100%;'>" +
		"Adobe Express and Adobe Firefly <a href='" + hyperlinkURL + "' style='text-decoration: none; color: #800035;'>move</a> out of beta" +
		"</p>" +
	  "</div>";

	  glitchme.node().innerHTML =    
	  "<div style='border: 2px solid blue; border-radius: 15px; padding: 10px; text-align: center; background-color: white;'>" +
	  "<div style='display: flex; align-items: center;'>" +
		"<span style='text-align: right; margin-right: 10px; border-right: 1px solid black; padding-right: 10px; height: " + sz/3 + "px;'> " +
			"<p style='text-align: right; margin-left: 0; margin-right: 0; font-family: Lato; font-weight: normal; width: 100%;'>November 2023</p>" +
		"</span>" +	  
		"<img src='img/express.png' alt='Express Image' style='width:" + sz/3 + "px; height:" + sz/3 + "px; border-radius: 10px;'>" +
		"<span style='margin: 0 10px;'>+</span>" +
		"<img src='img/firefly.png' alt='Firefly Image' style='width:" + sz/3 + "px; height:" + sz/3 + "px; border-radius: 10px;'>" +
	  "</div>" +
	  "<p style='margin-top: 10px; margin-left: 0; margin-right: 0; font-family: Lato; font-weight: 300; width: 100%;'>" +
	  "Adobe Express and Adobe Firefly <a href='" + hyperlinkURL + "' style='text-decoration: none; color: #800035;'>move</a> out of beta" +
	  "</p>" +
	"</div>";	  
	//   "<p style='font-weight: normal; font-family: Lato; margin-bottom: 10px; width: 100%;'>August 2023</p>" +

	
		svg.append("text")
			.text("Joined Adobe")
			.attr("class", "svg-label")
			.attr("x", x(0) - 10)
			.attr("y", y(2022) + szh*5/12 + 2)
			.attr("text-anchor", "end")
			.attr("alignment-baseline", "middle")
			.style("font-size", "15px")
			.style("font-family", "Lato")

		svg.append("text")
			.text("Joined ThermoFisher Scientific")
			.attr("class", "svg-label")
			.attr("x", x(0) - 10)
			.attr("y", y(2021) + sz/2 + 2)
			.attr("text-anchor", "end")
			.attr("alignment-baseline", "middle")
			.style("font-size", "15px")
			.style("font-family", "Lato")			
			// .style("font-weight", 499)

		svg.append("text")
			.text("PROFESSIONAL")
			.attr("class", "svg-label")
			.style("font-family", "trajan-pro-3")
			.style("font-size", "30px")
			.style("opacity", 0.7)
			.style("font-weight", 199)
			.attr("transform", "translate(" + fullMargin.left*2 + ",350) rotate(270)")

		svg.append("text")
			.text("PERSONAL")
			.attr("class", "svg-label")
			.attr("text-anchor", "middle")
			.style("font-family", "trajan-pro-3")
			.style("font-size", "30px")
			.style("opacity", 0.7)
			.style("font-weight", 199)
			.attr("transform", "translate(" + (fullWidth - fullMargin.right*2) + ",200) rotate(90)")
		 // .on("mouseover", etc.)
	})

 // Parse the Data
}

loadTimeline(filter_list, "era_cleaned");

var checkBox = d3.selectAll(".filter-check")

// checkBox.on("change", function () {
// 	d3.selectAll('.movie-rect').remove();

// 	var choices = []
// 	var checkboxes = document.querySelectorAll('input[type=checkbox]')
// 	var unchecked = []

// 	for (var i = 0; i < checkboxes.length; i++) {
// 		if (checkboxes[i]["checked"]) {
// 			choices.push((checkboxes[i].value))
// 		}
// 	    else {
// 	    	unchecked.push((checkboxes[i].value))
// 	    }
// 	}

// 	for (var i = 0; i <unchecked.length; i ++) {
// 		d3.select("#" + unchecked[i].split(' ').join('_') + "sabers").selectAll(".bar").style("box-shadow", "none").style("border-right-color", "#d6d6d6")
// 	}

// 	for (var i = 0; i <choices.length; i ++) {
// 		d3.select("#" + choices[i].split(' ').join('_') + "sabers").selectAll(".bar")
// 			.style("box-shadow", function(d) {
// 				return "0.4em 0 0.6em 0.1em " + media_color(d);
// 			})
// 			.style("border-right-color", function(d) {
// 				return media_color(d);
// 			})
// 	}

// 	var form = document.getElementById("color_filter")
// 	var form_val;
// 	for(var i=0; i<form.length; i++) {		
// 		if (form[i].checked) {
// 			form_val = form[i].id;
// 		}		
// 	}	
// 	loadTimeline(choices, form_val);	 
// })

// var radioButtons = d3.selectAll(".filter-radio")

// radioButtons.on("change", function() {	
// 	d3.selectAll('.movie-rect').remove();

// 	var choices = []
// 	var checkboxes = document.querySelectorAll('input[type=checkbox]:checked')
// 	for (var i = 0; i < checkboxes.length; i++) {
// 	    choices.push(checkboxes[i].value)
// 	}

// 	var form = document.getElementById("color_filter")
// 	var form_val;
// 	for(var i=0; i<form.length; i++) {		
// 		if (form[i].checked) {
// 			form_val = form[i].id;
// 		}
// 	}	

// 	loadTimeline(choices, form_val);
// })