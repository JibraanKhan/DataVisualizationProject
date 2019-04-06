var dataPromise = d3.json('class.json')

dataPromise.then(function(data){
  initialize(data);
},
function(error){
  console.log(error);
})

var return_buckets_stretch = function(data, stretch){
  var student_buckets = [];
  data.forEach(function(d, i){
    var day_bucket = [];
    var max_days = d.final[0].day;
    for (var day = 0; day < max_days; day+= stretch - 1){
      var object_to_push = day_span_change(i, data, [day + 1, day + stretch])
      day_bucket.push(object_to_push);
    }
    student_buckets.push(day_bucket);
  });

  return student_buckets
}

var return_selection_back = function(g, d, i, easing, colors){
  var change = d.total_change;
  var x_change = 0;
  var rects = g.selectAll('rect')
               .each(function(d,i){
                 var current_rect = d3.select(this);
                 // var change = d.total_change;
                 current_rect.transition().duration(500).ease(easing[9]).attr('fill', function(d){
                   var change = d.total_change;
                   if (change < 0){
                     return colors[0]
                   }else if(change > 0){
                     return colors[1]
                   }else if(change == 0){
                     return colors[2]
                   };
                 })
               })

     g.transition().duration(500).ease(easing[1]).attr('transform', 'translate(' + x_change + ',0)')
      .on('end', function(){g.attr('class', 'student'); })
}

