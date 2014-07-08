'use strict';
angular.module('myChartingApp', ['ui.chart']).controller('ChartCtrl', function ($scope,$window, charting) {
      $scope.someData = [[
        ['Heavy Industry', 12],['Retail', 9], ['Light Industry', 14],
        ['Out of home', 16],['Commuting', 7], ['Orientation', 9]
      ]];

 $scope.data = [[
      ['Heavy Industry', 12],['Retail', 9], ['Light Industry', 14], 
      ['Out of home', 16],['Commuting', 7], ['Orientation', 9]
    ]];
    $scope.chartOptions = { 
      seriesDefaults: {
        // Make this a pie chart.
        renderer: $window.jQuery.jqplot.BarRenderer, 
        rendererOptions: {
          // Put data labels on the pie slices.
          // By default, labels show the percentage of the slice.
          showDataLabels: true
        }
      }, 
      legend: { show:true, location: 'e' }
    };

    });