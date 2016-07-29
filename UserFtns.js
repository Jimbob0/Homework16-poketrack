// We are going to access the file system, so we need to
// include the fs module
var fs = require("fs");

// This will be the array of user objects
var usersArr;

/*
	Since there's a chance we won't be able to read the
	users.json file (it doesn't exist), we wrap this in
	a javascript (available in fronend too!) construct
	called try/catch. If the readFileSync call fails,
	we just ignore the error (e) and instead set our
	usersArr to an empty array.

	We *can* use readFileSync here because we don't care
	about speed when the server is starting up for the
	first time. We just want to get the file, and this way
	we don't have to worry about waiting for a callback
	function.
*/
try {
	usersArr = JSON.parse(fs.readFileSync("./users.json"));
} catch (e) {
	usersArr = [];
}

/*
	We have to put all of these functions outside the
	module.exports object so that they can refer to
	each other (we don't have a "this" since we're not
	using a constructor function).
*/

/*
	Check if a user exists - if they do, return
	that user (which is truthy).
	Otherwise, return undefined (which is falsy)
*/
function userExists(username) {
	for (var i = 0; i < usersArr.length; i++) {
		if (usersArr[i].username === username) {
			return usersArr[i];
		}
	}
	return undefined;
}

/*
	Check that a username and password match a user
	in the database. Return a boolean.
*/
function checkLogin (username, password) {
	var user = userExists(username);
	if (user && user.password === password) {
		return true;
	}
	return false;
}

/*
	Register a new user. Return a boolean representing
	whether the registration was successful. Double
	check that the username isn't used before registering.
*/
function registerUser(username, password) {
	if (userExists(username)) {
		return false;
	}
	// We're just using an object literal to store the
	// users instead of a constructor function ("new User(...)")
	// just for simplicity.
	usersArr.push({
		username: username,
		password: password
	});
	//save all users as JSON into users.json
	saveAllUsers();
	return true;
}

/*
	Take the entire array of users, convert it to a JSON
	string, and save it into users.json. We only care about
	the callback if there's an error.
*/
function saveAllUsers() {
	fs.writeFile(
		"./users.json",
		JSON.stringify(usersArr),
		function(err) {
			if (err) {
				console.log(err);
			}
		}
	);
}

/*
	Expose each of the functions as properties on an
	object as the module.exports. So: if in another file
	we
		var UserFtns = require("./UserFtns.js");
	then we can
		UserFtns.checkLogin()
	since checkLogin is a property of the UserFtns
	module object.
*/
module.exports = {
	userExists : userExists,
	checkLogin : checkLogin,
	registerUser : registerUser,
	saveAllUsers : saveAllUsers
};
