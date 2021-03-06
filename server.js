/*
                          ,
                         ,:
          ,:==++=~,      :~
        ,=+=:::::+?~     ~=                 ,,
       ~+~:~==++=,,~,    ~=                :==:   ,=~,       ,
      ==,~      :~,      ~~       ~??~     :~ =:   :I=      ,,
     ~~=,        ==,    ,~II    :?$+=?=:      ?,   ++:     ;;
    ,==~~      ,,,   ,?Z$7ZI:  ,I$,  ~?:   +$$=,  ,+?,+= ,:;
     =+:     ,,,:  ,7Z: ,~=,   =I?~,+7   ,=$~,=I~   +I~77 ~:,
    ,=~:,   :==~::  ?I~  ,~=,  ,?$Z7$?:  +7:  ~I~   +$I==I=:
    ,=~:~:,:~=++,  ,I?:  ,=?:  :I7+~~:  ,?7:,~++,   =$I :I+,
     ,==::::::+?=~  ~II,,=II,  ,??: :~~  +?=++I$+   ~7? ,++:
       :~::~:, :+?+:  ?II+~:  ,:+~   ,~~  ==~::::,  :+,  :=:
                ,=II+:        ,:,    ,~=:
                  :=~==                ~=,
                      ,                ,::
*/

// Check ./sources for the code snippits that i've used in this code
console.log( "\n> Check ./README for the setup instructions\n");

var express				=		require('express')
	, passport			=		require('passport')
	, util				=		require('util')
	, FacebookStrategy	=		require('passport-facebook').Strategy
	, GoogleStrategy	=		require('passport-google-oauth').OAuth2Strategy
	, session			=		require('express-session')
	, cookieParser		=		require('cookie-parser')
	, bodyParser		=		require('body-parser')
	, config			=		require('dotenv').config()
	, mysql				=		require('mysql')

	, app				=		express()
	, http 				= 		require('http').Server(app)
	, io 				= 		require('socket.io')(http)
	, useragent			=		require('express-useragent')
	, fs				=		require('fs');


var config = {
	host: process.env.MYSQL_HOST || null,
	user: process.env.MYSQL_USER || null,
	password: process.env.MYSQL_PASSWORD || null,
	database: process.env.MYSQL_DATABASE || null,
	use_database: process.env.USE_DATABASE || false,
	google_api_key: process.env.GOOGLE_API_KEY,
	google_api_secret: process.env.GOOGLE_API_SECRET,
	facebook_api_key: process.env.FACEBOOK_API_KEY,
	facebook_api_secret: process.env.FACEBOOK_API_SECRET
}


// Domain options, for testing and running on multiple domains
console.log( "Dirname " + __dirname);

// Just for testing and debugging
if (__dirname.indexOf("spokenjagers")) {
    console.log("> callbackURL > localhost");
    global["callbackURL"] = "http://" + "localhost" + ":8080" + "/auth/facebook/callback"
}

if(__dirname === "/mnt/data/spokenjagers") {
    console.log("> callbackURL > /mnt/data");
    global["callbackURL"] = "http://" + "xserve.qdraw.eu" + "/auth/facebook/callback";
    config.host = "localhost";
}

if ( __dirname.indexOf("spokenjagers") == -1) {
    console.log("> callbackURL > herokuapp");
    global["callbackURL"] = "https://" + "qdraw.herokuapp.com" + "/auth/facebook/callback";
}


// localAuth
process.argv.forEach(function (val, index, array) {
    if (val === "localauth") {
        config.host = "127.0.0.1";
    }
});

//Define MySQL parameter in Config.js file.
var mysqlConfig = {
    host        :     config.host,
    user        :     config.user,
    password    :     config.password,
    database    :     config.database
};

var connection;

//Connect to Database only if Config.js parameter is set.
if(config.use_database==='true'){
    handleDisconnect();

    connection.query('CREATE TABLE IF NOT EXISTS users (id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY, userid TEXT, displayname TEXT, displayimage TEXT, provider TEXT, email TEXT, gender TEXT, health INTEGER, score INTEGER, money INTEGER, useragent TEXT, value TEXT, latestConnectionTime INT, area TEXT)',
    function(err, result){
        // Case there is an error during the creation
        if(err) {
            console.log(err);
        }
        console.log('> mysql connected as id ' + connection.threadId);
    });

    // GHOST ITEM IN DB
    connection.query('CREATE TABLE IF NOT EXISTS ghosts (id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY, area TEXT, arealocation TEXT, spook1 TEXT, spook2 TEXT, spook3 TEXT, spook4 TEXT, spook5 TEXT, spook6 TEXT, spook7 TEXT, spook8 TEXT, spook9 TEXT, spook10 TEXT, spook11 TEXT, spook12 TEXT, spook13 TEXT, spook14 TEXT, spook15 TEXT, spook16 TEXT, spook17 TEXT, spook18 TEXT, spook19 TEXT, spook20 TEXT, spook21 TEXT, spook22 TEXT, spook23 TEXT, spook24 TEXT, spook25 TEXT, spook26 TEXT)',
    function(err, result){
        // Case there is an error during the creation
        if(err) {
            console.log(err);
        }
    });

    var spookCounter = 22;
    // sql code to upgrade database: update ghosts set spook21 = "0,0,10" where spook21 is null;


}// connection



function handleDisconnect() {
    connection = mysql.createConnection(mysqlConfig); // Recreate the connection, since
                                                  // the old one cannot be reused.

    connection.connect(function(err) {              // The server is either down
        if(err) {                                     // or restarting (takes a while sometimes).
          console.log('error when connecting to db:', err);
          setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
        }                                     // to avoid a hot loop, and to allow our node script to
    });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
    connection.on('error', function(err) {
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
            handleDisconnect();                         // lost due to either server restart, or a
        } else {                                      // connnection idle timeout (the wait_timeout
            throw err;                                  // server variable configures this)
        }
    });
}



app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'Lorum Ipsum Dolec, Dion de Hamster', key: 'Qsession'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 8080);


