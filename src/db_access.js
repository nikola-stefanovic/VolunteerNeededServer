var mongojs = require('mongojs')

var collections = ['volunteer'];
var db = mongojs('mongodb://localhost:27017/vndb',collections);

var VOL_USERNAME = 'username';
var VOL_PASSWORD = 'password';
var VOL_NAME = 'name';
var VOL_PHONE = 'phone_num';
var VOL_IMG_FILE = 'ima_file';


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
}

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
}

exports.isLoginValid = function(username, password, cb){
	db.volunteer.findOne({username:username, password:password}, function(err, doc){
		if(err){ return cb(err); }

		if(doc)
			return cb(null, true);
		else 
			return cb(null, false);
	});
};