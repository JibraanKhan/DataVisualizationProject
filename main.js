var dataPromise = d3.json('class.json')

dataPromise.then(function(data){
  initialize(data);
},
function(error){
  console.log(error);
})

var initialize = function(data){
  var student_buckets = [];
  var stretch = 3;
  data.forEach(function(d, i){
    var day_bucket = [];
    var max_days = d.final[0].day;
    for (var day = 0; day < max_days; day+= stretch - 1){
      var object_to_push = day_span_change(i, data, [day + 1, day + stretch])
      day_bucket.push(object_to_push);
    }
    student_buckets.push(day_bucket);
  });
  var screen = {
    width:1000,
    height:500
  };
  var margins = {
    left: screen.width * 0.1,
    right: screen.width * 0.25,
    top: screen.height * 0.05,
    bottom: screen.height * 0.1,
  };
  var width = screen.width - margins.left - margins.right;
  var height = screen.height - margins.top - margins.bottom;
  var svg = d3.select('body')
              .append('svg')
              .attr('height', screen.height)
              .attr('width', screen.width);
  var xScale = d3.scaleLinear()
                 .domain([1, d3.max(student_buckets, function(d, i){ return d.length; })])
                 .range([margins.left, width])
  var xAxisScale = d3.scaleLinear()
                 .domain([1, d3.max(d3.max(student_buckets, function(d, i){ return d.map(function(d,i){ return d.max_day; }); }))])
                 .range([margins.left, width])
  var xAxis = d3.axisTop(xAxisScale)
                .ticks(d3.max(d3.max(student_buckets, function(d, i){ return d.map(function(d,i){ return d.max_day; }); })))
  var yScale = d3.scaleLinear()
                 .domain([1, student_buckets.length])
                 .range([height, margins.top])
  var yAxis = d3.axisRight(yScale)
                .ticks(student_buckets.length);
  var student_groups = svg.selectAll('g')
                          .data(student_buckets)
                          .enter()
                          .append('g')
                          .classed('student', true)
                          .each(function(student_bucket, bucket_index){
                            var group = d3.select(this);
                            group.selectAll('rect')
                                 .data(student_bucket)
                                 .enter()
                                 .append('rect')
                                 .classed('changes', true)
                                 .attr('x', function(day_bucket, day_index){
                                   return xScale(day_index+1)
                                 })
                                 .attr('y', yScale(bucket_index+1))
                                 .attr('height', (yScale(bucket_index+1) - yScale(bucket_index+2)) - height*0.005)
                                 .attr('width', function(day_bucket, day_index){
                                   var end_point = xScale(day_index+2);
                                   var initial_point = xScale(day_index+1);
                                   if (end_point > xScale(d3.max(student_buckets, function(d, i){ return d.length; }))){
                                     end_point = xScale(d3.max(student_buckets, function(d, i){ return d.length; }))
                                   }
                                   if (initial_point > xScale(d3.max(student_buckets, function(d, i){ return d.length; }))){
                                     initial_point = xScale(d3.max(student_buckets, function(d, i){ return d.length; }))
                                   }
                                   return (end_point - initial_point) - width*0.001
                                 })
                                 .attr('fill', function(d){
                                   var change = d.total_change;
                                   if (change < 0){
                                     return '#ea6b5d'
                                   }else if(change > 0){
                                     return '#5dea75'
                                   }else if(change == 0){
                                     return '#918988'
                                   };
                                 })
                          })
                          .on('mouseover', function(d, i){
                            var change = d.total_change;
                            var g = d3.select(this);
                            var x_change = 10;
                            var rects = g.selectAll('rect')
                                         .each(function(d,i){
                                           var current_rect = d3.select(this);
                                           var change = d.total_change;
                                           var color = d3.rgb(current_rect.attr('fill'));
                                           var added_color = 40;
                                           if (change < 0){
                                             color.r += added_color
                                           }else if(change > 0){
                                             color.g += added_color
                                           }else{
                                             color.g += added_color
                                             color.r += added_color
                                             color.b += added_color
                                           }
                                           current_rect.transition().attr('fill', color);
                                         })
                            g.transition().attr('transform', 'translate(' + x_change + ',0)')
                          })
                          .on('mouseout', function(d, i){
                            var change = d.total_change;
                            var g = d3.select(this);
                            var x_change = 0;
                            var rects = g.selectAll('rect')
                                         .each(function(d,i){
                                           var current_rect = d3.select(this);
                                           // var change = d.total_change;
                                           current_rect.transition().attr('fill', function(d){
                                             var change = d.total_change;
                                             if (change < 0){
                                               return '#ea6b5d'
                                             }else if(change > 0){
                                               return '#5dea75'
                                             }else if(change == 0){
                                               return '#918988'
                                             };
                                           })
                                         })
                            g.transition().attr('transform', 'translate(' + x_change + ',0)')
                                       })
                          .on('click', function(d,i){
                            d3.select('body').selectAll('svg.studentData').remove();
                            draw_new_svg(d, i)
                          })
    svg.append('g')
       .classed('xAxis', true)
       .attr('transform', 'translate(0,' + (height + margins.top + 20) + ")")
       .call(xAxis);

   svg.append('g')
      .classed('yAxis', true)
      .attr('transform', 'translate(' + margins.left*(2.5/4) + ',' + (margins.top * 1/2) +')')
      .call(yAxis);

   var text_pos = [
     ['Days', 'translate(' + width/2 + ',' + (height + (margins.bottom + (margins.top * 0.8))) + ")"],
     ['Students', 'translate(' + (margins.left * 0.33) + ',' + (height/2) + ") rotate(-90)"]
   ]

   svg.selectAll('text .label')
      .data(text_pos)
      .enter()
      .append('text')
      .classed('label', true)
      .attr('transform', function(d){
        return d[1];
      })
      .text(function(d){
        return d[0];
      })
      .attr('font-size', 21)

    var legend_size = {
      width:(margins.right - (margins.right*(3/4))),
      height:(width*0.5 - width*0.3)
    }
    var legend_margins = {
      top:legend_size.height*0.05,
      bottom:legend_size.height*0.05,
      left:legend_size.width*0.05,
      right:legend_size.width*0.05
    }
    var legend_width = legend_size.width - legend_margins.left - legend_margins.right;
    var legend_height = legend_size.height - legend_margins.top - legend_margins.bottom;
    var g = svg.append('g')
               .classed('legend', true)
               .attr('transform', 'translate(' + (width - (margins.right * 0.25)) + "," + margins.top + ")");
    var types = [
      ['#ea6b5d', 'Decrease in Total Percentage'],
      ['#5dea75', 'Increase in Total Percentage'],
      ['#918988', 'No Change in Total Percentage']
    ]

    g.selectAll('g')
     .data(types)
     .enter()
     .append('g')
     .attr('transform', function(d, i){
       return 'translate(' + margins.left + "," + ((i * ((legend_size.height/types.length) + legend_margins.bottom)) + legend_margins.top) +")"
     })
     .each(function(d, i){
       var g = d3.select(this);
       var rect = g.append('rect')
                   .attr('x', 0)
                   .attr('y', 0)
                   .attr('width', legend_width * 0.5)
                   .attr('height', legend_height/types.length)
                   .attr('fill', function(d, i){
                     return d[0];
                   })
      var text = g.append('text')
                  .attr('x', legend_width)
                  .attr('y', (legend_height/types.length) * 0.5)
                  .text(function(d){
                    return d[1];
                  })
     })
}