// Usaly disabled for security reasons
function localAuth () {
    var BasicStrategy = require('passport-http').BasicStrategy;


    var users = [
        { username: "dion", id: "1000000000000000000", displayName: 'dion', name: {givenName : "Dion"}, password: 'dion', email: 'joe@example.com', provider: 'basic' }
      , { username: "henry", id: "1000000000010000001", displayName: 'henry', name: {givenName : "Henry"}, password: 'henry', email: 'joe@example.com', provider: 'basic' }
      , { username: "niels", id: "1000000000020000002", displayName: 'niels', name: {givenName : "niels"}, password: 'niels', email: 'n@example.com', provider: 'basic' }
      , { username: "demo", id: "1000000000030000003", displayName: 'demo', name: {givenName : "demo"}, password: 'demo', email: 'demo@example.com', provider: 'basic' }
    ];


    function findByUsername(username, fn) {
        for (var i = 0, len = users.length; i < len; i++) {
            var user = users[i];
            if (user.username === username) {
                return fn(null, user);
            }//e/fi
        }//e/for
        return fn(null, null);
    }//e/findByUsername

    passport.use(new BasicStrategy({
    },
        function(username, password, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {

                // Find the user by username.  If there is no user with the given
                // username, or the password is not correct, set the user to `false` to
                // indicate failure.  Otherwise, return the authenticated `user`.
                findByUsername(username, function(err, user) {
                    if (err) { return done(err); }
                    if (!user) { return done(null, false); }
                    if (user.password != password) { return done(null, false); }
                    console.log(user);
                    console.log("> Welcome " + user.displayName + " " + user.username + " " + user.provider);

                    user.id = String(user.id);
                    user.emails = [];
                    user.emails[0] = {};
                    user.emails[0].value = user.email;
                    user.photos = [];
                    user.photos[0] = {};
                    user.photos[0].value = "images/profile.jpg";

                    authenticateUser (user);
                    global["sessionEnabled"][user.id] = true;

                    return done(null, user);
                })
            });
        }
    ));

    app.get('/auth/localauth', passport.authenticate('basic',{ session: true }), function(req, res){
        res.redirect("/")
    });

}//e/elocalAuth


// print process.argv ++ use: nodemon server.js ngrok
process.argv.forEach(function (val, index, array) {
    if (val === "localtunnel") {
        console.log("> callbackURL > NGROK \nhttps://spokenjagers.localtunnel.me/");
        global["callbackURL"] = "https://spokenjagers.localtunnel.me/auth/facebook/callback";
    }
    if (val === "localauth") {
        console.log("> localauth Enabled");
        localAuth ()
        // localAuth
    }
});

// GoogleStrategy to L:ogin
passport.use(new GoogleStrategy({
		clientID: config.google_api_key,
		clientSecret:config.google_api_secret ,
		callbackURL: global["callbackURL"].replace("facebook","google")
	},
	function(accessToken, refreshToken, profile, done) {
		console.log("> Welcome " + profile.displayName + " " + profile.id + " " + profile.provider);

		authenticateUser (profile);

		process.nextTick(function () {
			return done(null, profile);
		});
	}
));





// Use the FacebookStrategy within Passport.
passport.use(new FacebookStrategy({
		clientID: config.facebook_api_key,
		clientSecret:config.facebook_api_secret ,
        profileFields: ['id', 'name', 'gender', 'emails', 'profileUrl', 'displayName', 'photos'],
		callbackURL: global["callbackURL"]
	},
	function(accessToken, refreshToken, profile, done) {

		console.log("> Welcome " + profile.displayName + " " + profile.id + " " + profile.provider);
		// graph.facebook.com/10153168999049854/picture?type=large

		authenticateUser (profile);
		process.nextTick(function () {

			return done(null, profile);
		});
	}
));




global["sessionEnabled"] = {};
function authenticateUser (profile) {
	//Check whether the User exists or not using profile.id
	if(config.use_database==='true'){
		connection.query("SELECT * from users where userid="+profile.id,function(err,rows,fields){
		if(err) throw err;
		if(rows.length===0){
			console.log("There is no such user, adding now");
			connection.query("INSERT into users(userid,displayname,email,provider,gender) VALUES('"+ profile.id + "','" + profile.displayName + "','" + profile.emails[0].value + "','" + profile.provider +  "','" + profile.gender +"')");
			global["sessionEnabled"][profile.id] = true;

			url2base64inDatabase(profile.photos[0].value,profile.id);
            readScore (profile.id);
            readNameImage (profile.id);

            // only for logger
            // connection.query("ALTER TABLE locations ADD _" + String(profile.id) + "_ TEXT");

		}
		else{
				console.log("User " + profile.id +" already exists in database");
                readScore (profile.id);
                readNameImage (profile.id);
                global["sessionEnabled"][profile.id] = true;
			}
		});
	}

}//e/authenticateUser


app.get('/', function(req, res){
    // console.log("Cookies: ", req.cookies);

    // Phonegap menubar
    if (req.query["phonegap"] == "true" && req.cookies["phonegap"] != "true") {
	    var expiryDate = new Date(Number(new Date()) + 315360000000); // aka now + 10 years
	    res.cookie('phonegap', req.query["phonegap"], { expires: expiryDate, httpOnly: true });
    };

	res.render('index', { user: req.user, cookies: req.cookies, userData: JSON.stringify(userData[0]), score: JSON.stringify(global["score"]), health: JSON.stringify(global["health"]), money: JSON.stringify(global["money"]), readNameImage: JSON.stringify(global["readNameImage"])  });
});



app.get('/account', ensureAuthenticated, function(req, res){
	res.render('account', { user: req.user, cookies: req.cookies});
});

app.get('/game', ensureAuthenticated, function(req, res){

    var expiryDate = new Date(Number(new Date()) + 315360000000); // aka now + 10 years
    res.cookie('provider', req.user.provider, { expires: expiryDate, httpOnly: true });
	res.render('game', { user: req.user, cookies: req.cookies});
});


app.get('/privacy', function(req, res){
    res.render('privacy', { cookies: req.cookies});
});

// Facebook
app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));



