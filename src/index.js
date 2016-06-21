var express = require('express');
var bodyParser = require('body-parser');
var fs = require('fs');
var Random = require("random-js");
var db = require('./db_access.js');
var app = express();


app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.use(bodyParser.json({limit:"10mb"}));

app.post("/addEvent",function(req, res, next){
	var body = req.body;
	var evnt = body.vEvent;
	var desc = evnt.desc;
	//console.log("Stigao post: " + JSON.stringify(req.body,null,4));
	console.log("Stigao zahtev za dodavanje eventa");
	var imgName = Random.string()(Random.engines.nativeMath,12);

	//decode 64based encoded jpeg
	var img = new Buffer(evnt.img, 'base64'); 

	//first save image file
	fs.writeFile("files/events_images/"+imgName+'.jpeg', img, function(err){
		if(err){
			console.log("len " + evnt.img.length);
			res.json({msg:"error durning saving image file"});
		}else{
			//add to database
			console.log("len " + evnt.img.length);
			res.json({title: desc +"? stvarno o|O"});
		}
	})


});

app.post("/registerNewUser",function(req, res, next){
	console.log("Stigao zahtev za ragistraciju novog korisnika!");
	var body = req.body;
	var username = body.username;
	var password = body.password;
	var phone = body.phone;
	var name = body.name;
	var encodedImg = body.img;

	//decode 64based encoded jpeg
	var img = new Buffer(encodedImg, 'base64'); 

	//add to database
	db.isUsernameRegistered(username, function(err,isRegistered){
		if(err){ console.log(err); return res.json({msg:"Javila se greska kod provere da li je ime registrovano!"}); }

		if(isRegistered == true){
			return res.json({msg:"Ime je zauzeto"});
		}else{
			fs.writeFile("files/users_images/"+username+'.jpeg', img, function(err){
				if(err){
					return res.json({msg:"Doslo je do greske prilikom cuvanja slike korisnika!"});
				}else{
					db.insertNewUser(username, password, name, phone, function(err){
						if(err) { return res.json({msg:"Greska: neuspesno dadavanje novog korisnika!"})}
						
						return res.json({msg:"OK"});
					});
				}
			});
		}
	});			
});

app.post("/loginUser", function(req, res, next){
	var body = req.body;
	var username = body.username;
	var password = body.password;
	db.isLoginValid(username, password, function(err, isValid){
		if(err){ console.log("Neuspesna provera logina. " + err); return res.json({msg:"Greska na serveru!"}); }
		
		if(isValid){
			return res.json({msg:"OK"});
		}else{
			return res.json({msg:"Username or password are incorrect!"});
		}
	});
});


app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


