var dataPromise = d3.json('class.json')

dataPromise.then(function(data){
  initialize(data);
},
function(error){
  console.log(error);
})

var initialize = function(data){
  // var student_buckets = [];
  // data.forEach(function(d,i){
  //   var day_buckets = [];
  //   var max_days = d.final[0].day;
  //   for (var day = 0; day < max_days; day++){
  //     var arr_to_push = day_span_change(i, data, [day + 1, day + 2])
  //     arr_to_push.push([day+1, day+2]);
  //     day_buckets.push(arr_to_push)
  //   }
  //   student_buckets.push(day_buckets);
  // })
  // console.log(student_buckets)
  // var cumulative_grades = {
  //   final:undefined,
  //   homework:undefined,
  //   quiz:undefined,
  //   test:undefined
  // }
  // var grades = {
  //   // final:
  //   // homework:
  //   // quizzes:
  //   // tests:
  // };
  var weight_change = day_span_change(0, data, [1, 2])
  var total_percentage = object_summer(weight_change)
  console.log("Total Percentage:", total_percentage);
}










var object_summer = function(obj, day, dataset){
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
    console.log(d.day, day);
    if (d.day >= day){
      return;
    }
    grades_done++;
  })
  return grades_done;
}

var day_span_change = function(student, data, day_span, grades){ // Returns an array of the following format:
                                    // [Total Percentage Change, Weight Change From Day_Span[0] to Day_Span[1]]
    var dataset = data[student];
    var weights = [];
    var weights_for_categories = {
      final:0.3,
      homework:0.15,
      quizes:0.15,
      test:0.4
    }
    for (var day = day_span[0]; day <= day_span[1]; day++){
      var weight = return_weight(dataset, day);
      weights.push(weight);
    }
    var average = {
    };
    for (var property in weight){
      if (weight.hasOwnProperty(property)){
        var currentDaySum = return_days_sum(property, dataset, day_span[day_span.length - 1])
        var currentDayAverage = (((currentDaySum/(amount_of_current_grades(dataset, day_span[day_span.length - 1], property) * dataset[property][0].max)) * 100) *  weights_for_categories[property]);
        average[property] = currentDayAverage;
    }
    }
    console.log("Average:", average);
    var total_weight_change = {
      final:(weights[weights.length-1].final - weights[0].final)||0,
      homework:(weights[weights.length-1].homework - weights[0].homework)||0,
      quizes:(weights[weights.length-1].quizes - weights[0].quizes)||0,
      test:(weights[weights.length-1].test - weights[0].test)||0
    }

    return total_weight_change;
}
