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
	console.log("Stigao zahtev za logovanje korisnika!");
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
	var evnt = req.body;
	var organizer = evnt.organizer;
	var title = evnt.title;
	var lon = evnt.lon;
	var lat = evnt.lat;
	var desc = evnt.desc;
	var category = evnt.category;
	var volNeeded = evnt.volNeeded;
	var time = evnt.time;


	var encodedImg = evnt.image;

	console.log("Stigle je  i slika: " + encodedImg.length);
	console.log("organizer : " + organizer);
	//decode 64based encoded jpeg
	var img = new Buffer(encodedImg, 'base64'); 
	var imgName = Random.string()(Random.engines.nativeMath,12);
	var imgPath = "files/events_images/"+imgName+'.jpeg';
 	//first save event image file
 	fs.writeFile(imgPath, img, function(err){
 		if(err){
 			console.log("len " + evnt.img.length);
 			return res.json({msg:"error durning saving event image file"});
 		}else{
 			//add to database
			db.addEvent(organizer, title, lon, lat, desc, time, category, volNeeded, imgPath, function(err){
				if(err){ 
					console.log("Neuspesno dodavanje event-a" + err); 
					return res.json({msg:"Could not insert event into database!"}); 
				}else{
					return res.json({msg:"OK"});
				}
			});
 		}
	});

});

app.post("/addFriend", function(req, res, next){
	console.log("Stigao zahtev za dodavanje prijatelja!");
	var body = req.body;
	var username = body.username;
	var friendUsername = body.friendUsername;

	db.addFriend(username, friendUsername, function(err){
		if(err){ console.log("Neuspesna dodavanje prijatelja! " + err); return res.json({msg:"Greska na serveru!"}); }

		return res.json({msg:"OK"});
	});
});

app.post("/getAllEvents", function(req, res, next){
	console.log("Stigao je zahtev za ucitavanje svih event-a!");
	db.getAllEvents(function(err, events){
		if(err) {console.log("Neuspesna citnaje shiv event-a iz baze! " + err); return res.json({msg:"Greska na serveru!"});}

		return res.json({msg:"OK", data:events})
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


