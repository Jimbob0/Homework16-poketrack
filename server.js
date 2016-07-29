var express = require("express");

var app = express();

var PORT = process.env.PORT || 8000;

var Sighting = require("./Sighting.js");
var bodyParser = require('body-parser');
var session = require('express-session');

var sightings = [];
function outOfDate(arr){
	return arr.timestamp > (Date.now()-600000);
}
setInterval(function(){
	sightings = sightings.filter(outOfDate);
}, 60000);
var UserFtns = require("./UserFtns.js");

app.use(function(req, res, next) {
	console.log(req.url);
	next();
});

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(session({
	secret: "lol pokemon",
	resave: false,
	saveUninitialized: false
}));

app.get("/sighting", function(req, res) {
	//TODO check if user is logged in
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	//TODO only send nearby sightings
	res.send(JSON.stringify(sightings));

});app.get("/sighting/all/all", function(req, res) {
	//TODO check if user is logged in
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	//TODO only send nearby sightings
	res.send(JSON.stringify(sightings));
});

/*
	Handles a GET request to localhost:8000/sighting/4 (charmander!)
	The pokemonId variable (recognizable because it has a ":" in front of it)
	will end up in req.params.pokemonId

	If I have the ROUTE /sighting/:pokemonId/:city
	and I visit the URL /sighting/4/boulder
	then I will have
		req.params.pokemonId == 4
		req.params.city == "boulder"
*/
app.get("/sighting/all/:pokemonId", function(req, res) {
	//check if user is logged in
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	// send any sightings that match the pokemon id
	res.send( //send to the user
		JSON.stringify( // a string representing
			sightings //all of the sightings
			.filter( //which match the following
				function(loc) { //that
					return loc.pokemonId == req.params.pokemonId; //the ids match
				}
			)
		)
	);
});


/*
	Same as above, but with a filter on city name (loc string)
*/
app.get("/sighting/:cityName/all", function(req, res) {
	//check if user is logged in
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	// send any sightings that match the pokemon id
	res.send(JSON.stringify(sightings.filter(function(loc) {
		return loc.locStr == req.params.cityName;
	})));
});

app.get("/sighting/:cityName/:pokemonId", function(req, res) {
	//check if user is logged in
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	// send any sightings that match the pokemon id
	res.send(JSON.stringify(sightings.filter(function(loc) {
		return loc.locStr == req.params.cityName && loc.pokemonId == req.params.pokemonId;
	})));
});


app.post("/sighting", function(req, res) {
	if (!req.session.user) {
		res.redirect('/login');
		return;
	}
	var newLoc = new Sighting(
		req.body.locStr,
		req.body.pokemonId,
		Date.now(),
		req.session.user);
	sightings.push(newLoc);
	res.send("success");
});

app.get('/login', function(req, res){
	res.sendFile(__dirname + "/public/login.html");
});

app.post('/login', function(req, res){
	if (UserFtns.checkLogin(req.body.username, req.body.password))
	{
		req.session.user = req.body.username;
		res.send("success");
	}else {
		res.send("error");
	}
});

app.get('/logout', function(req,res){
	req.session.user = "";
	res.redirect("/index.html");
});

app.get('/map(.html)?', function(req,res) {
	if (!req.session.user) {
		res.redirect("/login");
		return;
	}
	res.sendFile(__dirname + "/public/map.html");
});

app.post('/register', function(req, res){
	//shorthand variables to save us time
	var username = req.body.username;
	var password = req.body.password;
	if (UserFtns.userExists(username)) {
		// If the username already exists
		if (UserFtns.checkLogin(username, password)) {
			// ... and they have the right password
			// then log the user in
			req.session.user = username;
			// Send "success" so that the frontend knows
			// it is ok to redirect to /map
			res.send("success");
		} else {
			// Otherwise, they might be trying to
			// take a username that already exists - error!
			res.send("error");
		}
	} else {
		// Username is not taken, register a new user
		// and log them in - success!
		if(UserFtns.registerUser(username, password)) {
			req.session.user = username;
			// Send "success" so that the frontend knows
			// it is ok to redirect to /map
			res.send("success");
		} else {
			// there was a problem registering
			res.send("error");
		}
	}
});



app.use(express.static("public"));

app.use(function(req, res, next) {
	res.status(400);
	res.send("It's not very effective");
});

app.listen(PORT, function() {
	console.log("Gotta catch 'em all on port " + PORT);
});
