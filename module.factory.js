'use strict';

var Factory = function(Schema,mongoose) {

	this.Schema = Schema;
	this.mongoose = mongoose;
	this.Item = null;

	this.createSchemas = function() {
		var SalesPersonSchema=null;
		SalesPersonSchema = new this.Schema({
			name: String,
			email: String,
			phone: String,
			region:String
		});

		this.SalesPerson = mongoose.model('SalesPerson',SalesPersonSchema);

		var ClientSchema=null;
		ClientSchema = new this.Schema({
			name: String,
		});

		this.ClientMaster = mongoose.model('ClientMaster',ClientSchema);

		var ActivitySchema=null;
		ActivitySchema = new this.Schema({
			clientname: String,
			salesperson: String,
			week: Number,
			hours: Number,
			year:Number
		});

		this.Activity = mongoose.model('Activities',ActivitySchema);
	};
	 
	this.insertSalesTeam = function() {

		var SalesPerson=this.SalesPerson;
		this.SalesPerson.find({email:'ananth.subramanya@hcl.com'},function(error,output){
			if(output===undefined || output.length===0)
			{
				var ananth = new SalesPerson({
				name: 'Ananth Subramanya',
				email: 'ananth.subramanya@hcl.com',
				phone: '12345',
				region: 'TRISTATE'
				}); 
				ananth.save();
				console.log('ananth');
			}
			else if(output.length>1)
			{
				SalesPerson.remove({email:'ananth.subramanya@hcl.com'}, function (err) {
				  console.log('removed');
				  // removed!
				});
			}

		});
		
		this.SalesPerson.find({email: 'piyush.swain@hcl.com'},function(error,output){
			console.log('here' + output);
			if(output===undefined || output.length===0)
			{
				var piyush = new SalesPerson({
					name: 'Piyush Swain',
					email: 'piyush.swain@hcl.com',
					phone: '12345',
					region: 'NORTH-EAST'
				});  
				piyush.save();
				console.log('piyush');
			}
			else if(output.length>1)
			{
				SalesPerson.remove({email: 'piyush.swain@hcl.com'}, function (err) {
				  console.log('removed');
				  // removed!
				});
			}
		});

		this.SalesPerson.find({email: 'nalin.tiwari@hcl.com'},function(error,output){
			console.log('here' + output);
			if(output===undefined || output.length===0)
			{
				var nalin = new SalesPerson({
					name: 'Nalin Tiwari',
					email: 'nalin.tiwari@hcl.com',
					phone: '12345',
					region: 'SOUTH-EAST'
				});  
				nalin.save();
				console.log('nalin');
			}
			else if(output.length>1)
			{
				SalesPerson.remove({email: 'nalin.tiwari@hcl.com'}, function (err) {
				  console.log('removed');
				  // removed!
				});
			}
		});
	};

	this.insertCustomer = function(client) {

		console.log('create Customer' + client);
		var ClientMaster=this.ClientMaster;
		
		this.ClientMaster.find({name:client},function(error,output){
			console.log('create Customer' + output);
			if(output===null || output.length===0)
			{
				var customer = new ClientMaster({
				name: client
				}); 
				customer.save();
				output='Customer Created Successfully';
				console.log('Customer Saved');
			}
			else 
			{
				output='Customer already exists!!';
				console.log('Customer exists');	
			}
		});

	};


	this.upsertActivities = function(clientName,salesperson,week,year,hours) {

		console.log('upsert activity' + clientName);
		var Activity=this.Activity;
		var result=null;
		result= Activity.update({clientname:clientName,salesperson:salesperson,week:week,year:year},{$set:{clientname:clientName,salesperson:salesperson,week:week,hours:hours,year:year}},{upsert: true},function(){});
		console.log('Activities Saved' + result.nUpserted);
		};

this.initActivities = function(salesperson,week,year,req,res,func) {

		console.log('init activity for ' + salesperson + ' ' + week + ' ' + year);
		var Activity=this.Activity;
		var result=null;
		result= Activity.remove({salesperson:salesperson,week:week,year:year},function(){});
		console.log('Activities initialized' + result.nUpserted);
		return func(req,res);

		};

	this.getCustomer = function(query,res) {

		this.ClientMaster.find(query,function(error,output) {
			res.json(output);
		});
	};
	
	this.getSalesPerson = function(query,res) {
		
	this.SalesPerson.find(query,function(error,output) {
			res.json(output);
		});
	};

	this.getSalesRegion = function(field,query,res) {
		
	this.SalesPerson.distinct(field,query,function(error,output) {
			res.json(output);
		});
	};

	this.getActivities = function(query,res) {
		
	this.Activity.find(query,function(error,output) {
			console.log('getActivities ' + JSON.stringify(query));
			console.log('getActivities ' + output);
			res.json(output);
		});
	};

	this.getTop5Report = function(salesList,startYr,startWk,endYr,endWk,res,resultSet)
	{
		this.Activity.aggregate
		(
			[
		        { $match:
					{
						
						$or:[
								{
								  $and:[	
										{clientname:{$nin:['solution','freetime']},year:parseInt(startYr),week:{$gte:parseInt(startWk)}},
										{clientname:{$nin:['solution','freetime']},year:parseInt(endYr),week:{$lte:parseInt(endWk)}},
										{salesperson:{$in:salesList}}
									  ]
								},
								{clientname:{$nin:['solution','freetime']},year:{$gt:parseInt(startYr),$lt:parseInt(endYr)},salesperson:{$in:salesList}},
								{clientname:{$nin:['solution','freetime']},year:{$gt:parseInt(startYr),$in:[parseInt(endYr)]},week:{$lte:parseInt(endWk)},salesperson:{$in:salesList}},
								{clientname:{$nin:['solution','freetime']},year:{$lt:parseInt(endYr),$in:[parseInt(startYr)]},week:{$gte:parseInt(startWk)},salesperson:{$in:salesList}}										
							]
						
					}
				},
				{ $group: 
					{
						_id: '$clientname',
						hours: { $sum: '$hours'  }
					}
				},
				{ $sort : {hours:-1} }
				//,{ $limit : 5 }
			], 
			function (err, result) 
			{
		        if (err) 
				{
		            console.log(err);
					return;
				}
				return resultSet(result,res);
			}
		);
	};

	this.getLastReport = function(fireOthers,salesList,startYr,startWk,endYr,endWk,top5,filter,res,resultSet)
	{
		if(fireOthers)
		{
			this.Activity.aggregate
			(
				[
					{ $match:
						{
							
							$or:[
									{
									  $and:[	
											{clientname:{$nin:filter},year:parseInt(startYr),week:{$gte:parseInt(startWk)}},
											{clientname:{$nin:filter},year:parseInt(endYr),week:{$lte:parseInt(endWk)}},
											{salesperson:{$in:salesList}}
										  ]
									},
									{clientname:{$nin:filter},year:{$gt:parseInt(startYr),$lt:parseInt(endYr)},salesperson:{$in:salesList}},
									{clientname:{$nin:filter},year:{$gt:parseInt(startYr),$in:[parseInt(endYr)]},week:{$lte:parseInt(endWk)},salesperson:{$in:salesList}},
									{clientname:{$nin:filter},year:{$lt:parseInt(endYr),$in:[parseInt(startYr)]},week:{$gte:parseInt(startWk)},salesperson:{$in:salesList}}
								]
							
						}
					},
					{ $group: 
						{
							_id: null,
							hours: { $sum: '$hours'  }
						}
					},
				], 
				function (err, result) 
				{
					if (err) 
					{
						console.log(err);
						return resultSet(top5,res);
					}
					console.log('result'+ result);
					result[0]._id='OTHERS';
					return resultSet(top5.concat(result),res);
				}
			);
		}
		else
			return resultSet(top5,res);

	};

	this.getSolFreetime = function(salesList,startYr,startWk,endYr,endWk,lastresult,res,resultSet)
	{
		console.log(startWk);
		console.log(startYr);
		console.log(endWk);
		console.log(endYr);
		this.Activity.aggregate
		(
			[
		        { $match:
					{
						
						$or:[
								{
								  $and:[	
										{clientname:{$in:['solution','freetime']},year:parseInt(startYr),week:{$gte:parseInt(startWk)}},
										{clientname:{$in:['solution','freetime']},year:parseInt(endYr),week:{$lte:parseInt(endWk)}},
										{salesperson:{$in:salesList}}
									  ]
								},
								{clientname:{$in:['solution','freetime']},year:{$gt:parseInt(startYr),$lt:parseInt(endYr)},salesperson:{$in:salesList}},
								{clientname:{$in:['solution','freetime']},year:{$gt:parseInt(startYr),$in:[parseInt(endYr)]},week:{$lte:parseInt(endWk)},salesperson:{$in:salesList}},
								{clientname:{$in:['solution','freetime']},year:{$lt:parseInt(endYr),$in:[parseInt(startYr)]},week:{$gte:parseInt(startWk)},salesperson:{$in:salesList}}									
							]
						
					}
				},
				{ $group: 
					{
						_id: '$clientname',
						hours: { $sum: '$hours'  }
					}
				},
			], 
			function (err, result) 
			{
		        if (err) 
				{
		            console.log(err);
					return;
				}
				return resultSet(lastresult.concat(result),res);
			}
		);
	};


};

module.exports = Factory;