var initialize = function(data){
  var stretch = 2;
  var student_buckets = return_buckets_stretch(data, stretch)
  var max_day_buckets = student_buckets[0].length;
  var max_students = student_buckets.length;
  var day_averages = []
  for (var currentBucket = 0; currentBucket < max_day_buckets; currentBucket++){
    var todays_student_average = 0;
    var total = 0;
    for (var currentStudent = 0; currentStudent < max_students; currentStudent++){
      total+= student_buckets[currentStudent][currentBucket].total_percentage;
    }
    todays_student_average = total/max_students;
    day_averages.push(todays_student_average);
  }

  var screen = {
    width:1000,
    height:500
  };
  var margins = {
    left: screen.width * 0.1,
    right: screen.width * 0.25,
    top: screen.height * 0.05,
    bottom: screen.height * 0.25,
  };
  var transitioning = false;
  var easing = [
    d3.easeElastic,
    d3.easeBounce,
    d3.easeLinear,
    d3.easeSin,
    d3.easeQuad,
    d3.easeCubic,
    d3.easePoly,
    d3.easeCircle,
    d3.easeExp,
    d3.easeBack
    ];
  var colors = [
    '#009794', // Decrease in Percentage
    '#C845FF', // Increase in Percentage
    '#E86100' // No difference in Percentage
  ]
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
                .ticks(d3.max(d3.max(student_buckets, function(d, i){ return d.map(function(d,i){ return d.max_day; }); }))/stretch)
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
                                     return colors[0]
                                   }else if(change > 0){
                                     return colors[1]
                                   }else if(change == 0){
                                     return colors[2]
                                   };
                                 })
                          })
                          .on('mouseover', function(d, i){
                            var g = d3.select(this);
                            if (transitioning || g.attr('class') == 'selected'){ return false; }
                            var change = d.total_change;
                            var x_change = 10;
                            var rects = g.selectAll('rect')
                                         .each(function(d,i){
                                           var current_rect = d3.select(this);
                                           var change = d.total_change;
                                           var color = d3.rgb(current_rect.attr('fill'));
                                           var brightness = 70;
                                           color = 'rgb('+(color.r+brightness)+','+(color.g+brightness)+','+(color.b+brightness)+')'
                                           current_rect.transition().duration(500).ease(easing[9]).attr('fill', color);
                                         })
                            g.transition().ease(easing[0]).duration(1000).attr('transform', 'translate(' + x_change + ',0)')
                          })
                          .on('mouseout', function(d, i){
                            var g = d3.select(this);
                            if (transitioning || g.attr('class') == 'selected'){ return false; }
                            return_selection_back(g, d, i, easing, colors);
                          })
                          .on('click', function(d,i){
                            var g = d3.select(this);
                            if (g.attr('class') != 'selected'){
                              var gs = svg.selectAll('g.selected').attr('class', 'student')
                              return_selection_back(gs, d, i, easing, colors)
                              g.attr('class', 'selected')
                            }else{
                              return_selection_back(g, d, i, easing, colors);
                            }
                            d3.select('body').selectAll('svg.studentData').remove();
                            draw_new_svg(d, i, day_averages);
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
      height:(height*0.5 - height*0.3)
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
      [colors[0], 'Decrease in Total Percentage'],
      [colors[1], 'Increase in Total Percentage'],
      [colors[2], 'No Change in Total Percentage']
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
     var span_tweeker_screen = {
       width:screen.width - width,
       height:(height + margins.bottom * 0.6) - (height * 0.5)
     }
     var span_margins = {
       top:span_tweeker_screen.height*0.05,
       bottom:span_tweeker_screen.height*0.05,
       left:span_tweeker_screen.width*0.05,
       right:span_tweeker_screen.width*0.05,
     }
     var span_height = span_tweeker_screen.height - span_margins.top - span_margins.bottom;
     var span_width = span_tweeker_screen.width - span_margins.left - span_margins.right;
     var span_tweeker = svg.append('g')
                           .classed('span_tweeker', true)
                           .attr('transform', 'translate(' + (width) + ','+ (height * 0.5) +')')
     var hrefs = [
       'images/UpArrow.png',
       'images/DownArrow.png'
     ]
     var objects = [
       ['image', ['x', span_margins.left], ['xlink:href', hrefs[0]], ['width', span_width]],
       ['text', ['x', (span_margins.left + span_width * 0.5)], ['font-size', 24], ['text-anchor', 'middle'], 'Day Span:'],
       ['text', ['x', (span_margins.left + span_width * 0.5)], ['font-size', 35], ['text-anchor', 'middle'], ['class', 'Stretch'],stretch],
       ['image', ['x', span_margins.left], ['xlink:href', hrefs[1]], ['width', span_width]],
     ]

     objects.forEach(function(obj_array, obj_index){
       var day_span_min = 2;
       var day_span_max = 15;
       var object = span_tweeker.append(obj_array[0]);
       var bBox = object.node().getBBox();
       obj_array.forEach(function(data_info, data_index){
         if (data_index > 0){
           object.attr(data_info[0], data_info[1]);
         }
       })
       var new_height = object.attr('height') || 0;
       if (obj_array[0] == 'image'){
         new_height = span_height/objects.length
         var click_func = function(){
           transitioning = true;
           var increase = false;
           var x = 0;
           var new_x = 0;
           if (obj_index == 0){
             x = span_tweeker_screen.width;
             new_x = 0;
             if (stretch < day_span_max){
               stretch++;
               increase = true;
             }
           }else if(obj_index == 3){
             x = 0;
             new_x = span_tweeker_screen.width;
             if (stretch > day_span_min){
             stretch--;
           }
           }
           var current_text = d3.select(this.parentNode).selectAll('text.Stretch')
           current_text.transition()
                       .duration(1000)
                       .ease(easing[3])
                       .attr('x', x)
                       .on('start', function(){
                         current_text.attr('class', 'opaque_leaving');
                       })
                       .on('end', function(){
                         current_text.remove();
                       })
            var new_new_height = bBox.height;
            var new_text = span_tweeker.append('text')
                                       .attr('x', new_x)
                                       .attr('y', (2 * ((span_height/objects.length) + new_new_height) + span_margins.top + span_height * 0.175))
                                       .text(stretch)
                                       .attr('text-anchor', 'middle')
                                       .attr('font-size', 35)
            new_text.transition()
                    .duration(250)
                    .ease(easing[4])
                    .attr('x', (span_margins.left + span_width * 0.5))
                    .on('start', function(){
                      new_text.attr('class', 'NewStretch')
                    })
                    .on('end', function(){
                      new_text.attr('class', 'Stretch');
                    })
            student_buckets = return_buckets_stretch(data, stretch)
            max_day_buckets = student_buckets[0].length;
            max_students = student_buckets.length;
            day_averages = []
            for (var currentBucket = 0; currentBucket < max_day_buckets; currentBucket++){
              var todays_student_average = 0;
              var total = 0;
              for (var currentStudent = 0; currentStudent < max_students; currentStudent++){
                total+= student_buckets[currentStudent][currentBucket].total_percentage;
              }
              todays_student_average = total/max_students;
              day_averages.push(todays_student_average);
            }
            xScale = d3.scaleLinear()
                           .domain([1, d3.max(student_buckets, function(d, i){ return d.length; })])
                           .range([margins.left, width])
            xAxisScale = d3.scaleLinear()
                           .domain([1, d3.max(d3.max(student_buckets, function(d, i){ return d.map(function(d,i){ return d.max_day; }); }))])
                           .range([margins.left, width])
            xAxis = d3.axisTop(xAxisScale)
                          .ticks(d3.max(d3.max(student_buckets, function(d, i){ return d.map(function(d,i){ return d.max_day; }); }))/stretch)
            yScale = d3.scaleLinear()
                           .domain([1, student_buckets.length])
                           .range([height, margins.top])
            yAxis = d3.axisRight(yScale)
                          .ticks(student_buckets.length);

            var groups = svg.selectAll('g.student, g.selected')
                            .data(student_buckets);

            groups.exit()

            groups.transition().duration(1000).ease(easing[1]).attr('class', 'student').attr('transform', 'translate(' + 0 + ',0)').each(function(student_bucket, bucket_index){
              console.log("Bucket:", student_bucket);
              var group = d3.select(this);
              var rects = group.selectAll('rect').attr('class', 'changes')
                               .data(student_bucket)
              rects.exit()


              rects.attr('class', 'FadeIn').transition().duration(500).ease(easing[8])
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
                      return colors[0]
                    }else if(change > 0){
                      return colors[1]
                    }else if(change == 0){
                      return colors[2]
                    };
                  }).on('end', function(){
                      transitioning = false;
                  })

                  group.selectAll('rect.changes, rect.NewStretch, rect.opaque_leaving').attr('class', 'FadeAway');
            })
         }
         object.attr('height', span_height/objects.length)
               .attr('y', (obj_index * (span_height/objects.length) + span_margins.top))
               .on('mouseover', function(){
                 var offset = 30;
                 var y = 0;
                 if (obj_index == 0){
                   y = ((obj_index * (span_height/objects.length) + span_margins.top) - offset)
                 }else{
                   y = (obj_index * (span_height/objects.length) + span_margins.top)
                 }
                 object.transition().duration(100)
                       .attr('x', 0)
                       .attr('y', y)
                       .attr('width', span_tweeker_screen.width)
                       .attr('height', (span_height/objects.length) + offset)
               })
               .on('mouseout', function(){
                 object.transition().duration(300)
                       .attr('x', span_margins.left)
                       .attr('y', ((obj_index * (span_height/objects.length) + span_margins.top)))
                       .attr('width', span_width)
                       .attr('height', span_height/objects.length);
               })
               .on('click', throttleDebounce(click_func, 400))

       }else if(obj_array[0] == 'text'){
         new_height = bBox.height;
         object.text(obj_array[obj_array.length - 1]);
         object.attr('y', (obj_index * ((span_height/objects.length) + new_height) + span_margins.top + span_height * 0.175))
       }
     })
       // span_tweeker.append('image')
       //             .attr('x', span_margins.left)
       //             .attr('y', 0)
       //             .attr('xlink:href', hrefs[0])
       //             .attr('width', span_width)
       //             .attr('height', )
}


