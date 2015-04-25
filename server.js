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

var express				=		require('express')
	, passport			=		require('passport')
	, util				=		require('util')
	, FacebookStrategy	=		require('passport-facebook').Strategy
	, GoogleStrategy	=		require('passport-google-oauth').OAuth2Strategy
	, session			=		require('express-session')
	, cookieParser		=		require('cookie-parser')
	, bodyParser		=		require('body-parser')
	, config			=		require('./configuration/config')
	, mysql				=		require('mysql')

	, app				=		express()
	, http 				= 		require('http').Server(app)
	, io 				= 		require('socket.io')(http)
	, useragent			=		require('express-useragent')
	, fs				=		require('fs');


//Define MySQL parameter in Config.js file.
var connection = mysql.createConnection({
	host		 : config.host,
	user		 : config.username,
	password : config.password,
	database : config.database
});

//Connect to Database only if Config.js parameter is set.
if(config.use_database==='true'){
	connection.connect();

	connection.query('CREATE TABLE IF NOT EXISTS users (id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY, userid TEXT, displayname TEXT, email TEXT, health INTEGER, score INTEGER, money INTEGER, useragent TEXT, value TEXT, latestConnectionTime INT, area TEXT)',
	function(err, result){
	    // Case there is an error during the creation
	    if(err) {
	        console.log(err);
	    }
  		console.log('> mysql connected as id ' + connection.threadId);
	});

	// GHOST ITEM IN DB
	connection.query('CREATE TABLE IF NOT EXISTS ghosts (id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY, area TEXT, arealocation TEXT, spook1 TEXT, spook2 TEXT, spook3 TEXT, spook4 TEXT, spook5 TEXT, spook6 TEXT, spook7 TEXT)',
	function(err, result){
	    // Case there is an error during the creation
	    if(err) {
	        console.log(err);
	    }
	});

}// connection


// // only for locations logger
// if(config.use_database==='true'){

//     connection.query('CREATE TABLE IF NOT EXISTS locations (id MEDIUMINT NOT NULL AUTO_INCREMENT PRIMARY KEY)',
//     function(err, result){
//         // Case there is an error during the creation
//         if(err) {
//             console.log(err);
//         }
//     });

// }//fi

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'Lorum Ipsum Dolec, Dion de Hamster', key: 'Qsession'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));
app.set('port', process.env.PORT || 8080);

// app.use(useragent.express());

// Domain options, for testing and running on multiple domains
console.log( "Dirname " + __dirname);

// Just for testing and debugging
if (__dirname.indexOf("avans-individueel-verdieping-blok11-12")) {
    console.log("> callbackURL > localhost");
	global["callbackURL"] = "http://" + "localhost" + ":8080" + "/auth/facebook/callback"
}

if(__dirname === "/mnt/data/avans-individueel-verdieping-blok11-12") {
    console.log("> callbackURL > /mnt/data");
	global["callbackURL"] = "http://" + "xserve.qdraw.eu" + "/auth/facebook/callback"
}

if ( __dirname.indexOf("avans-individueel-verdieping-blok11-12") == -1) {
    console.log("> callbackURL > herokuapp");
	global["callbackURL"] = "https://" + "qdraw.herokuapp.com" + "/auth/facebook/callback";
}

// print process.argv ++ use: nodemon server.js ngrok
process.argv.forEach(function (val, index, array) {
    if (val === "ngrok") {
        console.log("> callbackURL > NGROK");
        global["callbackURL"] = "https://" + "qdraw.ngrok.io" + "/auth/facebook/callback";
    }
});


// GoogleStrategy to L:ogin
passport.use(new GoogleStrategy({
		clientID: config.google_api_key,
		clientSecret:config.google_api_secret ,
		callbackURL: global["callbackURL"].replace("facebook","google")
	},
	function(accessToken, refreshToken, profile, done) {
		console.log(profile);

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
		
		console.log(profile);
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
			connection.query("INSERT into users(userid,displayname,email) VALUES('"+ profile.id + "','" + profile.displayName + "','" + profile.emails[0].value + "')");
			global["sessionEnabled"][profile.id] = true;

            // only for logger
            // connection.query("ALTER TABLE locations ADD _" + String(profile.id) + "_ TEXT");

		}
		else{
				console.log("User already exists in database");
                readScore (profile.id);
                global["sessionEnabled"][profile.id] = true;
			}
		});
	}

}//e/authenticateUser


app.get('/', function(req, res){
    // console.log("Cookies: ", req.cookies);
	res.render('index', { user: req.user, cookies: req.cookies});
});