var draw_new_svg = function(data, student){
  var penguins = [
	'bookworm-penguin',
	'crafty-penguin',
	'cyclist-penguin',
	'drunken-penguin',
	'Easter-penguin',
	'ebook-penguin',
	'Farmer-penguin',
	'gentleman-penguin',
	'judo-penguin',
	'moana-penguin',
	'painter-penguin',
	'penguin-grill',
	'pharaoh-penguin',
	'pilot-penguin',
	'Pinga_corr',
	'pixie-penguin',
	'sailor-penguin',
	'santa-penguin',
	'tauch-pinguin-ocal',
	'tux',
	'valentine-penguin-ocal',
	'valentine-penguin',
	'valentine-penguin-ocal',
	'wizard-penguin'
]
  var student_name = penguins[student];
  var img_ref = "students/" + student_name+"-300px.png";
  console.log(img_ref);
  var universal_screen = {
    width:800,
    height:600,
  }
  var svg = d3.select('body').append('svg')
                             .attr('height', universal_screen.height)
                             .attr('width', universal_screen.width)
                             .classed('studentData', true)
  var universal_margins = {
    top:screen.height*0.05,
    bottom:screen.height*0.05,
    left:screen.width*0.05,
    right:screen.width*0.05
  }
  var universal_width = universal_screen.width - universal_margins.left - universal_margins.right;
  var universal_height = universal_screen.height - universal_margins.top - universal_margins.bottom;
  var biogroup = svg.append('g')
                    .classed('bio', true)
                    .attr('transform', 'translate('+universal_margins.left+','+universal_margins.top+')')
  biogroup_size = {
    width:universal_width,
    height:universal_height* 0.3 - universal_height*0
  }
  var img = biogroup.append('image')
               .attr('x', 0)
               .attr('y', 0)
               .attr('xlink:href', img_ref)
               .attr('width', biogroup_size.width * 0.3)
               .attr('height', biogroup_size.height);
  var name_text = biogroup.append('text')
                          .attr('x', biogroup_size.width * 0.4)
                          .attr('y', biogroup_size.height/2)
                          .attr('font-size', '35')
                          .text(student_name);
  var graph_size = {
    width:universal_width,
    height:universal_height - universal_height*0.5
  }
  var graph_margins = {
    top:graph_size.height*0.05,
    bottom:graph_size.height*0.05,
    left:graph_size.width*0.05,
    right:graph_size.width*0.05
  }
  var graph_width = graph_size.width - graph_margins.left - graph_margins.right;
  var graph_height = graph_size.height - graph_margins.top - graph_margins.bottom;
  var graph = svg.append('g')
                 .classed('graph', true)
                 .attr('transform', 'translate(' + universal_margins.left + ',' + (universal_margins.top + (universal_height * 0.5)) + ')')
  console.log(d3.max(data, function(d, i){ return d.max_day; }))
  var xScale = d3.scaleLinear()
                 .domain([1, data.length])
                 .range([graph_margins.left, graph_width])
  var xAxisScale = d3.scaleLinear()
                     .domain([1, d3.max(data, function(d, i){ return d.max_day; })])
                     .range([graph_margins.left, graph_width])
  var xAxis = d3.axisTop(xAxisScale)
                .ticks(data.length);
  var yScale = d3.scaleLinear()
                 .domain([d3.min(data, function(d,i){ return d.total_change; }), d3.max(data, function(d,i){ return d.total_change; })])
                 .range([graph_height, graph_margins.top])
  var yAxis = d3.axisRight(yScale)
                .ticks(6)
 // var line_graph = svg.append('g')
 //                .append('path')
 //                .datum(dataset)
 //                .attr('d', drawLine)
 //                .attr('stroke-width', 5)
 //                .attr('stroke', 'black')
 //                .attr('fill', 'none')
 //                .attr('transform', 'translate(' + margins.left + ',0)')
 // var drawArea = d3.area()
 //                  .x(function(d, i){ return xScale(i); })
 //                  .y0(height)
 //                  .y1(function(d){ return yScale(d); })
 //
 // var area_graph = svg.append('g')
 //                .append('path')
 //                .datum(dataset)
 //                .attr('d', drawArea)
 //                .attr('fill', 'black')
 //                .attr('transform', 'translate(' + margins.left + ',0)')
 //                .classed('hidden', true);

  var drawArea = d3.area()
                   .x(function(d, i){ return xScale(i+1); })
                   .y0(function(d, i){ return yScale(0); })
                   .y1(function(d, i){ return yScale(d.total_change); })
 // var curveTypes = [
 // 	{name: 'curveLinear', curve: d3.curveLinear, active: true, lineString: '', clear: false, info: 'Interpolates the points using linear segments.'},
 // 	{name: 'curveBasis', curve: d3.curveBasis, active: true, lineString: '', clear: true, info: 'Interpolates the start and end points and approximates the inner points using a B-spline.'},
 // 	{name: 'curveBasisClosed', curve: d3.curveBasisClosed, active: false, lineString: '', clear: false, info: 'Uses a closed B-Spline to approximate the points.'},
 // 	{name: 'curveBundle (ß=0)', curve: d3.curveBundle.beta(0), active: false, lineString: '', clear: true, info: 'Same as curveBasis with the addition of a paramter ß which determines how close to a straight line the curve is. If ß=0 the curve is straight.'},
 // 	{name: 'curveBundle (ß=0.5)', curve: d3.curveBundle.beta(0.5), active: false, lineString: '', clear: false, info: 'Same as curveBasis with the addition of a paramter ß which determines how close to a straight line the curve is.'},
 // 	{name: 'curveBundle (ß=1)', curve: d3.curveBundle.beta(1), active: false, lineString: '', clear: false, info: 'Same as curveBasis with the addition of a paramter ß which determines how close to a straight line the curve is. If ß=1 the curve is the same as curveBasis.'},
 // 	{name: 'curveCardinal (tension=0)', curve: d3.curveCardinal.tension(0), active: false, lineString: '', clear: true, info: "Interpolates the points using a cubic B-spline. A tension parameter determines how 'taut' the curve is. As tension approaches 1 the segments become linear."},
 // 	{name: 'curveCardinal (tension=0.5)', curve: d3.curveCardinal.tension(0.5), active: false, lineString: '', clear: false, info: "Interpolates the points using a cubic B-spline. A tension parameter determines how 'taut' the curve is. As tension approaches 1 the segments become linear."},
 // 	{name: 'curveCardinal (tension=1)', curve: d3.curveCardinal.tension(1), active: false, lineString: '', clear: false, info: "Interpolates the points using a cubic B-spline. A tension parameter determines how 'taut' the curve is. As tension approaches 1 the segments become linear."},
 // 	{name: 'curveCatmullRom (α=0)', curve: d3.curveCatmullRom.alpha(0), active: false, lineString: '', clear: true, info: 'Similar to curveCardinal (tension=0) but with a parameter α that determines the parameterisation used to interpolate the points. If α=0 the parameterisation is uniform.'},
 // 	{name: 'curveCatmullRom (α=0.5)', curve: d3.curveCatmullRom.alpha(0.5), active: false, lineString: '', clear: false, info: 'Similar to curveCardinal (tension=0) but with a parameter α that determines the parameterisation used to interpolate the points. If α=0.5 the parameterisation is centripetal and self intersecting loops are avoided.'},
 // 	{name: 'curveCatmullRom (α=1)', curve: d3.curveCatmullRom.alpha(1), active: false, lineString: '', clear: false, info: 'Similar to curveCardinal (tension=0) but with a parameter α that determines the parameterisation used to interpolate the points. If α=1 the parameterisation is chordal.'},
 // 	{name: 'curveMonotoneX', curve: d3.curveMonotoneX, active: false, lineString: '', clear: true, info: 'Interpolates the points with a cubic spline which are monotonic (i.e. always increasing or always decreasing) in y.'},
 // 	{name: 'curveMonotoneY', curve: d3.curveMonotoneY, active: false, lineString: '', clear: false, info: 'Interpolates the points with a cubic spline which are monotonic (i.e. always increasing or always decreasing) in x.'},
 // 	{name: 'curveNatural', curve: d3.curveNatural, active: false, lineString: '', clear: true, info: 'Interpolates the points with a cubic spline with zero 2nd derivatives at the endpoints.'},
 // 	{name: 'curveStep', curve: d3.curveStep, active: false, lineString: '', clear: true, info: 'Interpolates the points with alternating horizontal and vertical linear segments. The vertical segments lie midway between points.'},
 // 	{name: 'curveStepAfter', curve: d3.curveStepAfter, active: false, lineString: '', clear: false, info: 'Interpolates the points with alternating horizontal and vertical linear segments. The y value changes after the x value.'},
 // 	{name: 'curveStepBefore', curve: d3.curveStepBefore, active: false, lineString: '', clear: false, info: 'Interpolates the points with alternating horizontal and vertical linear segments. The y value changes before the x value.'}
 // ];
 // fav: d3.curveCatmullRom.alpha(0)
   var drawLine = d3.line()
                    .x(function(d, i){ return xScale(i+1); })
                    .y(function(d, i){ return yScale(d.total_change); })
                    .curve(d3.curveCatmullRom.alpha(0));
                    // ['#ea6b5d', 'Decrease in Total Percentage'],
                    // ['#5dea75', 'Increase in Total Percentage'],
                    // ['#918988', 'No Change in Total Percentage']
   var area_graph = graph.append('path')
                         .datum(data)
                         .attr('d', drawArea)
                         .attr('fill', function(d, i){
                           if (d.total_change > 0){
                             return '#5dea75'
                           }else if(d.total_change <0){
                             return '#ea6b5d'
                           }else{
                             return '#918988'
                           }
                         })
                         .classed('hidden', true);
  var zero_data = data.map(function(d,i){ return {total_change:0}})
  var zero_line = graph.append('path')
                       .datum(zero_data)
                       .attr('d', drawLine)
                       .attr('stroke-width', 3)
                       .attr('stroke', 'green')
                       .attr('fill', 'none');
  graph.append('g')
       .classed('xAxis', true)
       .attr('transform', 'translate(0,' + (graph_height + graph_margins.top) + ')')
       .call(xAxis)

   graph.append('g')
        .classed('yAxis', true)
        .attr('transform', 'translate('+ graph_margins.left*0.5 +',0)')
        .call(yAxis)

   var labels = [
     ['Days', 'translate('+graph_width/2+","+(graph_height+graph_margins.top+graph_margins.bottom+5)+")"],
     ['Total Percent Change', 'translate('+0+","+graph_height*(3/4)+") rotate(-90)"]
   ]

   graph.selectAll('text.labels')
        .data(labels)
        .enter()
        .append('text')
        .classed('labels', true)
        .attr('transform', function(d,i){ return d[1]; })
        .text(function(d, i){ return d[0]; })
   var dots = graph.selectAll('circle')
                   .data(data)
                   .enter()
                   .append('circle')
                   .attr('cx', function(d, i){ return xScale(i+1)})
                   .attr('cy', function(d, i){ return yScale(d.total_change); })
                   .attr('r', 5)
                   .attr('fill', 'blue')
                   .on('mouseover', function(d, i){
                     var circle = d3.select(this);
                     var tooltip_size = {
                       width:graph_width*0.3,
                       height:graph_height*0.5
                     }
                     var tooltip_margins = {
                       top:tooltip_size.height*0.05,
                       bottom:tooltip_size.height*0.05,
                       left:tooltip_size.width*0.05,
                       right:tooltip_size.width*0.05
                     }
                     var tooltip_width = tooltip_size.width - tooltip_margins.left - tooltip_margins.right;
                     var tooltip_height = tooltip_size.height - tooltip_margins.top - tooltip_margins.bottom;
                     circle.transition().attr('r', 10);
                     var cx = circle.attr('cx');
                     var cy = circle.attr('cy');
                     var mouse = d3.mouse(this);
                     var tooltip = graph.append('g')
                                        .classed('tooltip', true)
                                        .attr('transform', 'translate('+graph_width * 0.5+','+0+')');

                     var rect = tooltip.append('rect')
                                       .attr('x', 0)
                                       .attr('y', 0)
                                       .attr('width', tooltip_size.width)
                                       .attr('height', tooltip_size.height)
                                       .attr('fill', 'yellow')
                      var texts = [
                        'Total Percent:'+d.total_percentage,
                        'Total Percent Impacts:',
                        'Day '+d.span[0] + " – Day "+d.span[1],
                        'Quiz: '+d.average_changes.quizes,
                        'Homework: '+d.average_changes.homework,
                        'Test: '+d.average_changes.test,
                        'Final: '+d.average_changes.final
                      ]
                      tooltip.selectAll('text')
                             .data(texts)
                             .enter()
                             .append('text')
                             .attr('x', tooltip_margins.left)
                             .attr('y', function(d, i){
                               return (i + 1) * (tooltip_height/texts.length);
                             })
                             .text(function(d, i){ return d; })
                   })
                   .on('mouseout', function(d, i){
                     var circle = d3.select(this);
                     circle.transition().attr('r', 5);
                     d3.select('body').selectAll('.tooltip')
                                      .transition()
                                      .attr('opacity', 0)
                                      // .on('end', function(d,i){
                                      //   d3.select(this).remove()
                                      // });
                   })
       var line_graph = graph.append('path')
                           .datum(data)
                           .attr('d', drawLine)
                           .attr('stroke-width', 5)
                           .attr('stroke', 'black')
                           .attr('fill', 'none')
       var text_options_sizes = {
         width:universal_width,
         height:universal_height*0.45 - universal_height*0.35
       }
       var options_panel = svg.append('g')
                              .classed('optionsPanel', true)
                              .attr('transform', 'translate('+universal_margins.left+","+universal_height*0.4+")")

      var text_options = [
        ['Line Graph', function(){ line_graph.classed('hidden',false);  area_graph.classed('hidden',true); }],
        ['Area Graph', function(){ line_graph.classed('hidden',true);  area_graph.classed('hidden',false);}],
        ['Line & Area Graph', function(){line_graph.classed('hidden', false);   area_graph.classed('hidden', false);}]
      ]
      options_panel.selectAll('text')
                   .data(text_options)
                   .enter()
                   .append('text')
                   .attr('x', function(d, i){ return ((i) * (text_options_sizes.width*(1/3)))})
                   .attr('y', text_options_sizes.height * 0.5)
                   .text(function(d){
                     return d[0];
                   })
                   .attr('text-anchor', 'middle')
                   .attr('font-size', 24)
                   .on('click', function(d, i){
                     d[1]();
                   })
                   .on('mouseover', function(d, i){
                     var text_obj = d3.select(this);
                     text_obj.transition()
                             .attr('font-size', 28)
                             .attr('fill', 'blue')
                   })
                   .on('mouseout', function(d, i){
                     var text_obj = d3.select(this);
                     text_obj.transition()
                             .attr('font-size', 24)
                             .attr('fill', 'black')
                   })
}

