// Thanks: http://stackoverflow.com/questions/9885711/custom-returnurl-on-node-js-passports-google-strategy
app.get('/auth/facebook/callback', function(req, res, next){
  passport.authenticate('facebook', function(err, user, info){
    // This is the default destination upon successful login.
    var redirectUrl = '/';

    if (err) { return next(err); }
    if (!user) { return res.redirect('/'); }

    // If we have previously stored a redirectUrl, use that,
    // otherwise, use the default.
    if (req.session.redirectUrl) {
      redirectUrl = req.session.redirectUrl;
      req.session.redirectUrl = null;
    }
    req.logIn(user, function(err){
      if (err) { return next(err); }
    });
    res.redirect(redirectUrl);
  })(req, res, next);
});


//e/fb

//google
app.get('/auth/google',
  passport.authenticate('google', { scope:
    [ 'https://www.googleapis.com/auth/plus.login',
    , 'https://www.googleapis.com/auth/plus.profile.emails.read' ] }));

app.get('/auth/google/callback', function(req, res, next){
  passport.authenticate('google', function(err, user, info){
    // This is the default destination upon successful login.
    var redirectUrl = '/';

    if (err) { return next(err); }
    if (!user) { return res.redirect('/'); }

    // If we have previously stored a redirectUrl, use that,
    // otherwise, use the default.
    if (req.session.redirectUrl) {
      redirectUrl = req.session.redirectUrl;
      req.session.redirectUrl = null;
    }
    req.logIn(user, function(err){
      if (err) { return next(err); }
    });
    res.redirect(redirectUrl);
  })(req, res, next);
});


//e/google


app.get('/logout', function(req, res){
	global["sessionEnabled"][req.user.id] = false;
	req.logout();
	res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
    req.session.redirectUrl = req.url;
	res.redirect('/');
}


// Passport session setup.
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});



// not app.listen
http.listen(app.get('port'));

// Display only the local ip!! in TERMINAL
var os = require('os');

var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
console.log("> Local Server IP: " + addresses);









// ------------------------------------------------------------------------
// Socket.io Game start over here:
// ------------------------------------------------------------------------


// setup variabels for userData to avoid crashes
var userData = {
    0: {},
    1: {},
    2: {}
};
// Counter used in userData
var c = 0;

var latestConnectionTime = {};

// fill userData with all lat,long
var isFirstRun = true;

global["ghosts"] = {};
var startMoveOpponents = false;

global["currentAreaName"] = {};
global["currentAreaPosition"] = {};