app.get('/account', ensureAuthenticated, function(req, res){
	res.render('account', { user: req.user });
});

app.get('/game', ensureAuthenticated, function(req, res){

    var expiryDate = new Date(Number(new Date()) + 315360000000); // aka now + 10 years
    res.cookie('provider', req.user.provider, { expires: expiryDate, httpOnly: true });

	res.render('game', { user: req.user });
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
    setInterval(function (argument) {
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
		// console.log("cpu " + cpuload)
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



    // New Session
    var isArealistAvailableBoolean = false;
    var currentAreaName = 0;
    var currentAreaPosition = 0;
    function isArealistAvailable () {


    	try { if (userData[c][userid][0] != 0) { var go = true;  } 	else { var go = false; }  	}   	catch(e){ 			var go = false;     	}

    	if (userid != 0 && go == true) {
    		clearInterval(isArealistAvailableInterval);

    		connection.query("SELECT COUNT(*) FROM ghosts",function(err, result){
    			if (result[0]["COUNT(*)"] == 0) {

    				console.log("> new area created COUNT(*)===0");

    				var newAreaNumber = 1;
    				var currentAreaNumber = 0;

					connection.query("INSERT into ghosts(area) VALUES('" + "area_" + newAreaNumber + "')");
	                connection.query("UPDATE ghosts SET "+ "arealocation" +" = '" + userData[c][userid][0] + "," + userData[c][userid][1] + "' WHERE area = '" + "area_" + newAreaNumber +"'");

	                connection.query("UPDATE users SET "+ "area" +" = '" + "area_" + newAreaNumber + "' WHERE userid = '" + userid +"'");
	                connection.query("UPDATE users SET "+ "latestConnectionTime" +" = '" + Math.floor(Date.now() / 1000) + "' WHERE userid = '" + userid +"'");

	                currentAreaName = "area_" + newAreaNumber;
	                currentAreaPosition = userData[c][userid][0] + "," + userData[c][userid][1];


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
				    	
				    	console.log(AreaListOfGeoLocation);

				    	if (AreaListOfGeoLocation.length === 0) {
				    		// Create a new area

				    		console.log("> Create a new area");
							connection.query("INSERT into ghosts(area) VALUES('" + "area_" + newAreaNumber  + "')");
			                connection.query("UPDATE ghosts SET "+ "arealocation" +" = '" + userData[c][userid][0] + "," + userData[c][userid][1] + "' WHERE area = '" + "area_" + newAreaNumber +"'");

			                connection.query("UPDATE users SET "+ "area" +" = '" + "area_" + newAreaNumber + "' WHERE userid = '" + userid +"'");
			                connection.query("UPDATE users SET "+ "latestConnectionTime" +" = '" + Math.floor(Date.now() / 1000) + "' WHERE userid = '" + userid +"'");

			                currentAreaName = "area_" + newAreaNumber;
			                currentAreaPosition = userData[c][userid][0] + "," + userData[c][userid][1];


			                isArealistAvailableBoolean = true;


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
			                
			                currentAreaName = "area_" + index;
			                currentAreaPosition = geo;

					
			                console.log("currentAreaPosition");
			                console.log(currentAreaPosition);

			                isArealistAvailableBoolean = true;

				    	};//e/fi
				    	

						
					});

    			}//e/els

			}); //e/select-counter


    	};
    	console.log("/e/isArealistAvailable");


    }//e/isArealistAvailable
    var isArealistAvailableInterval = setInterval(isArealistAvailable,500);




    var opponentHandelingStartBoolean = false;
    var opponentHandelingStart = setInterval(function () {
    	if (isArealistAvailableBoolean) {
    		clearInterval(opponentHandelingStart);

	    	global["ghosts"] = {};
        	global["ghosts"][currentAreaName] = {};	

		    connection.query('SELECT * FROM ghosts',function(err,selectResult)     {

		    	console.log(selectResult);


		    	// new spooks
			    connection.query('DESCRIBE ghosts',function(err,result) {
			    	var ghostsNamesArray = [];
			    	for (var i = 0; i < result.length; i++) {
			  		  	// console.log(result[i]);

			  		  	if (result[i]["Field"].indexOf("spook") > -1) {
				  		  	ghostsNamesArray.push(result[i]["Field"])
			  		  	};
			    	};
			    	// console.log(ghostsNamesArray);




			    	for (var i = 0; i < selectResult.length; i++) {

			  		  	if (selectResult[i]["area"] == currentAreaName) {

			  		  		console.log("if")
				  		  	console.log(selectResult[i]["area"]);

				  		  	for (var q = 0; q < ghostsNamesArray.length; q++) {
				  		  		// selectResult[i]["area"][ghostsNamesArray[i]]
				  		  		currentGhost = ghostsNamesArray[q];
				  		  		console.log("currentGhost")

				  		  		console.log(currentGhost)
				  		  		console.log(selectResult[i][currentGhost])

				  		  		try{
				  		  			var trysplit = selectResult[i][currentGhost].split(",");
				  		  		}catch(e){
				  		  			var trysplit = false;
				  		  		}
				  		  		if (trysplit != false) {
				  		  			var toSplit = selectResult[i][currentGhost].split(",");

				  		  			global["ghosts"][currentAreaName][currentGhost] = toSplit;

				  		  			// console.log("trysplit");
				  		  			// console.log(global["ghosts"][currentAreaName][currentGhost]);
				  		  		}//e/fi
				  		  	};///e/for

				  		};//e/fi
			    	};//e/for

	  		  		if (trysplit == false) {

				    	// making objects
				    	global["ghosts"] = {};
		            	global["ghosts"][currentAreaName] = {};


				    	for (var i = 0; i < ghostsNamesArray.length; i++) {

					    	arealocation = result[i]["arealocation"];
				    		if (arealocation != null) {

					    		var arealocation = arealocation.split(","); 

					    		var areaDistance = calcCrow(arealocation[0], arealocation[1], userData[c][userid][0], userData[c][userid][1]);
					    		// console.log(areaDistance);

				    		} else {
				    			// console.log("new spook");
				    			// console.log(currentAreaName);
				    			// console.log(currentAreaPosition);
					      //           console.log("currentAreaPosition " + currentAreaPosition);

				    			global["ghosts"][currentAreaName][ghostsNamesArray[i]] = {};

				    			newOpponent (currentAreaName,currentAreaPosition.split(","),ghostsNamesArray[i]);
				    		}//e/ls

				    	};//e/for
			    	    opponentHandelingStartBoolean = true;

					} //e/fi
					else {
			    	    opponentHandelingStartBoolean = true;
					};



			    }); //e/DESCRIBE
			}); //e/SELECT


    	};
    },1000);


	// Random function to create floating numbers
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    //Random interer
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    // Create single Opponents, when you kill some, or moved out of canvas
    function newOpponent (currentAreaName,currentAreaPosition,ghostsName) {

    		console.log(currentAreaPosition);

    		// var currentAreaPosition = currentAreaPosition.split(",");

            // [lat,long,score, offEarthScore]
            // used to be: 0.0006
            var areaLatLongOffset = 0.01;
            global["ghosts"][currentAreaName][ghostsName] = [getRandomArbitrary(Number(currentAreaPosition[0])-areaLatLongOffset, Number(currentAreaPosition[0])+areaLatLongOffset),getRandomArbitrary(Number(currentAreaPosition[1])-areaLatLongOffset, Number(currentAreaPosition[1])+areaLatLongOffset),10];
            
            // connection.query("UPDATE ghosts SET "+ ghostsName +" = '" + global["ghosts"][currentAreaName][ghostsName] + "' WHERE area = '" + currentAreaName +"'");
            console.log(global["ghosts"][currentAreaName][ghostsName]);



            // console.log("ghostsName");
            // console.log(ghostsName);
            console.log("global[ghosts][currentAreaName][ghostsName]");
            console.log(global["ghosts"][currentAreaName][ghostsName]);
            // console.log("currentAreaName");
            // console.log(currentAreaName);


            ghostcors =  global["ghosts"][currentAreaName][ghostsName][0] + "," + global["ghosts"][currentAreaName][ghostsName][1] + "," + global["ghosts"][currentAreaName][ghostsName][2];
            // console.log("ghostcors");

            // console.log(ghostcors);

            // UPDATE Customers SET ContactName='Alfred Schmidt', City='Hamburg' WHERE CustomerName='Alfreds Futterkiste'; 

            connection.query("UPDATE ghosts SET "+ ghostsName +" = '" + ghostcors + "' WHERE area = '" + currentAreaName +"'");

				// 	                connection.query("UPDATE users SET "+ "score" +" = '" + global["score"][userid] + "' WHERE userid = '" + userid +"'");


    }//e/newOpponent








    var sendGhostsToUser = setInterval(function () {
    	if (opponentHandelingStartBoolean) {
    		// console.log(global["ghosts"]);
    		socket.emit('ghosts', JSON.stringify(global["ghosts"]));
    	};
    },1000);



    var moveGhosts = setInterval(function () {
    	if (opponentHandelingStartBoolean) {

			// currentAreaName
			// currentAreaPosition

			// global["ghosts"][currentAreaName]

			Object.keys(global["ghosts"]).forEach(function(area) {
				Object.keys(global["ghosts"][area]).forEach(function(ghostsName) {
					// console.log(ghostsName + " " + ghosts[area][ghostsName]);

					moveOpponent (currentAreaName,currentAreaPosition.split(","),ghostsName)

				});
			});




    	};///e/opponent~Boolean
    },1000);



    function moveOpponent (currentAreaName,currentAreaPosition,ghostsName) {

            // console.log("---------------------------");

            // console.log("ghostsName");
            // console.log(ghostsName);

            // console.log("global[ghosts][currentAreaName][ghostsName]");
            // console.log(global["ghosts"][currentAreaName][ghostsName]);

            // console.log("global[ghosts][currentAreaName][ghostsName]00000");
            // console.log(global["ghosts"][currentAreaName][ghostsName][0]);
            // console.log("global[ghosts][currentAreaName][ghostsName]111110");
            // console.log(global["ghosts"][currentAreaName][ghostsName][1]);

            // console.log("currentAreaName");
            // console.log(currentAreaName);

            // console.log("currentAreaPosition");
            // console.log(currentAreaPosition);
          


    		var areaDistance = calcCrow(global["ghosts"][currentAreaName][ghostsName][0], global["ghosts"][currentAreaName][ghostsName][1], currentAreaPosition[0], currentAreaPosition[1]);

    		// console.log(areaDistance);

    		if (areaDistance >= 1) {
    			newOpponent (currentAreaName,currentAreaPosition,ghostsName);
    		};

            var speed = 0.00005;
			var speedNeg = speed * -1;
            var value = getRandomArbitrary(speedNeg, speed);

            var topORleft = getRandomInt(0,1);

            if (isNaN(Number(global["ghosts"][currentAreaName][ghostsName][topORleft] +1 )   ) ) {
            	console.log("NaN/e")
            }
            else {
	            global["ghosts"][currentAreaName][ghostsName][topORleft] = (Number(global["ghosts"][currentAreaName][ghostsName][topORleft]) + value);
            }




            ghostcors =  global["ghosts"][currentAreaName][ghostsName][0] + "," + global["ghosts"][currentAreaName][ghostsName][1] + "," + global["ghosts"][currentAreaName][ghostsName][2]
            connection.query("UPDATE ghosts SET "+ ghostsName +" = '" + ghostcors + "' WHERE area = '" + currentAreaName +"'");




                        // var areaLatLongOffset = 0.01;

            // global["ghosts"][currentAreaName][ghostsName] = [getRandomArbitrary(Number(currentAreaPosition[0])-areaLatLongOffset, Number(currentAreaPosition[0])+areaLatLongOffset),getRandomArbitrary(Number(currentAreaPosition[1])-areaLatLongOffset, Number(currentAreaPosition[1])+areaLatLongOffset),10,30];



    }//e/move.op


	// // Score HANDELING , kill the opponent, seperate channel 

    socket.on('shoot', function(shoot){
    	if (opponentHandelingStartBoolean) {

	        // check if the shooting is inside the circle
	        var isInBox = false;
	        try {
	            if (calcCrow(shoot.lat, shoot.lng, userData[c][userid][0], userData[c][userid][1]) <= 0.0199883) {
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
				                    	newOpponent (currentAreaName,currentAreaPosition,ghostsName)
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
	                if (calcCrow(shoot.lat, shoot.lng, posLat, posLng) < 0.0199883) {



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

            clearInterval(DisplayScore);
        };
		// console.log(global["score"]);

	}, 500);

   
    // // return this type of object: with getCanvas of all active Users
    // // Object {
    // //     [ 
    // //         [0] lowest Latitude (north-south)
    // //         [1] highest Latitude
    // //     ]
    // //     [ 
    // //         [0] lowest Longitude (east-west)
    // //         [1] highest Longitude
    // //     ]
    // // }
    // function getCanvas() {

    //     var latArray = [];
    //     var longArray = [];

    //     // Loop though all userData to create a list with all Lat. and Long. to check on lowest/heighest
    //     Object.keys(userData[c]).forEach(function(key) {
    //         try {
    //             if (userData[c][key][0] != 0) {
    //                 latArray.push(userData[c][key][0]);
    //             };
    //             if (userData[c][key][1] != 0) {
    //                 longArray.push(userData[c][key][1]);
    //             };
    //         }
    //         catch(e) {
    //         }

    //     });

    //     // extra check to avoid errors
    //     if (latArray.length != 0) {

    //         var latmin = latArray.min();
    //         var latmax = latArray.max();

    //         var longmin = longArray.min();
    //         var longmax = longArray.max();

    //         var latlongArray = [[latmin,latmax], [longmin,longmax]];


    //     }
    //     else {
    //         var latlongArray = 0
    //     }

    //     return latlongArray;
    // }

 
    // // Active Area where the spooks are active

    // // This function return using this template:
    // // var opponent = {
    // //         "topRight":[Longitude ,latitude],
    // //         "topLeft":[Longitude ,latitude],
    // //         "bottomLeft":[Longitude ,latitude],
    // //         "bottomRight":[Longitude ,latitude]
    // // } 
    // function writeOutbound () {
        
    //     // use theCanvas!
    //     var theCanvas = getCanvas();
    //     global["theCanvas"] = theCanvas;

    //     // check the Canvas on errors
    //     if (theCanvas != 0) {

    //         var latmin = theCanvas[0][0];
    //         var latmax = theCanvas[0][1];
    //         var longmin = theCanvas[1][0];
    //         var longmax = theCanvas[1][1];

    //         outbound = {
    //             "topLeft":[latmax+0.0006,longmin-0.0006,0],
    //             "topRight":[latmax+0.0006,longmax+0.0006,0],
    //             "bottomLeft":[latmin-0.0006,longmin-0.0006,0],
    //             "bottomRight":[latmin-0.0006,longmax+0.0006,0]                                                    
    //         }
    //         return outbound;
    //     }
    //     else {
    //         return 0;
    //     }

    // }//e/writeOutbound



    // // Check the area and send it to the user to display, the user display must be turned off
    // setInterval(function(){
    //     global["area"] = writeOutbound();
    //     socket.emit('outbound', global["area"]);

    //     // // use this to send it once:
    //     // if (typeof global["area"] != "object") {
    //     //     global["area"] = writeOutbound();
    //     //     socket.emit('outbound', global["area"]);
    //     // };

    // }, 1000);


    // // Create for the first time Opponents
    // setInterval(function(){

    //     // Check if Opponents exist
    //     try {
    //         if (global["opponent"]["opponent_0"][0] === 0) {
    //             var ready = true;
    //         };
    //     }
    //     catch(error){
    //         var ready = false;
    //     }

    //     if ((typeof global["theCanvas"] === "object")&& ready) {
    //         var theCanvas = global["theCanvas"];

    //         console.log("> Create for the first time Opponents");
    //         console.log(theCanvas)

    //         var latmin = theCanvas[0][0];
    //         var latmax = theCanvas[0][1];
    //         var longmin = theCanvas[1][0];
    //         var longmax = theCanvas[1][1];

    //         // loop for new Opponents
    //         // [lat,long,score, offEarthScore]
    //         for (var i = 0; i < opponent_lenght; i++) {
    //             global["opponent"]["opponent_" + i] = [getRandomArbitrary(latmin-0.0006, latmax+0.0006),getRandomArbitrary(longmin-0.0006, longmax+0.0006),10,30];
    //         };

    //     };

    // }, 1000);


    // // Create single Opponents, when you kill some, or moved out of canvas
    // function newOpponent (i) {
    //         var theCanvas = global["theCanvas"];
    //         var latmin = theCanvas[0][0];
    //         var latmax = theCanvas[0][1];
    //         var longmin = theCanvas[1][0];
    //         var longmax = theCanvas[1][1];

    //         // [lat,long,score, offEarthScore]
    //         global["opponent"]["opponent_" + i] = [getRandomArbitrary(latmin-0.0006, latmax+0.0006),getRandomArbitrary(longmin-0.0006, longmax+0.0006),10,30];
    // }
    

    // // Move Opponents on the canvas
    // setInterval(function(){

    //     // move left|right or down|up
    //     var oneORzero = getRandomInt(0, 1); 

    //     // all Opponents loop
    //     for (var i = 0; i < opponent_lenght; i++) {

    //         // error if statement
    //         if (global["opponent"]["opponent_0"][0] != 0 && global["area"] != 0 ) {

    //             // Gearbox, change the speed
    //             var speedInt = getRandomInt(0, 3);
    //             switch (speedInt){
    //                 case 0:
    //                     var speed = 0.000037/2;
    //                     break;
    //                 case 1:
    //                     var speed = 0.000057/2;
    //                     break;
    //                 case 2:
    //                     var speed = 0.00009/2;
    //                     break;
    //                 case 3:
    //                     var speed = 0.0001/2;
    //                     break;
    //             }
    //             var speedNeg = speed * -1;
    //             var value = getRandomArbitrary(speedNeg, speed);

    //             // Make it less random to the right top
    //             if ((global["area"]["topLeft"][oneORzero] > newPosition)&& (Number(global["area"]["topLeft"][oneORzero]-0.00006) < newPosition)) {
    //                 if (i%3 === 2) {
    //                     value -= Number(0.000037/1.5);
    //                 };///e/fi
    //             }//e/fi
    //             else {
    //                 if (i%3 === 2) {
    //                     value += Number(0.000037/1.5);
    //                 };///e/fi
    //             }



    //             var position = Number(opponent["opponent_" + i][oneORzero]);
    //             var newPosition = Number(value + position);

    //             // Box protection
    //             if (oneORzero === 0) {
    //                 if ((global["area"]["topLeft"][0] > newPosition)&& (global["area"]["bottomRight"][0] < newPosition)) {
    //                 }
    //                 else {
    //                     // offEarthScore -1
    //                     newPosition = position;
    //                     global["opponent"]["opponent_" +i ][3] = Number(global["opponent"]["opponent_" +i][3] -1)
    //                 }
    //             }
    //             else {
    //                 if ((global["area"]["topLeft"][1] < newPosition)&& (global["area"]["bottomRight"][1] > newPosition)) {
    //                 }
    //                 else {
    //                     // offEarthScore -1
    //                     newPosition = position;
    //                     global["opponent"]["opponent_" +i][3] = Number(global["opponent"]["opponent_" +i][3] -1)
    //                 }
    //             }

    //             // write the new posistion:
    //             global["opponent"]["opponent_" + i][oneORzero] = newPosition;


    //             // Kill the offEarthScore
    //             if (global["opponent"]["opponent_" +i][3] < 0) {
    //                 newOpponent (i);
    //             };

    //             var posLat = global["opponent"]["opponent_" + i][0];
    //             var posLng = global["opponent"]["opponent_" + i][1];



    //             // Object.keys(userData[c]).forEach(function(key) {
    //             // });


    //             // 0.0199883 === the isInBox
    //             // 0.006 === shooterea user

    //             try {
    //                 if (calcCrow(userData[c][userid][0], userData[c][userid][1], posLat, posLng) < 0.006) {
    //                     console.log("hit by " + i);

	   //                  if (!(isNaN(global["score"][userid] + 1))) {

	   //                      // Give -1 to the user
	   //                      global["score"][userid] = Number(global["score"][userid] - 1);
	   //                      // send score to db


		  //       			if(config.use_database==='true'){
				// 				connection.query("SELECT * from users where userid="+ userid ,function(err,rows,fields){
				// 				if(err) throw err;
				// 				if(rows.length===1){
				// 					console.log("update score  -> " +  global["score"][userid]);
				// 					// connection.query("INSERT into users(score) VALUES('" + global["score"][userid] + "')");
				// 					// 'SELECT * FROM users WHERE userid = ?', [userid]
				// 	                connection.query("UPDATE users SET "+ "score" +" = '" + global["score"][userid] + "' WHERE userid = '" + userid +"'");

				// 				}
				// 				else{
				// 						console.log("User already exists in database");
				// 					}
				// 				});
				// 			}


				// 		}//e/NaN

    //                     // send score to user:
    //                     socket.emit('score', {"points": global["score"][userid]});

    //                 }//e/fi
                    
    //             }catch(e){}



               
    //         };
    //     };


    //     // Send oponnents to the user:
    //     socket.emit('opponent', global["opponent"]);

    // }, 250); // doble speed



    // Score HANDELING , kill the opponent, seperate channel 

 //    socket.on('shoot', function(shoot){

 //        // check if the shooting is inside the circle
 //        var isInBox = false;
 //        try {
 //            if (calcCrow(shoot.lat, shoot.lng, userData[c][userid][0], userData[c][userid][1]) <= 0.0199883) {
 //                console.log(shoot);
 //                var isInBox = true;
 //            };
 //        }
 //        catch(e) {}

 //        if (isInBox) {

 //            // Whitch opponent is in the circle and has been shot?
 //            for (var i = 0; i < opponent_lenght; i++) {

 //                var posLat = global["opponent"]["opponent_" + i][0];
 //                var posLng = global["opponent"]["opponent_" + i][1];

 //                // calculate the distance of the opponent related to the point that has been shot
 //                if (calcCrow(shoot.lat, shoot.lng, posLat, posLng) < 0.006) {



 //                    // Give -1 to opponent
 //                    // global["opponent"]["opponent_" + i][2]--;

 //                    // display in terminal
 //                    console.log("> User: " + userid + " -> opponent " + i + ", score: " + global["opponent"]["opponent_" + i][2] );

 //                    // opponent has lost:
 //                    if (global["opponent"]["opponent_" + i][2] <= 0) {
 //                        global["opponent"]["opponent_" + i][0] = newOpponent (i); 
 //                        global["opponent"]["opponent_" + i][1] = newOpponent (i);
 //                    };

 //                    // if (isNaN(global["score"][userid] + 1)) {
 //                    //     console.log("WARNING: Score restart");
 //                    //     global["score"][userid] = 0;
 //                    // };

 //                    // Read Score from database
 //                    // readScore (userid);

 //                    // Send it to User
 //                    // sendScore (socket,userid);

 //                    // updatePoints ("score",1,userid)

 //                    // // Give +1 to the user
 //                    if (!(isNaN(global["score"][userid] + 1))) {

	//                     global["score"][userid] = Number(global["score"][userid] + 1);


	//         			if(config.use_database==='true'){
	// 						connection.query("SELECT * from users where userid="+ userid ,function(err,rows,fields){
	// 						if(err) throw err;
	// 						if(rows.length===1){
	// 							console.log("update score  -> " +  global["score"][userid]);
	// 							// connection.query("INSERT into users(score) VALUES('" + global["score"][userid] + "')");
	// 							// 'SELECT * FROM users WHERE userid = ?', [userid]
	// 			                connection.query("UPDATE users SET "+ "score" +" = '" + global["score"][userid] + "' WHERE userid = '" + userid +"'");

	// 						}
	// 						else{
	// 								console.log("User already exists in database");
	// 							}
	// 						});
	// 					}//e/fi

	// 				}//e/NaN

 //                    // // send score to user:
 //                    socket.emit('score', {"points": global["score"][userid]});
 //                };

 //                var posLat;
 //                var posLng;

 //            };

 //        var isInBox = false;

 //        };//e/isInBox

 //    });///e/shoot


 //    var DisplayScore = setInterval(function(){

 //        if (!isNaN(global["score"][userid])) {
 //            // // send score to user:
 //            socket.emit('score', {"points": global["score"][userid]});
 //            socket.emit('money', {"money": global["money"][userid]});
 //            socket.emit('health', {"health": global["health"][userid]});

 //            clearInterval(DisplayScore);
 //        };
	// 	// console.log(global["score"]);

	// }, 500);


    // // logger database
    // if(config.use_database==='true'){

    //     setInterval(function(){


    //         if (userid != 0) {
    //             try {
    //                 if ((userData[c][userid][0] != 0) && (userData[c][userid][0] != undefined)) {
    //                     var lat = userData[c][userid][0];
    //                 };
    //                 if ((userData[c][userid][1] != 0) && (userData[c][userid][1] != undefined)) {
    //                     var lng = userData[c][userid][1];
    //                     var altitude = userData[c][userid][3];
    //                     var speed = userData[c][userid][4];

    //                     if (altitude === 0 || altitude == undefined) {
    //                         altitude = -1000;
    //                     };

    //                     if (speed ===  null || speed ===  undefined) {
    //                         speed = 0;
    //                     };

    //                     var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    //                     var today = new Date().toJSON().slice(0,10);

    //                     var appendData = lat + ";" + lng + ";" + altitude + ";" + today + "T" + myDate + "Z" + ";" + speed;

    //                     if ( (lat != 0) && (lng != 0 ) && (userid != 0 )) {
    //                         connection.query("INSERT INTO locations (_" + userid + "_) VALUES('" + appendData + "')"); 
    //                         console.log("appendData")                
    //                     };
    //                 };

    //             }
    //             catch(e) {
    //                 console.log("srcgpx writer fails under: " + userid);
    //             }
    //         };///e/userid



    //     }, 2000);

    // }



    // // // Logger --> /logs/*.scrgpx
    // setInterval(function(){

    //     if (userid != 0) {
    //         try {
    //             if ((userData[c][userid][0] != 0) && (userData[c][userid][0] != undefined)) {
    //                 var lat = userData[c][userid][0];
    //             };
    //             if ((userData[c][userid][1] != 0) && (userData[c][userid][1] != undefined)) {
    //                 var lng = userData[c][userid][1];
    //                 var altitude = userData[c][userid][3];
    //                 var speed = userData[c][userid][4];

    //                 if (altitude === 0 || altitude == undefined) {
    //                     altitude = -1000;
    //                 };

    //                 if (speed ===  null) {
    //                     speed = 0;
    //                 };

    //                 var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    //                 var today = new Date().toJSON().slice(0,10);

    //                 var logfilename = "logs/" + userid + ".srcgpx";

    //                 var appendData = '<trkpt lat="'+ lat +'" lon="'+ lng +'">' + "\n" + "<ele>" + altitude + "</ele>\n" + "<time>" + today + "T" + myDate + "Z" +"</time>" + "\n<extensions>\n<speed>" + speed +"</speed>\n</extensions>\n"+ "</trkpt> \n";
    //                 var appendData = appendData;

    //                 if ( (lat != 0) && (lng != 0 ) && (userid != 0 )) {
    //                     fs.appendFile(logfilename, appendData, function (err) {
    //                     });                    
    //                 };
    //             };

    //         }
    //         catch(e) {
    //             console.log("srcgpx writer fails under: " + userid);
    //         }
    //     };///e/userid

    // }, 2000);

    // setInterval(function(){
    //     if (userid != 0) {
    //         try {
    //             // var fs = require('fs');
    //             var logfilename = "logs/" + userid + ".srcgpx";

    //             var file = "";
    //             fs.readFile(logfilename, 'utf8', function (err,data) {
    //               if (err) {
    //                 return console.log(err);
    //               }
    //               // console.log(data);
    //               global["file_" + userid ] = data;
    //             });

    //             var logfilename = "logs/" + userid + ".gpx";

    //             var prevAppendData = '<?xml version="1.0" encoding="UTF-8" ?>' + "\n" + '<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="Qdraw" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd ">' + "\n" + "<trk>" +"\n" + "<name>Qdraw " + userid + "</name> \n <trkseg> \n\n";
    //             var afterAppendData = "</trkseg></trk></gpx>";
    //             writeFile = prevAppendData + global["file_" + userid ] + afterAppendData;
    //             fs.writeFile(logfilename, writeFile, function(err) {
    //                 if(err) {
    //                     return console.log(err);
    //                 }
    //             });
    //             global["file_" + userid ] = "";  
    //         }
    //         catch(e) {
    //             console.log("gpx writer fails");
    //         }
    //     };///e/userid

    // }, 20000);
    // // end of logger




});///e/connection


function writeApacheLog(path,req,httpcode) {


 
    try {
        var ip = req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
        // req.header('x-forwarded-for') ||
    }
    catch(e){
        var ip = "127.0.0.1";
    }

     // 127.0.0.1 - frank [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326 

    var month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
    var d = new Date();
    var n = d.getTimezoneOffset();
    var o = n * -1;
    var p = o / 60;
    if ((p >= 0)&& (p <= 9) ) {
        var u = "+0" + p + ":00";
    };

    var day = d.getUTCDate();
    if ((day >= 0)&& (day <= 9) ) {
        day = "0" + day;
    }

    var stats = fs.statSync(__dirname + path);
    var fileSizeInBytes = stats["size"]    

    var log = ip + " -  - ["+ day +"/" + month_names_short[d.getMonth()] + "/" + d.getFullYear() + ":" + myDate + " " + u + "] " + '"' + "GET " + path + " HTTP/1.1"+ '"' + " " + httpcode + " " + fileSizeInBytes + ' "-" ' + '"' + req.headers['user-agent'] + '"' + "\n";

    try {
        fs.appendFile("logs/access.log", log, function (err) {
        }); 
    }
    catch(e){}

    // // requires database.js
    // updatePoints("score", userid);

    // var today = new Date().toJSON().slice(0,10);
    // console.log("today " + today);
    // var toda1y = new Date();
    // console.log("toda1y " + toda1y);

}//e/apache


// global["spooks"] = {};




// Global object Score:
global["score"] = {};
global["health"] = {};
global["money"] = {};

function readScore (userid) {

    console.log("userid > " +userid);


    if(config.use_database==='true'){
        connection.query("SELECT * from users where userid="+ userid ,function(err,rows,fields){
        if(err) throw err;
        if(rows.length===1){
            console.log(" <> rows");
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