var object_summer = function(obj){
  var sum = 0;
  for (var property in obj){
    if (obj.hasOwnProperty(property)){
      var value = obj[property] || 0;
      sum += value;
    }
  }
  return sum;
}





var return_weight = function(dataset, day){
  var weight = {};
  var return_relevant_info = function(d){
    if (d.day == day){
      return [d.day, d.grade];
  }
  }
  var strip_undefined = function(datapoint){
    return datapoint != undefined;
  }
  var final_grades = dataset.final.map(return_relevant_info).filter(strip_undefined)
  var homework_grades = dataset.homework.map(return_relevant_info).filter(strip_undefined)
  var quizzes_grades = dataset.quizes.map(return_relevant_info).filter(strip_undefined)
  var tests_grades = dataset.test.map(return_relevant_info).filter(strip_undefined)
  // console.log("Final:", final_grades);
  // console.log("Homework:", homework_grades);
  // console.log("Quizzes:", quizzes_grades);
  // console.log("Tests:", tests_grades);
  final_grades.push([0, 0]);
  homework_grades.push([0, 0]);
  quizzes_grades.push([0, 0]);
  tests_grades.push([0, 0]);
  var sum = function(total, current){
    return (total + current);
  }
  var getGrades = function(list){
    return list[1];
  }



  weight = {
    final:(((final_grades.map(getGrades).reduce(sum)/(dataset.final[0].max * (final_grades.length - 1))) * 100) * 0.3),
    homework:(((homework_grades.map(getGrades).reduce(sum)/(dataset.homework[0].max * (homework_grades.length - 1))) * 100) * 0.15),
    quizes:(((quizzes_grades.map(getGrades).reduce(sum)/(dataset.quizes[0].max * (quizzes_grades.length - 1))) * 100) * 0.15),
    test:(((tests_grades.map(getGrades).reduce(sum)/(dataset.test[0].max * (tests_grades.length - 1))) * 100) * 0.4)
  }
  return weight;
}

