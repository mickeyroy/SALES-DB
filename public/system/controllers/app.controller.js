'use strict';
var myApp =  angular.module('mean.system',['ui.chart']); 

myApp.controller('myAppController',['$scope','$window','$http', function ($scope,$window, $http, myAppService) { 
  	$scope.people = [];
	$scope.myForm={};
	$scope.radioModel = 'Data';
    $scope.init = function() { 
		
    	//$http.get('http://localhost:3000/person/all').then(function(result) { $scope.people = result.data; });
		$http.get('person/all').then(function(result) { $scope.people = result.data; });
		$scope.myForm.label1='P&E Solutions';
		$scope.myForm.label2='Idle Time';
    } ;

    $scope.init(); 


    $scope.customers = [];

    $scope.onedit = function() { 
		
    	$http.get('customer/all').then(function(result) { $scope.customers = result.data; });
    } ;
	//$scope.onedit();

	$scope.clientHours=[{id: 'client0'}];

	$scope.addNewEntry = function() {
	  
	  var newItemNo = $scope.clientHours.length;
		$scope.clientHours.push({'id':'client'+newItemNo});
		$scope.myForm['clientName' + newItemNo].focus();
	};

	$scope.removeEntry = function(index) {

		for (var shiftIndex=index;shiftIndex<$scope.clientHours.length;shiftIndex++)
		{
			$scope.myForm['clientName' + shiftIndex]=$scope.myForm['clientName' + (shiftIndex+1)];
			$scope.myForm['hours' + shiftIndex]=$scope.myForm['hours' + (shiftIndex+1)];
		}
		$scope.clientHours.splice(index,1);
	};



 $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

   $scope.dateRange=[];

  for(var i=0;i<7;i++)
	$scope.dateRange[i]=new Date(  $scope.dt.getTime() + i*24*60*60*1000);
 
  $scope.setWeek = function() {
  for(var j=0;j<7;j++)
		$scope.dateRange[j]=new Date(  $scope.dt.getTime() + j*24*60*60*1000);
  };

 $scope.showCreateClient = false;

$scope.customers=[];
$scope.getcustomers = function () {
    $http.get('customer/all').then(function(result) { $scope.customers = result.data; });
  };
$scope.getcustomers();

$scope.range = function(min, max, step){
    step = (step === undefined) ? 1 : step;
    var input = [];
    for (var i = min; i <= max; i += step) input.push(i);
    return input;
  };

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();

  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

$scope.myForm.submitTheForm = function(item, event) {

	$scope.myForm.dt=$scope.dt;
	$scope.myForm.count=$scope.clientHours.length;
	/*$scope.myForm.week=$scope.dt.getWeek();
	$scope.myForm.year=$scope.dt.getWeekYear();*/
	$scope.myForm.week=$scope.weekPick.substring(6,8);
	$scope.myForm.year=$scope.weekPick.substring(0,4);

	var createActivityrequest = $http({
            method : 'POST',
            url : '/activity/create',
            data : $scope.myForm
        });
		createActivityrequest.then(
			function(response) { alert(response.data);  
								$scope.getcustomers();
								$scope.getActivities();
								},
			function(response) { alert(response.data); });
		
		
       };

  $scope.initDate = new Date('2016-15-20');
  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];


  /**
 * Get the ISO week date week number
 */
Date.prototype.getWeek = function () {
	// Create a copy of this date object
	var target  = new Date(this.valueOf());

	// ISO week date weeks start on monday
	// so correct the day number
	var dayNr   = (this.getDay() + 6) % 7;

	// ISO 8601 states that week 1 is the week
	// with the first thursday of that year.
	// Set the target date to the thursday in the target week
	target.setDate(target.getDate() - dayNr + 3);

	// Store the millisecond value of the target date
	var firstThursday = target.valueOf();

	// Set the target to the first thursday of the year
	// First set the target to january first
	target.setMonth(0, 1);
	// Not a thursday? Correct the date to the next thursday
	if (target.getDay() !== 4) {
		target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
	}

	// The weeknumber is the number of weeks between the 
	// first thursday of the year and the thursday in the target week
	return 1 + Math.ceil((firstThursday - target) / 604800000); // 604800000 = 7 * 24 * 3600 * 1000
};

/**
* Get the ISO week date year number
*/
Date.prototype.getWeekYear = function () 
{
	// Create a new date object for the thursday of this week
	var target	= new Date(this.valueOf());
	target.setDate(target.getDate() - ((this.getDay() + 6) % 7) + 3);
	
	return target.getFullYear();
};

String.prototype.lpad = function(padString, length) 
{
	var str = this;
    while (str.length < length)
        str = padString + str;
    return str;
};


 $scope.weekPick = $scope.dt.getWeekYear()+'-W' + $scope.dt.getWeek().toString().lpad('0',2);

$scope.getActivities = function () {

		$scope.clearForm();
		if($scope.myForm.salesPerson)
		{

		$scope.myForm.week=$scope.weekPick.substring(6,8);
		$scope.myForm.year=$scope.weekPick.substring(0,4);

		var getActivitiesrequest = $http({
				method : 'POST',
				url : 'activities/all',
				data : $scope.myForm
			});
			getActivitiesrequest.then(
				function(response) { 
				var actData=response.data;
				var isFree=false;
				var isSolution=false;

					if(actData.length>0)
					{
						$scope.clientHours=[]; 
						for(var k=0;k<actData.length;k++)
						{
							 if(actData[k].clientname==='freetime' )
							 {
								 $scope.myForm[actData[k].clientname]=actData[k].hours;
								 isFree=true;
							 }
							 else if (actData[k].clientname==='solution')
							 {
								 $scope.myForm[actData[k].clientname]=actData[k].hours;
								 isSolution=true;
							 }
							 else
							 {
								  var newItemNo = $scope.clientHours.length;
								 $scope.clientHours.push({'id':'client'+newItemNo});
								 $scope.myForm['clientName' + newItemNo]=actData[k].clientname;
								 $scope.myForm['hours' + newItemNo]=actData[k].hours;
							 }
						}
					}
					else
					{
						$scope.clientHours=[{id: 'client0'}];
						 $scope.myForm['clientName' + 0]='';
						 $scope.myForm['hours' + 0]='';
						 $scope.myForm.freetime='';
						 $scope.myForm.solution='';
					}
					if (isFree===true && isSolution===true && actData.length===2)
					{
						 $scope.clientHours=[{id: 'client0'}];
						 $scope.myForm['clientName' + 0]='';
						 $scope.myForm['hours' + 0]='';
					}

					if(isFree===false)
						$scope.myForm.freetime='';
					if(isSolution===false)
						 $scope.myForm.solution='';
				},
				function(response) { alert('ERROR'); });
		}
		//end if 
    };
	
   $scope.clearForm = function() {

	   for(var m=0;m<$scope.clientHours.length;m++)
		{
		 $scope.myForm['clientName' + m]='';
		 $scope.myForm['hours' + m]='';
		}
		$scope.clientHours=[{id: 'client0'}];
  };

 $scope.postLogin=false;

  $scope.loginEnter = function(ev) 
	{
	  if (ev.which===13)
		$scope.login();

  };

  $scope.login = function() 
	{
	 var validateLogin = $http({
		url: '/validate', 
	    method: 'GET',
		params: {email:$scope.loginEmail}
		});

		validateLogin.then(
			function(response) {
								if(response.data===undefined || response.data===null || response.data.length===0 || response.data[0].email==='')
								{	
									alert('Invalid Login');
									 $scope.postLogin=false;
								}
								else
								{
									$scope.myForm.salesPerson=response.data[0];
									$scope.getActivities();
									$scope.postLogin=true;
								}
			},
			function(response) { alert(response.data);  $scope.postLogin=false;});
 };

   $scope.logout = function() 
	{
	 $scope.myForm.salesPerson=null;
	$scope.loginEmail='';
	 $scope.postLogin=false;
  };

/**********removce********/
////////////
$scope.reportForm={};
$scope.reportForm.weekStart = $scope.dt.getWeekYear()+'-W' + $scope.dt.getWeek().toString().lpad('0',2);
$scope.reportForm.weekEnd = $scope.dt.getWeekYear() +'-W' + ($scope.dt.getWeek()+1).toString().lpad('0',2);
$scope.regions=[];
$http.get('region/all').then(function(result) { $scope.regions = result.data; });
//Initialize barchart
$scope.setBarChart = function () 
 {
	$scope.ticks=[];
	$scope.data=[];
	$scope.reportForm.salesList=[];
	if($scope.reportForm.salesPerson===undefined || $scope.reportForm.salesPerson===null)
	{
		if($scope.reportForm.salesRegion===undefined || $scope.reportForm.salesRegion===null)
		{
			for(var i=0;i<$scope.people.length;i++)
			{
				$scope.reportForm.salesList[i]=$scope.people[i].email;
			}
		}
		else
		{
			for(var a=0;a<$scope.people.length;a++)
			{
				if($scope.people[a].region===$scope.reportForm.salesRegion)
					$scope.reportForm.salesList[a]=$scope.people[a].email;
			}
		}
	}
	else
	{
		$scope.reportForm.salesRegion=null;
		$scope.reportForm.salesList[0]=$scope.reportForm.salesPerson.email;
	}
	var getActivitiesrequest = $http({
		method : 'POST',
		url : 'activities/report',
		data : $scope.reportForm
		});
	getActivitiesrequest.then(function(result) 
	{ 
		var s1 = [];
	   for(var custCount=0;custCount<result.data.length;custCount++)
		{
			s1[custCount]= result.data[custCount].hours;
			$scope.ticks[custCount] = result.data[custCount]._id; 
		}
		$scope.data=[s1];
		$scope.chartOptions =  {
		animate: !$window.jQuery.jqplot.use_excanvas,
        seriesDefaults: {                
            renderer: $window.jQuery.jqplot.BarRenderer,
			rendererOptions: { 
			animation: {
                        speed: 700
                    },
			barWidth: 25,
            barPadding: -15,
            barMargin: 0,			
			},
            pointLabels: { show: true, location: 'e', edgeTolerance: -15 },            
			},            
        axes: {                
            xaxis: {                    
                renderer:$window.jQuery.jqplot.CategoryAxisRenderer,ticks: $scope.ticks                
            }            
        }        
	};
	$window.jQuery.jqplot.config.enablePlugins = true;
	});
   };

   //Initialize barchart end

}]);