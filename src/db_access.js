var mongojs = require('mongojs')

var collections = ['volunteer','events'];
var db = mongojs('mongodb://localhost:27017/vndb',collections);

//user fields 
var VOL_USERNAME = 'username';
var VOL_PASSWORD = 'password';
var VOL_NAME = 'name';
var VOL_PHONE = 'phone_num';
var VOL_IMG_FILE = 'ima_file';
//event fields
var EVENT_ORGANIZER = 'organizer';
var EVENT_TITLE = 'title';
var EVENT_DESCRIPtiON = 'desc';
var EVENT_LATITUDE = 'lat';
var EVENT_LONGITUDE = 'lon';
var EVENT_TIME = 'time';
var EVENT_CATEGORY = 'category';
var EVENT_VOL_NEEDED = 'volunteerNeeded';


db.volunteer.find(function (err, docs) {
	  if(err){ return console.log(err); }
	  console.log(docs);
	 // db.close();
});


exports.insertNewUser = function(username, password, name, phone_num, cb){
	console.log("Dodajem korisnika!");
	var user = {};
	user[VOL_USERNAME] = username;
	user[VOL_PASSWORD] = password;
	user[VOL_PHONE] = phone_num;
	user[VOL_NAME] = name;

	db.volunteer.insert(user,function(err){
		if(err) { 
			console.log(err);
			return cb(err); 
		}else{
			return cb();
		}
	});
};

/*
insertNewUser('test','123456',"Test Testovic", '060-554-448-4', 'fasfasvasvafa.jpg',function(err){
	if(err) console.log(err);
});*/


exports.isUsernameRegistered = function(username, cb){
	db.volunteer.findOne({username:username}, function(err,doc){
		if(err) { return cb(err); }
		
		if(doc)
			return cb(null, true);
		else
			return cb(null, false);
	});
};

exports.isLoginValid = function(username, password, cb){
	db.volunteer.findOne({username:username, password:password}, function(err, doc){
		if(err){ return cb(err); }

		if(doc)
			return cb(null, true);
		else 
			return cb(null, false);
	});
};

exports.addEvent = function(organizer, title, lon, lat, desc, time, volNeeded, category, cb){
	console.log("Dodajem event!");
	var evnt = {};
	evnt[EVENT_ORGANIZER] = organizer;
	evnt[EVENT_TITLE] = title;
	evnt[EVENT_DESCRIPtiON] = desc;
	evnt[EVENT_TIME] = time;
	evnt[EVENT_CATEGORY] = category;
	evnt[EVENT_LATITUDE] = lat;
	evnt[EVENT_LONGITUDE] = lon;
	evnt[EVENT_VOL_NEEDED] = volNeeded;

	db.events.insert(evnt, function(err, insertedDoc){
		if(err) { return cb(err); }
		var docID = insertedDoc._id;
		db.volunteer.update({_id:docID}, {$push:{events:docID}},function(err){
			if(err){ return cb(err); }
		});
	});
		return cb(null);
};