// define interactions with client
io.on('connection', function(socket){

	console.log("	");
	var userid = 0;

	// console.log(userid);

    // Every User has one connection
    // var userid = 0;

    //recieve client data
    // I receive this object from the user:
    // var data = {
    //     userid: userid,
    //     longitude: longitude,
    //     latitude: latitude,
    //     accuracy: accuracy,
    //     altitude: altitude,
    //     speed: speed
    // }
    socket.on('data', function(data){
        procesData(data);
    });


    // Excute data:
    function procesData(data) {
        userid = data.userid;


        if (isFirstRun) {
            userData[0][userid] = [ data.latitude, data.longitude, data.accuracy, data.altitude, data.speed];
            userData[1][userid] = [ data.latitude, data.longitude, data.accuracy, data.altitude, data.speed];
            userData[2][userid] = [ data.latitude, data.longitude, data.accuracy, data.altitude, data.speed];
            isFirstRun = false;
        };

        if (global["sessionEnabled"][userid] != true) {
        	global["sessionEnabled"][userid] = false;
        	socket.emit('sessionEnabled', global["sessionEnabled"]);
        	global["sessionEnabled"][userid] = true;
        };



        userData[c][userid] = [ data.latitude, data.longitude, data.accuracy, data.altitude, data.speed];

        latestConnectionTime[userid] = new Date().getTime();

        c++;
        if (c===3) c=0;
    }//e/procesData


    function calcMicroSeconds() {
        var nowTime = new Date().getTime();
        var unixTime = Math.ceil(nowTime/1000);
        var microSeconds = nowTime;
        var microSeconds = nowTime.toString().substring(unixTime.toString().length, nowTime.toString().length);
        return microSeconds;
    }

    // Send Data to client to display all users on the map
    setInterval(function(){
         socket.emit('users', userData[c]);
    }, 500);


    // show cpu-load to user
    // check if removed the Send Time interval
    var cpuload = null;

    function checkCpuLoad () {

	    var os = require("os");
		var cpu = os.cpus();
		var counter = 0;
		var total=0;
		var free=0;
		var sys=0;
		var user=0;

		for (var i = 0; i<cpu.length ; i++) {
		    total=parseFloat(cpu[i].times.idle)+parseFloat(cpu[i].times.sys)+parseFloat(cpu[i].times.user)+parseFloat(cpu[i].times.irq)+parseFloat(cpu[i].times.nice);
		    free+=100*(parseFloat(cpu[i].times.idle)/total);
		    sys+=100*(parseFloat(cpu[i].times.sys)/total);
		    user+=100*(parseFloat(cpu[i].times.user)/total);
		};
		cpuload = Number(user/cpu.length + sys/cpu.length);
		cpuload  = cpuload * 100;
		cpuload = Math.round(cpuload);
		cpuload = cpuload /100;

    }//e/checkCpuLoad

    checkCpuLoad ();

    setInterval(function (argument) {
    	checkCpuLoad ();
	},60000)


    // Send Time to Client
    setInterval(function(){
        socket.emit('date', {'cpuload': cpuload,'date': new Date().getTime()});
    }, 1000);



    // Error handeling: Incorrect Moving detection, twiche a second;
    setInterval(function(){

        microSeconds = calcMicroSeconds();
        if ((microSeconds > 200 && microSeconds < 400)|| (microSeconds > 600 && microSeconds < 800) ) {

            var cMinOne = c-1
            if ( cMinOne === -1) cMinOne=2;

            // Incorrect movement correction:
            Object.keys(userData[c]).forEach(function(key) {

                try {
                    var diffence = calcCrow(userData[c][key][0], userData[c][key][1], userData[cMinOne][key][0], userData[cMinOne][key][1]);
                }
                catch(e) {
                    console.log(e);
                    var diffence = "9999";
                }

                if (Number(diffence) > 0.01) {
                    try {
                        userData[c][key][0] = userData[cMinOne][key][0];
                        userData[c][key][1] = userData[cMinOne][key][1];
                        console.log("c " + c + " " + diffence);
                    }
                    catch(e) {
                        console.log(e);
                    }
                };
            });

        };


    }, 200);


    // Kill Bill function, kicking user out of the map, every 6 seconds
    // http://i61.tinypic.com/2s6k9qd.jpg
    setInterval(function(){

        Object.keys(latestConnectionTime).forEach(function(key) {

            var diffence = new Date().getTime() - latestConnectionTime[key]

            if ((diffence > 10000) && diffence < 30000) {
                console.log(key + " " + diffence);

                userData[0][key] = [ 0, 0];
                userData[1][key] = [ 0, 0];
                userData[2][key] = [ 0, 0];

            };

            if ((diffence > 160000) && diffence < 170000) {
	        	global["sessionEnabled"][userid] = false;
	        	socket.emit('sessionEnabled', global["sessionEnabled"]);
            }

        });


    }, 6000);
    // No need to check if the user is active, sessions will be aborted automaticly and killed by "Kill Bill"





    // Opponent aka Spooks

    // min+max extensions use: [0,2].min()
    Array.prototype.max = function () {
        return Math.max.apply(Math, this);
    };

    Array.prototype.min = function () {
        return Math.min.apply(Math, this);
    };



    // New Session aka Area Feature
    var isArealistAvailableBoolean = false;



    function isArealistAvailable () {

    	// nieuwe sessie
    	// is userid aanwezig?
    	try { if (userData[c][userid][0] != 0) { var go = true;  } 	else { var go = false; }  	}   	catch(e){ 			var go = false;     	}

    	if (userid != 0 && go == true) {
    		clearInterval(isArealistAvailableInterval);

    		// zijn areas aanwezig?
    		connection.query("SELECT COUNT(*) FROM ghosts",function(err, result){
    			if (result[0]["COUNT(*)"] == 0) {
    				// maak area #1
    				console.log("> new area created COUNT(*)===0");

    				var newAreaNumber = 1;
    				var currentAreaNumber = 0;

					connection.query("INSERT into ghosts(area) VALUES('" + "area_" + newAreaNumber + "')");
	                connection.query("UPDATE ghosts SET "+ "arealocation" +" = '" + userData[c][userid][0] + "," + userData[c][userid][1] + "' WHERE area = '" + "area_" + newAreaNumber +"'");

                    for (var i = 1; i <= spookCounter; i++) {
                        connection.query("UPDATE ghosts SET "+ "spook" + i + " = '" + 0 + "," + 0 + "," + 10 + "' WHERE area = '" + "area_" + newAreaNumber +"'");
                    };//e/spookCounter


	                connection.query("UPDATE users SET "+ "area" +" = '" + "area_" + newAreaNumber + "' WHERE userid = '" + userid +"'");
	                connection.query("UPDATE users SET "+ "latestConnectionTime" +" = '" + Math.floor(Date.now() / 1000) + "' WHERE userid = '" + userid +"'");

	                global["currentAreaName"][userid] = "area_" + newAreaNumber;
	                global["currentAreaPosition"][userid] = userData[c][userid][0] + "," + userData[c][userid][1];


	                isArealistAvailableBoolean = true;
    			}
    			else {
    				// make array from all arealocation's
		    		var newAreaNumber =  Number(result[0]["COUNT(*)"] + 1 );
		    		var currentAreaNumber = Number(result[0]["COUNT(*)"] );

				    connection.query('SELECT * FROM ghosts',function(err,result)     {
				    	var AreaListOfGeoLocation = [];
				    	var AreaListOfIndex = [];
				    	var AreaListOfAreaDistance = [];

				    	for (var i = 0; i < result.length; i++) {

				    		var arealocation = result[i]["arealocation"];

				    		if (arealocation != null) {
					    		var arealocation = arealocation.split(",");

					    		var areaDistance = calcCrow(arealocation[0], arealocation[1], userData[c][userid][0], userData[c][userid][1]);

					    		// console.log("u: " + userData[c][userid][0], userData[c][userid][1] );
					    		// console.log("a: " + arealocation[0], arealocation[1] );
					    		// console.log("areaDistance " + areaDistance);

					    		if (areaDistance < 1) {
							    	AreaListOfIndex.push(i);
							    	AreaListOfAreaDistance.push(areaDistance);
							    	AreaListOfGeoLocation.push(result[i]["arealocation"]);
					    		};
				    		}
				    		else {
			    				console.log("> ERROR null " + arealocation )
				    		}//e/ls
				    	};

				    	// console.log(AreaListOfGeoLocation);

				    	if (AreaListOfGeoLocation.length === 0) {
				    		// Create a new area

				    		if (userData[c][userid][1] != 0) {
					    		console.log("> Create a new area");
								connection.query("INSERT into ghosts(area) VALUES('" + "area_" + newAreaNumber  + "')");
				                connection.query("UPDATE ghosts SET "+ "arealocation" +" = '" + userData[c][userid][0] + "," + userData[c][userid][1] + "' WHERE area = '" + "area_" + newAreaNumber +"'");

                                for (var i = 1; i <= spookCounter; i++) {
                                    connection.query("UPDATE ghosts SET "+ "spook" + i + " = '" + 0 + "," + 0 + "," + 10 + "' WHERE area = '" + "area_" + newAreaNumber +"'");
                                };//e/spookCounter


				                connection.query("UPDATE users SET "+ "area" +" = '" + "area_" + newAreaNumber + "' WHERE userid = '" + userid +"'");
				                connection.query("UPDATE users SET "+ "latestConnectionTime" +" = '" + Math.floor(Date.now() / 1000) + "' WHERE userid = '" + userid +"'");

				                global["currentAreaName"][userid] = "area_" + newAreaNumber;
				                global["currentAreaPosition"][userid] = userData[c][userid][0] + "," + userData[c][userid][1];


				                isArealistAvailableBoolean = true;
			                };

				    	}//e/fi

				    	// if (AreaListOfGeoLocation.length === 1) {
				    	// 	// link user to that area
				    	// 	console.log("link user to that area length === 1 ");
			      //           connection.query("UPDATE users SET "+ "area" +" = '" + "area_" + currentAreaNumber + "' WHERE userid = '" + userid +"'");
			      //           connection.query("UPDATE users SET "+ "latestConnectionTime" +" = '" + Math.floor(Date.now() / 1000) + "' WHERE userid = '" + userid +"'");

			      //           currentAreaName = "area_" + currentAreaNumber;
			      //           currentAreaPosition = result[i]["arealocation"];


				    	// }//e/fi

				    	if (AreaListOfGeoLocation.length >= 1) {
				    		// find closest and link user to area 1
				    		console.log("find closest and link user to area #1");


				    		console.log("AreaListOfGeoLocation");
				    		console.log(AreaListOfGeoLocation);
				    		console.log("AreaListOfAreaDistance");
				    		console.log(AreaListOfAreaDistance);

				    		var lowestnumber =  AreaListOfAreaDistance.min();
							var lowestnumberkey = AreaListOfAreaDistance.indexOf(lowestnumber);
							var geo = AreaListOfGeoLocation[lowestnumberkey];
							var index = AreaListOfIndex[lowestnumberkey];
							var index = Number(index+1);

				    		// console.log("lowestnumber");
				    		// console.log(lowestnumber);
				    		// console.log("lowestnumberkey");
				    		// console.log(lowestnumberkey);
				    		// console.log("geo");
				    		// console.log(geo);
				    		// console.log("index");
				    		// console.log(index);

			                connection.query("UPDATE users SET "+ "area" +" = '" + "area_" + index + "' WHERE userid = '" + userid +"'");
			                connection.query("UPDATE users SET "+ "latestConnectionTime" +" = '" + Math.floor(Date.now() / 1000) + "' WHERE userid = '" + userid +"'");

			                global["currentAreaName"][userid] = "area_" + index;
			                global["currentAreaPosition"][userid] = geo;

			                isArealistAvailableBoolean = true;

				    	};//e/fi



					});

    			}//e/els

			}); //e/select-counter


    	};
    	// console.log("/e/isArealistAvailable");


    }//e/isArealistAvailable
    var isArealistAvailableInterval = setInterval(isArealistAvailable,500);



    // 7.1 aan het begin de waardes van de spoken controleren
    var opponentHandelingStartBoolean = false;
    var opponentHandelingStart = setInterval(function () {
    	if (isArealistAvailableBoolean) {
    		clearInterval(opponentHandelingStart);

    		global["ghosts"][currentAreaName[userid]] = {};


		    connection.query('SELECT * FROM ghosts',function(err,selectResult)     {


		    	// new spooks check on errors
			    connection.query('DESCRIBE ghosts',function(err,describeResult) {

			    	var ghostsNamesArray = [];

			    	for (var i = 0; i < describeResult.length; i++) {
			  		  	if (describeResult[i]["Field"].indexOf("spook") > -1) {
				  		  	ghostsNamesArray.push(describeResult[i]["Field"])
			  		  	};
			    	};

			    	// current area location exist

			    	// console.log(currentAreaName[userid])
					// console.log(currentAreaPosition[userid])
					//global["currentAreaName"]


					// Check if area position is correct
					try{
						global["currentAreaPosition"][userid].split(",");
						isAreaPosCorrect = true;
					}catch(e){
						isAreaPosCorrect = false;
					}

					// Check if spooks locations are correct


					for (var i = 0; i < selectResult.length; i++) {

						// console.log("selectResult");
						// console.log(selectResult[i]);

						if (selectResult[i]["area"] == currentAreaName[userid]) {
							for (var x = 0; x < ghostsNamesArray.length; x++) {

								// selectResult[i][ghostsNamesArray[x]]
								try {
									var ghostExistInDatabase = selectResult[i][ghostsNamesArray[x]].split(",");
						    	}
						    	catch(e) {
						    		var ghostExistInDatabase = false;
									newOpponent (global["currentAreaName"][userid],global["currentAreaPosition"][userid].split(","),ghostsNamesArray[x]);
									opponentHandelingStartBoolean = true;
							    	startMoveOpponents = true;

						    	}//e/catch

						    	if (ghostExistInDatabase != false) {
									global["ghosts"][global["currentAreaName"][userid]][ghostsNamesArray[x]] = selectResult[i][ghostsNamesArray[x]].split(",");
									opponentHandelingStartBoolean = true;
							    	startMoveOpponents = true;

						    	}//e/fi

							};

						};//e/fi
					};//e/for



			    }); //e/DESCRIBE
			}); //e/SELECT


    	};
    },1000);


		// // Random function to create floating numbers
	 //    function getRandomArbitrary(min, max) {
	 //        return Math.random() * (max - min) + min;
	 //    }

	 //    //Random interer
	 //    function getRandomInt(min, max) {
	 //        return Math.floor(Math.random() * (max - min + 1)) + min;
	 //    }









     // Send Ghosts to Client
    setInterval(function () {
    	if (startMoveOpponents) {
    		// console.log(global["ghosts"]);

				Object.keys(global["ghosts"]).forEach(function(area) {
					var sendSocket = {};
					sendSocket[area] = global["ghosts"][area];
					// console.log(sendSocket);
		    		socket.emit('ghosts', JSON.stringify(sendSocket));
				});
    	};
    },1000);


	// used to be moveopp


	// // Score HANDELING , kill the opponent, seperate channel

    socket.on('shoot', function(shoot){
    	if (opponentHandelingStartBoolean) {

	        // check if the shooting is inside the circle
	        var isInBox = false;
	        try {
	            if (calcCrow(shoot.lat, shoot.lng, userData[c][userid][0], userData[c][userid][1]) <= 0.03997664) { // 0.0199883
	                console.log(shoot);
	                var isInBox = true;
	            };
	        }
	        catch(e) {}



	        // ! is for debug!!!!!!!!
	        if (isInBox) {


				Object.keys(global["ghosts"]).forEach(function(area) {

					Object.keys(global["ghosts"][area]).forEach(function(ghostsName) {
						// first scores in db!!
	               		if (calcCrow(shoot.lat, shoot.lng, global["ghosts"][area][ghostsName][0], global["ghosts"][area][ghostsName][1]) < 0.06) {

	                    	console.log("> User: " + userid );

		                    // // Give +1 to the user
		                    if (!(isNaN(global["score"][userid] + 1))) {

			                    global["score"][userid] = Number(global["score"][userid] + 1);


			        			if(config.use_database==='true'){
									connection.query("SELECT * from users where userid="+ userid ,function(err,rows,fields){
									if(err) throw err;
									if(rows.length===1){
										console.log("update score  -> " +  global["score"][userid]);
						                connection.query("UPDATE users SET "+ "score" +" = '" + global["score"][userid] + "' WHERE userid = '" + userid +"'");

									}
									else{
											console.log("User already exists in database");
										}
									});

									// Give opponent -1
									global["ghosts"][area][ghostsName][2] = Number(global["ghosts"][area][ghostsName][2]-1);

									// opponent has lost:
				                    if (global["ghosts"][area][ghostsName][2] <= 0) {
				                    	newOpponent (global["currentAreaName"][userid],global["currentAreaPosition"][userid],ghostsName)
				                    };




								}//e/fi
							}//e/NaN

		                    // // send score to user:
		                    socket.emit('score', {"points": global["score"][userid]});








	               		}//e/hit




					}); ///e/object

				}); ///e/object


	            // Whitch opponent is in the circle and has been shot?
	            for (var i = 0; i < 0; i++) {

	                var posLat = global["opponent"]["opponent_" + i][0];
	                var posLng = global["opponent"]["opponent_" + i][1];

	                // calculate the distance of the opponent related to the point that has been shot
	                if (calcCrow(shoot.lat, shoot.lng, posLat, posLng) < 0.03997664) {



	                    // Give -1 to opponent
	                    // global["opponent"]["opponent_" + i][2]--;

	                    // display in terminal
	                    console.log("> User: " + userid + " -> opponent " + i + ", score: " + global["opponent"]["opponent_" + i][2] );

	                    // opponent has lost:
	                    if (global["opponent"]["opponent_" + i][2] <= 0) {
	                        global["opponent"]["opponent_" + i][0] = newOpponent (i);
	                        global["opponent"]["opponent_" + i][1] = newOpponent (i);
	                    };

	                    // if (isNaN(global["score"][userid] + 1)) {
	                    //     console.log("WARNING: Score restart");
	                    //     global["score"][userid] = 0;
	                    // };

	                    // Read Score from database
	                    // readScore (userid);

	                    // Send it to User
	                    // sendScore (socket,userid);

	                    // updatePoints ("score",1,userid)

	                    // // Give +1 to the user
	                    if (!(isNaN(global["score"][userid] + 1))) {

		                    global["score"][userid] = Number(global["score"][userid] + 1);


		        			if(config.use_database==='true'){
								connection.query("SELECT * from users where userid="+ userid ,function(err,rows,fields){
								if(err) throw err;
								if(rows.length===1){
									console.log("update score  -> " +  global["score"][userid]);
									// connection.query("INSERT into users(score) VALUES('" + global["score"][userid] + "')");
									// 'SELECT * FROM users WHERE userid = ?', [userid]
					                connection.query("UPDATE users SET "+ "score" +" = '" + global["score"][userid] + "' WHERE userid = '" + userid +"'");

								}
								else{
										console.log("User already exists in database");
									}
								});
							}//e/fi

						}//e/NaN

	                    // // send score to user:
	                    socket.emit('score', {"points": global["score"][userid]});
	                };

	                var posLat;
	                var posLng;

	            };

	        var isInBox = false;

	        };//e/isInBox




    	};///e/opponent~Boolean

    });///e/shoot


    var DisplayScore = setInterval(function(){

        if (!isNaN(global["score"][userid])) {
            // // send score to user:
            socket.emit('score', {"points": global["score"][userid]});
            socket.emit('money', {"money": global["money"][userid]});
            socket.emit('health', {"health": global["health"][userid]});

            // // // clearInterval(DisplayScore);
        };
	}, 1000);


});///e/connection