var return_days_sum = function(section, dataset, day){
  var sum = 0;
  var datasector = dataset[section];
  datasector.forEach(function(d,i){
    if (d.day <= day){
      sum += d.grade;
    }
  })

  return sum;
}

var amount_of_current_grades = function(dataset, day, property){
  var relevantdata = dataset[property];
  var grades_done = 1;
  relevantdata.forEach(function(d,i){
    if (d.day >= day){
      return;
    }
    grades_done++;
  })
  return grades_done;
}
var average_grades = function(dataset, day){
  var weights_for_categories = {
    final:0.3,
    homework:0.15,
    quizes:0.15,
    test:0.4
  }
  var average = {
  };
  var weight = {
    final:10,
    homework:10,
    quizes:10,
    test:10
  }
  for (var property in weight){
    if (weight.hasOwnProperty(property)){
      var currentDaySum = return_days_sum(property, dataset, day)
      var currentDayAverage = (((currentDaySum/(amount_of_current_grades(dataset, day, property) * dataset[property][0].max)) * 100) *  weights_for_categories[property]);
      average[property] = currentDayAverage;
    }
  }
  return average;
}
var day_span_change = function(student, data, day_span, grades){ // Returns an array of the following format:
                                    // [Total Percentage Change, Weight Change From Day_Span[0] to Day_Span[1]]
    var dataset = data[student];
    var averages = [];
    var max_day = data[student].final[data[student].final.length - 1].day;
    for (var day = day_span[0]; day <= day_span[1]; day++){
      var average = average_grades(dataset, day);
      averages.push(average);
    }
    var quantifier = 100;
    var average_changes = {
      final:Math.round((averages[averages.length-1].final - averages[0].final)*quantifier)/quantifier,
      homework:Math.round((averages[averages.length-1].homework - averages[0].homework)*quantifier)/quantifier,
      quizes:Math.round((averages[averages.length-1].quizes - averages[0].quizes)*quantifier)/quantifier,
      test:Math.round((averages[averages.length-1].test - averages[0].test)*quantifier)/quantifier
    }
    var total_percentage_change = Math.round((object_summer(average_changes)) * quantifier)/quantifier;
    return {average_changes:average_changes, total_change:total_percentage_change, span:day_span, max_day:max_day, total_percentage:Math.round(object_summer(averages[0])*quantifier)/quantifier}
}
