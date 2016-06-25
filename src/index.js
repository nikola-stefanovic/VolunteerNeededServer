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

app.post("/addEvent", function(req, res, next){
	console.log("Stigao zahtev za dodavanje event-a.");
	var evnt = req.body.vEvent;
	var organizer = evnt.organizer;
	var title = evnt.title;
	var lon = evnt.lon;
	var lat = evnt.lat;
	var desc = evnt.desc;
	var category = evnt.category;
	var volNeeded = evnt.volNeeded;
	var time = evnt.time;

	db.addEvent(organizer, title, lon, lat, desc, time, category, volNeeded, function(err){
		if(err){ console.log("Neuspesno dodavanje event-a" + err); return res.json({msg:"neuspesno dodavanje event-a!"}); }
		return res.json({msg:"OK"});
	});

});


//error-handling function, this function must be defined last 
app.use(function(err, req, res, next) {
  console.log("Error handler: ");
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});