// Global object Score:
global["score"] = {};
global["health"] = {};
global["money"] = {};

function readScore (userid) {

    // console.log("userid > " +userid);


    if(config.use_database==='true'){
        connection.query("SELECT * from users where userid="+ userid ,function(err,rows,fields){
        if(err) throw err;
        if(rows.length===1){
            global["score"][userid] = rows[0].score;


            if (isNaN(global["score"][userid] + 1)) {
                console.log("WARNING: Score restart");
                global["score"][userid] = 0;
            };

            global["health"][userid] = rows[0].health;

            if (isNaN(global["health"][userid] + 1)) {
                console.log("WARNING: health restart");
                global["health"][userid] = 0;
            };
            global["money"][userid] = rows[0].money;


            if (isNaN(global["money"][userid] + 1)) {
                console.log("WARNING: money restart");
                global["money"][userid] = 0;
            };

            // console.log("update score  -> " +  global["score"][userid]);
            // global["score"][userid] =

            // // connection.query("INSERT into users(score) VALUES('" + global["score"][userid] + "')");
            // // 'SELECT * FROM users WHERE userid = ?', [userid]
            //          connection.query("UPDATE users SET "+ "score" +" = '" + global["score"][userid] + "' WHERE userid = '" + userid +"'");

        }
        else{
                console.log("User already exists in database");
            }
        });
    }
}///e/readScore