var throttleDebounce = function(func, time){
  var free = true;
  return function(){
    if (free){
      free = false;
      func.apply(this, arguments);
      setTimeout(function(){ free = true; }, time)
    }
  }
}






var draw_new_svg = function(data, student, averages){
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
  var universal_screen = {
    width:1000,
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
    width:universal_width*0.8,
    height:universal_height - universal_height*0.5
  }
  var colors = [
    '#004949', // Student
    '#24FF24', // Average
    '#006DDB', // Area Between Student & Average
    '#6DB6FF', // Dots color
    '#000000', // Tooltip color
    '#FFFFFF', // Tooltip text color
  ]
  var easing = [
    d3.easeElastic,
    d3.easeBounce,
    d3.easeLinear,
    d3.easeSin,
    d3.easeQuad,
    d3.easeCubic,
    d3.easePoly,
    d3.easeCircle,
    d3.easeExp,
    d3.easeBack
    ];
  var graph_margins = {
    top:graph_size.height*0.05,
    bottom:graph_size.height*0.05,
    left:graph_size.width*0.05,
    right:graph_size.width*0.15
  }
  var graph_width = graph_size.width - graph_margins.left - graph_margins.right;
  var graph_height = graph_size.height - graph_margins.top - graph_margins.bottom;
  var graph = svg.append('g')
                 .classed('graph', true)
                 .attr('transform', 'translate(' + universal_margins.left + ',' + (universal_margins.top + (universal_height * 0.5)) + ')')
  var xScale = d3.scaleLinear()
                 .domain([1, data.length])
                 .range([graph_margins.left, graph_width])
  var xAxisScale = d3.scaleLinear()
                     .domain([1, d3.max(data, function(d, i){ return d.max_day; })])
                     .range([graph_margins.left, graph_width])
  var xAxis = d3.axisTop(xAxisScale)
                .ticks(data.length);
  // var yScale = d3.scaleLinear()
  //                .domain([d3.min(data, function(d,i){ return d.total_change; }), d3.max(data, function(d,i){ return d.total_change; })])
  //                .range([graph_height, graph_margins.top])
  var yScale = d3.scaleLinear()
                 .domain([0, 100])
                 .range([graph_height, graph_margins.top])
  var yAxis = d3.axisRight(yScale)
                .ticks(6)

  var drawArea = d3.area()
                   .curve(d3.curveCatmullRom.alpha(0))
                   .x(function(d, i){ return xScale(i+1); })
                   .y0(function(d, i){ return yScale(averages[i]); })
                   .y1(function(d, i){ return yScale(d.total_percentage); })
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
                    .y(function(d, i){ return yScale(d.total_percentage); })
                    .curve(d3.curveCatmullRom.alpha(0));
                    // ['#ea6b5d', 'Decrease in Total Percentage'],
                    // ['#5dea75', 'Increase in Total Percentage'],
                    // ['#918988', 'No Change in Total Percentage']
    var drawAverage = d3.line()
                        .x(function(d, i){ return xScale(i + 1); })
                        .y(function(d, i){ return yScale(d);})
                        .curve(d3.curveCatmullRom.alpha(0));

   var area_graph = graph.append('path')
                         .datum(data)
                         .attr('d', drawArea)
                         .attr('fill', function(d, i){
                           return colors[2]
                         })
                         .classed('hidden', true);
  graph.append('g')
       .classed('xAxis', true)
       .attr('transform', 'translate(0,' + (graph_height + graph_margins.top) + ')')
       .call(xAxis)

   graph.append('g')
        .classed('yAxis', true)
        .attr('transform', 'translate('+ graph_margins.left*0.1 +',0)')
        .call(yAxis)

   var labels = [
     ['Days', 'translate('+graph_width/2+","+(graph_height+graph_margins.top+graph_margins.bottom+5)+")"],
     ['Total Percent Change', 'translate('+(-graph_margins.left*0.5)+","+graph_height*(3/4)+") rotate(-90)"]
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
                   .attr('cy', function(d, i){ return yScale(d.total_percentage); })
                   .attr('r', 5)
                   .attr('fill', colors[3])
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
                     circle.transition().duration(100).ease(easing[7]).attr('r', 10);
                     var cx = circle.attr('cx');
                     var cy = circle.attr('cy');
                     var mouse = d3.mouse(this);
                     var tooltip = graph.append('g')
                                        .classed('tooltip', true) // Before: (0 - (universal_height * 0.6))   After: (-universal_height * 0.1)
                                        .attr('transform', 'translate('+graph_width * 0.5+','+(-universal_height)+')');

                     var rect = tooltip.append('rect')
                                       .attr('class', 'hidden')
                                       .attr('x', 0)
                                       .attr('y', 0)
                                       .attr('width', tooltip_size.width)
                                       .attr('height', tooltip_size.height)
                                       .attr('fill', colors[4])
                      var texts = [
                        'Day '+d.span[0] + " – Day "+d.span[1],
                        'Total Percent:'+d.total_percentage,
                        'Total Percent Impacts:',
                        'Quiz: '+d.average_changes.quizes,
                        'Homework: '+d.average_changes.homework,
                        'Test: '+d.average_changes.test,
                        'Final: '+d.average_changes.final
                      ]
                      tooltip.selectAll('text')
                             .data(texts)
                             .enter()
                             .append('text')
                             .attr('class', 'hidden')
                             .attr('x', tooltip_margins.left)
                             .attr('y', function(d, i){
                               return (i + 1) * (tooltip_height/texts.length);
                             })
                             .text(function(d, i){ return d; })
                             .attr('stroke', colors[5])

                      tooltip.transition()
                             .duration(1000)
                             .ease(easing[1])
                             .attr('transform', 'translate('+graph_width * 0.5+','+(-universal_height * 0.1)+')')
                             .on('start', function(){
                               tooltip.selectAll('text, rect')
                                      .attr('class', 'NewStretch');
                             })
                   })
                   .on('mouseout', function(d, i){
                     var circle = d3.select(this);
                     circle.transition().duration(100).ease(easing[6]).attr('r', 5);
                     var tooltip = graph.selectAll('g.hidden, g.tooltip')
                                        .transition()
                                        .duration(1000)
                                        .ease(easing[2])
                                        .attr('transform', 'translate('+graph_width * 0.5+','+(-universal_height)+')')
                                        .on('start', function(){
                                          tooltip.selectAll('text, rect')
                                                 .attr('class', 'FadeAway');
                                        })


                   })
       var line_thickness = 2;
       var line_graph = graph.append('path')
                           .datum(data)
                           .attr('d', drawLine)
                           .attr('stroke-width', line_thickness)
                           .attr('stroke', colors[0])
                           .attr('fill', 'none')
       var average_line = graph.append('path')
                            .datum(averages)
                            .attr('d', drawAverage)
                            .attr('stroke-width', line_thickness)
                            .attr('stroke', colors[1])
                            .attr('fill', 'none')
       var text_options_sizes = {
         width:universal_width,
         height:universal_height*0.45 - universal_height*0.35
       }
       var options_panel = svg.append('g')
                              .classed('optionsPanel', true)
                              .attr('transform', 'translate('+universal_margins.left+","+universal_height*0.4+")")

      var text_options = [
        ['Line Graph', function(){ line_graph.classed('hidden',false);  area_graph.classed('hidden', true);  d3.selectAll('#changable').classed('hidden', true); }],
        ['Area Graph', function(){ line_graph.classed('hidden',true);  area_graph.classed('hidden', false); d3.selectAll('#changable').classed('hidden', false);}],
        ['Line & Area Graph', function(){line_graph.classed('hidden', false);   area_graph.classed('hidden', false); d3.selectAll('#changable').classed('hidden', false);}]
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
                             .duration(250)
                             .ease(easing[2])
                             .attr('font-size', 28)
                             .attr('fill', 'blue')
                   })
                   .on('mouseout', function(d, i){
                     var text_obj = d3.select(this);
                     text_obj.transition()
                             .duration(150)
                             .ease(easing[2])
                             .attr('font-size', 24)
                             .attr('fill', 'black')
                   })

    var legend_size = {
      width:universal_screen.width - universal_width,
      height:graph_height * 0.5 - graph_margins.top
    }
    var legend_margins = {
      left:legend_size.width*0.05,
      top:legend_size.height*0.05,
      bottom:legend_size.height*0.05,
      right:legend_size.width*0.05
    }
    var legend_height = legend_size.height - legend_margins.top - legend_margins.bottom;
    var padding = 5;
    var legend_width = legend_size.width - legend_margins.left - legend_margins.right;
    var legend = svg.append('g')
                    .attr('transform', 'translate('+graph_size.width+','+(universal_margins.top + (universal_height * 0.5) +graph_margins.top)+')')
                    .classed('Legend', true)
    var text_colors = [
      [colors[1], 'Average Line'],
      [colors[0], 'Student Line'],
      [colors[2], 'Change From Class Average']
    ]
    legend.selectAll('rect')
          .data(text_colors)
          .enter()
          .append('rect')
          .attr('x', legend_margins.left)
          .attr('y', function(d, i){
            return (i * (legend_margins.bottom + (legend_height/text_colors.length))) + legend_margins.top
          })
          .attr('height', (legend_height/text_colors.length))
          .attr('width', legend_width * 0.5)
          .attr('fill', function(d,i){
            return d[0];
          })
          .each(function(d, i){
            var rect = d3.select(this);
            var text = legend.append('text')
                             .attr('x', legend_width * 0.6)
                             .attr('y', ((i * (legend_margins.bottom + (legend_height/text_colors.length))) + legend_margins.top)+((legend_height/text_colors.length)/2))
                             .text(d[1]);
            if (d[1] == 'Change From Class Average'){
                text.attr('id', 'changable')
                text.classed('hidden', true)
            }
          })
          .attr('id', function(d, i){
            if (d[1] == 'Change From Class Average'){
              return 'changable'
            }})
          .attr('class', function(d, i){
            if (d[1] == 'Change From Class Average'){
              return 'hidden'
            }})
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
var average_grades = function(weights_for_categories, dataset, day){
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
var return_all_difference_averages = function(array, prop){
  var total = 0;
  array.forEach(function(d, i){
    var next_array = array[i + 1];
    var current_array = array[i];
    if (next_array && current_array){
      var difference = next_array[prop] - current_array[prop];
      total += (difference||0);
    }
  })
  var average =  total/array.length;
  return average;
}
var day_span_change = function(student, data, day_span, grades){ // Returns an array of the following format:
                                    // [Total Percentage Change, Weight Change From Day_Span[0] to Day_Span[1]]
    var dataset = data[student];
    var averages = [];
    var weights_for_categories = {
      final:0.3,
      homework:0.15,
      quizes:0.15,
      test:0.4
    }
    var max_day = data[student].final[data[student].final.length - 1].day;
    if (day_span[day_span.length - 1] > max_day){
      day_span[day_span.length - 1] = max_day;
    }
    for (var day = day_span[0]; day <= day_span[1]; day++){
      var average = average_grades(weights_for_categories, dataset, day);
      averages.push(average);
    }
    var quantifier = 100;
    var average_changes = {
      final:Math.round((return_all_difference_averages(averages, 'final'))*quantifier)/quantifier,
      homework:Math.round((return_all_difference_averages(averages, 'homework'))*quantifier)/quantifier,
      quizes:Math.round((return_all_difference_averages(averages, 'quizes'))*quantifier)/quantifier,
      test:Math.round((return_all_difference_averages(averages, 'test'))*quantifier)/quantifier
    }
    var average_needed = averages[averages.length - 1];
    var total_weight_missing = 0;
    for (var prop in average_needed){
      if (average_needed.hasOwnProperty(prop)){
        var val = average_needed[prop];
        if (val == 0){
          total_weight_missing += weights_for_categories[prop];
        }
      }
    }
    var total_percentage = Math.round((((object_summer(average_needed)*quantifier)/quantifier)+(100 * total_weight_missing))*quantifier)/quantifier;
    var total_percentage_change = Math.round((object_summer(average_changes)) * quantifier)/quantifier;
    return {average_changes:average_changes, total_change:total_percentage_change, span:day_span, max_day:max_day, total_percentage:total_percentage}
}
