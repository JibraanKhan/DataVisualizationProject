var dataPromise = d3.json('class.json');

function compare(a, b) {
   if (a[1] < b[1]) return -1;
   if (a[1] > b[1]) return 1;
   return 0;
 }

dataPromise.then(function(data){
  initialize(data);
},
function(error){
  console.log(error);
})

var initialize = function(dataset){
  var total_percentages = return_totals(dataset);
  var screen = {
    width:800,
    height:500,
  };
  var margins = {
    top:screen.height * 0.05,
    left:screen.width * 0.1,
    bottom:screen.height * 0.1,
    right:screen.width * 0.4,
  };
  var width = screen.width - margins.left - margins.right;
  var height = screen.height - margins.top - margins.bottom;
  var svg = d3.select('body')
              .append('svg')
              .attr('width', screen.width)
              .attr('height', screen.height);
  var all_students = svg.append('g')
                        .classed('Students', true);
  var xRange = d3.range(total_percentages.length);
  var xScale = d3.scaleBand()
                 .domain(xRange)
                 .rangeRound([margins.left, width])
                 .padding(0.05);
  var xScaleAxis = d3.scaleBand()
                 .domain(xRange.map(function(num){ return num+1; }))
                 .rangeRound([margins.left, width])
                 .padding(0.05);
  var xAxis = d3.axisTop(xScaleAxis)
                .ticks(total_percentages.length - 1);
  var yScale = d3.scaleLinear()
                 .domain([0, 100])
                 .range([height, margins.top]);
  var yAxis = d3.axisRight(yScale)
                .ticks(5);

  var rects = all_students.selectAll('rect')
                          .data(total_percentages)
                          .enter()
                          .append('rect')
                          .attr('y', function(d){
                            return yScale(d[1]);
                          })
                          .attr('x', function(d, i){
                            return xScale(i);
                          })
                          .attr('width', xScale.bandwidth())
                          .attr('height', function(d){
                            return height - yScale(d[1])
                          })
                          .attr('fill', function(d){
                            if (d[1] < 70){

                              return 'rgb(' + (118 + ((255-118) * d[1]/100)) +', 0, 0)';
                            }else{
                              return 'skyblue'; // 118, 208, 237
                            }
                          })
  var legend = all_students.append('g')
                           .classed('legend', true)
                           .attr('transform', 'translate(' + (screen.width - (margins.right)) + ',' + margins.top + ')')

  var color_text_pairs = [['red', 'Total Percentage < 70'], ['rgb(118, 208, 237)', 'Total Percentage >= 70']]
  var legend_screen = {
    width:screen.width - (screen.width - (margins.right)),
    height:(screen.height * 0.5)- margins.top
  }
  var legend_margins = {
    top:legend_screen.height*0.1,
    bottom:legend_screen.height*0.1,
    right:legend_screen.width*0.1,
    left:legend_screen.width*0.1,
  }
  var legend_width = legend_screen.width - legend_margins.left - legend_margins.right;
  var legend_height = legend_screen.height - legend_margins.top - legend_margins.bottom;
  var rects = legend.selectAll('rect')
                    .data(color_text_pairs)
                    .enter()
                    .append('rect')
                    .attr('x', legend_margins.left)
                    .attr('y', function(d, i){
                      return (((legend_margins.bottom * 0.5) + (legend_height/color_text_pairs.length)) * (i)) + legend_margins.top;
                    })
                    .attr('width', legend_width * 0.35)
                    .attr('height', legend_height/color_text_pairs.length)
                    .attr('fill', function(d){
                      return d[0];
                    })
                    .each(function(d, i){
                      var rect = this.getBBox();
                      var text = legend.append('text')
                                       .attr('x', legend_margins.left + rect.width + legend_width * 0.05)
                                       .attr('y', ((((legend_margins.bottom * 0.5) + (legend_height/color_text_pairs.length)) * (i)) + legend_margins.top) + rect.height/2)
                                       .text(d[1])
                    })

  all_students.append('g')
              .attr('transform', 'translate(' + 0 + ',' + ((height + margins.bottom) - 20) + ')')
              .classed('XAxis', true)
              .call(xAxis);
  all_students.append('text')
              .classed('XLabel', true)
              .attr('text-anchor', 'middle')
              .attr('transform', 'translate(' + width/2 + ',' + (height + margins.bottom) + ')')
              .text('Students')
  all_students.append('g')
              .attr('transform', 'translate(' + (margins.left - (margins.left * 0.3)) +','+ 0 + ')')
              .classed('yAxis', true)
              .call(yAxis);
  all_students.append('text')
              .classed('YLabel', true)
              .attr('text-anchor', 'middle')
              .attr('transform', 'translate(' + (margins.left * 0.5) +','+ screen.height/2 + ') rotate(-90)')
              .text('Total Percentage')
}




















var return_totals = function(data){ // Returns an array of the following format:
                                    // [Picture, Total Percentage]
  var totals = [];
  var quizzes_col = [];
  var finals_col = [];
  var homework_col = [];
  var tests_col = [];

  data.forEach(function(d){ // Loops through all the data points in order to fill in
                            // the totals array.
    var finals = d.final.map(function(set){ return set.grade; });
    var quizzes = d.quizes.map(function(set){ return set.grade; });
    var homeworks = d.homework.map(function(set){ return set.grade; });
    var tests = d.test.map(function(set){ return set.grade; });
    var maxes = [
      d.final[0].max * d.final.length,
      d.quizes[0].max * d.quizes.length,
      d.homework[0].max * d.homework.length,
      d.test[0].max * d.test.length
    ]
    var total_weights = {
      Finals:(((finals.reduce(function(total, current){
        return total + current;
      }))/maxes[0]) * 100) * 0.3,
      Quizzes:(((quizzes.reduce(function(total, current){
        return total + current;
      }))/maxes[1]) * 100) * 0.15,
      Homework:(((homeworks.reduce(function(total, current){
        return total + current;
      }))/maxes[2]) * 100) * 0.15,
      Tests:(((tests.reduce(function(total, current){
        return total + current;
      }))/maxes[3]) * 100) * 0.4,
    }
    var total_percentage = 0;
    for (var property in total_weights){
      if (total_weights.hasOwnProperty(property)){
        var val = total_weights[property];
        total_percentage += val;
      }
    }

    totals.push([d.picture, Math.round(total_percentage), total_weights])
  })

  return totals;
}

var return_weight = function(obtained_points, total_points, weight){
  //((Obtained Points/Total Points) * 100) * Weight
  return (((obtained_points/total_points) * 100) * weight)
}