global["readNameImage"] = {};
function readNameImage (userid) {
    if(config.use_database==='true'){
        connection.query("SELECT * from users where userid="+ userid ,function(err,rows,fields){
            if(err) throw err;
            if(rows.length===1){
                global["readNameImage"][userid] = [rows[0].displayname,rows[0].displayimage,rows[0].provider];
            }

        });


    }//e/db

}//e/readNameImage



//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
// src: http://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates-shows-wrong
function calcCrow(lat1, lon1, lat2, lon2){
    var R = 6371; // km
    var dLat = toRad(lat2-lat1);
    var dLon = toRad(lon2-lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
}
// 1 == 1km

// Converts numeric degrees to radians
function toRad(Value){
    return Value * Math.PI / 180;
}



function url2base64inDatabase(url,userid) {

  	var host = 0;
  	var path = 0;

	var pos = url.indexOf('//')
	var res = url.substring(0, (pos+2));

	if (res === "https://") {
		var res = url.substring((pos+2), url.lenght);
		var pos = res.indexOf('/')
		var host = res.substring(0, pos);
		var path = res.substring(pos, pos.lenght);
	};

	if (path != 0 && host  != 0 ) {

		var http = require('https');
		var options = {
		  host: host,
		  path: path
		};

		var base64;

		var req = http.get(options, function(res) {
		  console.log('STATUS: ' + res.statusCode);
		  // console.log('HEADERS: ' + JSON.stringify(res.headers));

		  // Buffer the body entirely for processing as a whole.
		  var bodyChunks = [];
		  res.on('data', function(chunk) {


		    // You can process streamed parts here...
		    bodyChunks.push(chunk);
		  }).on('end', function() {
		    var body = Buffer.concat(bodyChunks);
		    // console.log('BODY: ' + body);
		    // // ...and/or process the entire body here.


			 var prefix = "data:" + res.headers["content-type"] + ";base64,";

		     var base64 = new Buffer(body, 'binary').toString('base64');
		     // console.log(prefix + base64);

		     connection.query("UPDATE users SET "+ "displayimage" +" = '" + prefix + base64 + "' WHERE userid = '" + userid +"'");


		  })
		});

		req.on('error', function(e) {
		  console.log('ERROR: ' + e.message);
		});

	};//e/path+host


}//e/url


// Random function to create floating numbers
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

//Random interer
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


var moveGhosts = setInterval(function () {
		// console.log(global["currentAreaName"]);
		// console.log(startMoveOpponents);

	if (startMoveOpponents){


		// currentAreaName
		// currentAreaPosition

		// console.log(global["currentAreaName"]);


		Object.keys(global["currentAreaName"]).forEach(function(useridI) {
			// console.log("useridI");
			// console.log(useridI);

			Object.keys(global["ghosts"]).forEach(function(area) {
				// console.log("area")
				// console.log(area)
				Object.keys(global["ghosts"][area]).forEach(function(ghostsName) {

					// console.log("ghostsName")
					// console.log(ghostsName)

					// console.log(ghostsName + " " + ghosts[area][ghostsName]);

					moveOpponent (global["currentAreaName"][useridI],global["currentAreaPosition"][useridI].split(","),ghostsName)

				});
			});
		});


	};///e/opponent~Boolean
},1000);



function moveOpponent (currentAreaName,currentAreaPosition,ghostsName) {

        // console.log("---------------------------");

        // console.log("ghostsName");
        // console.log(ghostsName);

        // console.log("currentAreaName");
        // console.log(currentAreaName);


        // console.log("currentAreaPosition");
        // console.log(currentAreaPosition);

        // console.log("global[ghosts]");
        // console.log(global["ghosts"]);


        // // console.log("global[ghosts][currentAreaName][ghostsName]");
        // // console.log(global["ghosts"][currentAreaName][ghostsName]);

        // // console.log("global[ghosts][currentAreaName][ghostsName]00000");
        // // console.log(global["ghosts"][currentAreaName][ghostsName][0]);
        // // console.log("global[ghosts][currentAreaName][ghostsName]111110");
        // // console.log(global["ghosts"][currentAreaName][ghostsName][1]);




        // console.log("---------------------------");

	    try{
	        if (isNaN(Number(global["ghosts"][currentAreaName][ghostsName][0] +1 )   ) ) {
				var saveWrite = false;
			}
			else{
				var saveWrite = true;
			}
		}
		catch(e) {
			var saveWrite = false;
		}

		if(saveWrite) {

			var areaDistance = calcCrow(global["ghosts"][currentAreaName][ghostsName][0], global["ghosts"][currentAreaName][ghostsName][1], currentAreaPosition[0], currentAreaPosition[1]);


			if (areaDistance >= 1) {
				newOpponent (currentAreaName,currentAreaPosition,ghostsName);
			};

	        var speed = 0.00009; // 00005
			var speedNeg = speed * -1;
	        var value = getRandomArbitrary(speedNeg, speed);

	        var topORleft = getRandomInt(0,1);

	        if (isNaN(Number(global["ghosts"][currentAreaName][ghostsName][topORleft] +1 )   ) ) {
	        	console.log("NaN/e")
                console.log(ghostsName)
	        }
	        else {
	            global["ghosts"][currentAreaName][ghostsName][topORleft] = (Number(global["ghosts"][currentAreaName][ghostsName][topORleft]) + value);
	            // console.log(global["ghosts"][currentAreaName][ghostsName][topORleft]);
	        }




	        ghostcors =  global["ghosts"][currentAreaName][ghostsName][0] + "," + global["ghosts"][currentAreaName][ghostsName][1] + "," + global["ghosts"][currentAreaName][ghostsName][2]
	        connection.query("UPDATE ghosts SET "+ ghostsName +" = '" + ghostcors + "' WHERE area = '" + currentAreaName +"'");

	    } //e/SaveWrite



                    // var areaLatLongOffset = 0.01;

        // global["ghosts"][currentAreaName][ghostsName] = [getRandomArbitrary(Number(currentAreaPosition[0])-areaLatLongOffset, Number(currentAreaPosition[0])+areaLatLongOffset),getRandomArbitrary(Number(currentAreaPosition[1])-areaLatLongOffset, Number(currentAreaPosition[1])+areaLatLongOffset),10,30];



}//e/move.op


// Create single Opponents, when you kill some, or moved out of canvas
function newOpponent (currentAreaName,currentAreaPosition,ghostsName) {

    try{
        if (isNaN(Number(global["ghosts"][currentAreaName][ghostsName][0] +1 )   ) ) {
			var saveWrite = false;
		}
		else{
			var saveWrite = true;
		}
	}
	catch(e) {
		var saveWrite = false;
	}

	if(saveWrite) {

        // [lat,long,score, offEarthScore]
        // used to be: 0.0006
        var areaLatLongOffset = 0.01;
        global["ghosts"][currentAreaName][ghostsName] = [getRandomArbitrary(Number(currentAreaPosition[0])-areaLatLongOffset, Number(currentAreaPosition[0])+areaLatLongOffset),getRandomArbitrary(Number(currentAreaPosition[1])-areaLatLongOffset, Number(currentAreaPosition[1])+areaLatLongOffset),10];

        // console.log(global["ghosts"][currentAreaName][ghostsName]);



        // console.log("ghostsName");
        // console.log(ghostsName);
        // console.log("global[ghosts][currentAreaName][ghostsName]");
        // console.log(global["ghosts"][currentAreaName][ghostsName]);
        // console.log("currentAreaName");
        // console.log(currentAreaName);


        ghostcors =  global["ghosts"][currentAreaName][ghostsName][0] + "," + global["ghosts"][currentAreaName][ghostsName][1] + "," + global["ghosts"][currentAreaName][ghostsName][2];
        // console.log("ghostcors");

        // console.log(ghostcors);

        // UPDATE Customers SET ContactName='Alfred Schmidt', City='Hamburg' WHERE CustomerName='Alfreds Futterkiste';

        connection.query("UPDATE ghosts SET "+ ghostsName +" = '" + ghostcors + "' WHERE area = '" + currentAreaName +"'");

			// 	                connection.query("UPDATE users SET "+ "score" +" = '" + global["score"][userid] + "' WHERE userid = '" + userid +"'");

	} //e/saveWrite


}//e/newOpponent



// ghostAttackUser!!!

var ghostAttackUserInterval = setInterval(function () {

    if (startMoveOpponents){
        ghostAttackUser ()
    }

    function ghostAttackUser () {


        Object.keys(global["currentAreaName"]).forEach(function(useridI) {
            // console.log("useridI");
            // console.log(useridI);
            Object.keys(global["ghosts"]).forEach(function(area) {
                // console.log("area")
                // console.log(area)
                Object.keys(global["ghosts"][area]).forEach(function(ghostsName) {
                    if (calcCrow(global["ghosts"][area][ghostsName][0], global["ghosts"][area][ghostsName][1], userData[c][useridI][0], userData[c][useridI][1]) <= 0.0199883) { // 0199883

                        console.log("-----loop " + calcCrow(global["ghosts"][area][ghostsName][0], global["ghosts"][area][ghostsName][1], userData[c][useridI][0], userData[c][useridI][1]) )
                        console.log(global["ghosts"][area][ghostsName])


                        // // Give +1 to the user
                        if (!(isNaN(global["score"][useridI] + 1))) {

                                global["score"][useridI] = Number(global["score"][useridI] - 1);


                                if(config.use_database==='true'){
                                    connection.query("SELECT * from users where userid="+ useridI ,function(err,rows,fields){
                                    if(err) throw err;
                                    if(rows.length===1){
                                        console.log("update score  -> " +  global["score"][useridI]);
                                        connection.query("UPDATE users SET "+ "score" +" = '" + global["score"][useridI] + "' WHERE userid = '" + useridI +"'");

                                    }
                                    else{
                                            console.log("User already exists in database");
                                        }
                                    });

                                    // // Give opponent +1
                                    // global["ghosts"][area][ghostsName][2] = Number(global["ghosts"][area][ghostsName][2]+1);

                                    // // opponent has lost:
                                    // if (global["ghosts"][area][ghostsName][2] <= 0) {
                                    //     newOpponent (global["currentAreaName"][useridI],global["currentAreaPosition"][useridI],ghostsName)
                                    // };




                                }//e/fi
                            }//e/NaN




                    }; //e/fi

                    var distance = calcCrow(global["ghosts"][area][ghostsName][0], global["ghosts"][area][ghostsName][1], userData[c][useridI][0], userData[c][useridI][1]);

                    if ( (distance >= 0.1) && (distance <= 0.3)) { // 0199883    // 0.16

                        if (isNaN(Number(global["ghosts"][global["currentAreaName"][useridI]][ghostsName][1] + 1 )   ) ) {
                            console.log("NaN/e/2");
                            console.log(ghostsName);
                        }
                        else {
                            // global["ghosts"][area][ghostsName][0] =
                            console.log(ghostsName + " is very close to " + useridI);

                            if (! isNaN(Number(global["ghosts"][area][ghostsName][0] + 0.000035)) ) {
                                global["ghosts"][area][ghostsName][0] = Number(global["ghosts"][area][ghostsName][0] + 0.000005);
                            }//e/extra nan

                            if (!isNaN(Number(global["ghosts"][area][ghostsName][1] + 0.000015))) {
                                global["ghosts"][area][ghostsName][1] = Number(global["ghosts"][area][ghostsName][1] + 0.000005);
                            }//e/extra nan

                        }//e/sle



                    }; //e/fi

                    if ( (distance >= 1.5) && (distance <= 2.0)) { // 0199883    // 0.16

                        if (isNaN(Number(global["ghosts"][global["currentAreaName"][useridI]][ghostsName][1] + 1 )   ) ) {
                            console.log("NaN/e/2");
                            console.log(ghostsName);
                        }
                        else {
                            // global["ghosts"][area][ghostsName][0] =
                            console.log(ghostsName + " is very far from to " + useridI);

                            if (! isNaN(Number(global["ghosts"][area][ghostsName][0] + 0.000335)) ) {
                                global["ghosts"][area][ghostsName][0] = Number(global["ghosts"][area][ghostsName][0] + 0.000535);
                            }//e/extra nan

                            if (!isNaN(Number(global["ghosts"][area][ghostsName][1] + 0.000335))) {
                                global["ghosts"][area][ghostsName][1] = Number(global["ghosts"][area][ghostsName][1] + 0.000535);
                            }//e/extra nan

                        }//e/sle



                    }; //e/fi

                });//e/object
            });
        });

    }//e/attackUser

},1000);
