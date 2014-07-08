'use strict';

var express = require('express');
var app = express();
app.use(express.static(__dirname + '/public/system'));

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    passport = require('passport'),
    logger = require('mean-logger');

var Schema = mongoose.Schema;
//var ObjectId = Schema.ObjectId;
var Factory = require('./module.factory.js');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Initializing system variables
var config = require('./server/config/config');
var db = mongoose.connect(config.db);

var factory = new Factory(Schema,mongoose);
factory.createSchemas();
//factory.insertSalesTeam();


// Bootstrap Models, Dependencies, Routes and the app as an express app
var app = require('./server/config/system/bootstrap')(passport, db);

app.get('/person/ananth', function(req, res) {
     factory.getSalesPerson({name:'Ananth Subramanya'},res);
});

app.get('/validate', function(req, res) {
     factory.getSalesPerson({email: new RegExp('^'+req.param('email') +'$', 'i')},res);
});

app.get('/person/piyush', function(req, res) {
     factory.getSalesPerson({name:'Piyush Swain'},res);
});

app.get('/person/nalin', function(req, res) {
     factory.getSalesPerson({name:'Nalin Tiwari'},res);
});

app.get('/person/all', function(req, res) {
     factory.getSalesPerson({},res);
});

app.get('/region/all', function(req, res) {
     factory.getSalesRegion('region',{},res);
});

app.get('/customer/all', function(req, res) {
     factory.getCustomer({},res);
});

app.post('/activities/all', function(req, res) {
	var selSalesPersonId = req.param('salesPerson').email;
	var selWeek=req.param('week');
	var selYear=parseInt(req.param('year'));
     factory.getActivities({salesperson:selSalesPersonId,week:selWeek,year:selYear},res);
});

app.post('/activities/report', function(req, res) {
	var weekStart = req.param('weekStart');
	var weekEnd=req.param('weekEnd');
	var salesList=req.param('salesList');
	console.log('salesLength ' +salesList.length);
	console.log('isArray ' +Array.isArray(salesList));
    factory.getTop5Report(salesList,weekStart.substring(0,4),weekStart.substring(6,8),weekEnd.substring(0,4),weekEnd.substring(6,8),res,
		function(top5,res)
		{
			var fireOthers=false;
			if(top5.length>5)
			{
				fireOthers=true;
				top5=top5.slice(0,5);
			}
			var toClientNames=[];
			for (var t5cnt=0;t5cnt<top5.length ; t5cnt++)
			{
				toClientNames[t5cnt]=top5[t5cnt]._id;
			}
			toClientNames.push('freetime');
			toClientNames.push('solution');
			console.log('Top 5...' + toClientNames);
			//After Last five
			factory.getLastReport(fireOthers,salesList,weekStart.substring(0,4),weekStart.substring(6,8),weekEnd.substring(0,4),weekEnd.substring(6,8),top5,toClientNames,res,
				function(lastresult,res)
				{
					console.log('Others..' + lastresult.length);
					//Start solution and freetime
					factory.getSolFreetime(salesList,weekStart.substring(0,4),weekStart.substring(6,8),weekEnd.substring(0,4),weekEnd.substring(6,8),lastresult,res,
						function(combinedresult,res)
						{
							console.log('combined..' + combinedresult.length);
							res.json(combinedresult);
						}
						
					);

					//End Solution and freetime
					//res.json(lastresult);
				}
				
			);

			//After Last Five end
		}
		
	);
	
});

app.post('/customer/create', function(req, res) {
	console.log('here in create' + req.body.clientName);
	factory.insertCustomer(req.body.clientName,req.body.contactName,req.body.clientPhone,req.body.clientEmail,res);
  });

app.post('/activity/create', function(req, res) {
	console.log('activity....post');
	factory.initActivities(req.param('salesPerson').email,req.param('week'),req.param('year'),req,res,function(req,res){
			if (req.param('solution'))
			{
				factory.upsertActivities('solution',req.param('salesPerson').email,req.param('week'),req.param('year'),req.param('solution'));
			}
			if (req.param('freetime'))
			{
				factory.upsertActivities('freetime',req.param('salesPerson').email,req.param('week'),req.param('year'),req.param('freetime'));
			}
			for(var i=0;i<req.body.count;i++)
			{
				if(req.param('clientName'+i)!==undefined && req.param('clientName'+i)!==null && req.param('clientName'+i).trim()!=='')
				{
					console.log(req.param('clientName'+i));
					console.log(req.param('salesPerson').name);
					console.log(req.param('week'));
					console.log(req.param('year'));
					console.log(req.param('hours'+i));
					factory.insertCustomer(req.param('clientName'+i));
					factory.upsertActivities(req.param('clientName'+i),req.param('salesPerson').email,req.param('week'),req.param('year'),req.param('hours'+i));
				}
			}
		}
	);
	res.json('Activties recorded successfully...');
  });


app.get('/person/mongoose', function(req, res) {
    res.send(mongoose.modelNames());
});

// Start the app by listening on <port>, optional hostname
app.listen(config.port, config.hostname);
console.log('Mean app started on port ' + config.port + ' (' + process.env.NODE_ENV + ')');

// Initializing logger
logger.init(app, passport, mongoose);

// Expose app
exports = module.exports = app;
