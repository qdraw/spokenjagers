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


// Servercode

var http = require('http');
var url = require('url');
var fs = require('fs');
var server;

//star server using http
server = http.createServer(function(req, res){
    // your normal server code
    var path = url.parse(req.url).pathname;

    // index support
    if (path === "/") {
    	path = "/index.html"
    };

    // read files
    fs.readFile(__dirname + path, function(err, data){
        if (err){ // on error serve 404
            return send404(path,res);
        }

        writeApacheLog(path,res,200);

        // Ban List User Agent Strings
        banList = ["Abrave Spider", "GingerCrawler", "HTTrack", "ichiro", "Image Stripper", "Image Sucker", "ISC Systems iRc", "JadynAveBot", "Java", "LexxeBot", "lwp::", "lwp-", "LinkWalker", "libwww-perl", "localbot", "Mass Downloader", "Missigua", "Locator", "Offline", "OpenAnything", "Purebot", "PycURL", "python", "python", "Python-xmlrpc", "SiteSnagger", "SiteSucker", "SuperBot", "swish-e", "Web Image Collector", "Web Sucker", "WebAuto", "WebCopier", "webcollage", "WebFetch", "WebLeacher", "WebReaper", "Website eXtractor", "WebStripper", "WebWhacker", "WebZIP", "Mail.ru", "Yandex", "WinHTTP", "bazqux"]

        // Add to ban Google, MS, Yahoo, Facbook
        banList.push("Googlebot");
        banList.push("MSNBot");
        banList.push("Yahoo");
        banList.push("FacebookExternalHit/1");
        banList.push("Pinterest");

        // if word is included string
        function wordInString(s, word){
            return new RegExp( '\\b' + word + '\\b', 'i').test(s);
        }

        // check if word contains in Array
        function contains(array,searchFor) {
            var i = array.length;
            while (i--) {
                containsword = wordInString(searchFor.toLowerCase(),array[i].toLowerCase());
                if (containsword) {
                    console.log(array[i]);
                    return true;
                };
            }
            return false;
        }


        // excuting banList
        if (contains(banList,req.headers['user-agent'])|| req.headers['user-agent'] === "") {
            return send404(path,res);
        };

        // end banList
        


        // MIME TYPES serve

        if (path.indexOf(".js") >= 0 ) {
            res.writeHead(200,{'Content-Type':'text/javascript'});
        };
        if (path.indexOf(".html") >= 0 ) {
            res.writeHead(200,{'Content-Type':'text/html'});
        };
        if (path.indexOf(".png") >= 0 ) {
            res.writeHead(200,{'Content-Type':'image/png'});
        };

        if (path.indexOf(".css") >= 0 ) {
            res.writeHead(200,{'Content-Type':'text/css'});
        };
        if (path.indexOf(".ico") >= 0 ) {
            res.writeHead(200,{'Content-Type':'image/x-icon'});
        };
        if (path.indexOf(".svg") >= 0 ) {
            res.writeHead(200,{'Content-Type':'image/svg+xml'});
        };

        // Serve 404 pages for GPX, and SRCGPX logs
        if (path.indexOf(".gpx") >= 0 ) {
            return send404(path,res);
        };
        if (path.indexOf(".srcgpx") >= 0 ) {
            return send404(path,res);
        };


        
        res.write(data, 'utf8');
        res.end();
    });


}),

send404 = function(path,res){
    res.writeHead(404);
    fs.readFile(__dirname + "/404.html", function(err, data){
        console.log(path);
        if (err){ 
		    res.write('That page cant be found.');
		    res.end();
            return;
        }
        res.write(data, 'utf8');
        res.end();

    });
};

// the server port
server.listen(8080);

// use socket.io
var io = require('socket.io').listen(server);

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
io.sockets.on('connection', function(socket){
    // Every User has one connection
    var userid = 0;
    global["userid"] = 0;

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


    // Send Time to Client
    setInterval(function(){
        socket.emit('date', {'date': new Date().getTime()});
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


    // Kill Bill function, kicking user out of the map, every 5 seconds
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


    }, 5000);






    // Opponent aka Spooks

    // min+max extensions use: [0,2].min()
    Array.prototype.max = function () {
        return Math.max.apply(Math, this);
    };

    Array.prototype.min = function () {
        return Math.min.apply(Math, this);
    };

    // return this type of object: with getCanvas of all active Users
    // Object {
    //     [ 
    //         [0] lowest Latitude (north-south)
    //         [1] highest Latitude
    //     ]
    //     [ 
    //         [0] lowest Longitude (east-west)
    //         [1] highest Longitude
    //     ]
    // }
    function getCanvas() {

        var latArray = [];
        var longArray = [];

        // Loop though all userData to create a list with all Lat. and Long. to check on lowest/heighest
        Object.keys(userData[c]).forEach(function(key) {
            try {
                if (userData[c][key][0] != 0) {
                    latArray.push(userData[c][key][0]);
                };
                if (userData[c][key][1] != 0) {
                    longArray.push(userData[c][key][1]);
                };
            }
            catch(e) {
            }

        });

        // extra check to avoid errors
        if (latArray.length != 0) {

            var latmin = latArray.min();
            var latmax = latArray.max();

            var longmin = longArray.min();
            var longmax = longArray.max();

            var latlongArray = [[latmin,latmax], [longmin,longmax]];


        }
        else {
            var latlongArray = 0
        }

        return latlongArray;
    }

 
    // Active Area where the spooks are active

    // This function return using this template:
    // var opponent = {
    //         "topRight":[Longitude ,latitude],
    //         "topLeft":[Longitude ,latitude],
    //         "bottomLeft":[Longitude ,latitude],
    //         "bottomRight":[Longitude ,latitude]
    // } 

    function writeOutbound () {
        
        // use theCanvas!
        var theCanvas = getCanvas();
        global["theCanvas"] = theCanvas;

        // check the Canvas on errors
        if (theCanvas != 0) {

            var latmin = theCanvas[0][0];
            var latmax = theCanvas[0][1];
            var longmin = theCanvas[1][0];
            var longmax = theCanvas[1][1];

            outbound = {
                "topLeft":[latmax+0.0006,longmin-0.0006,0],
                "topRight":[latmax+0.0006,longmax+0.0006,0],
                "bottomLeft":[latmin-0.0006,longmin-0.0006,0],
                "bottomRight":[latmin-0.0006,longmax+0.0006,0]                                                    
            }
            return outbound;
        }
        else {
            return 0;
        }

    }//e/writeOutbound


    // Random function to create floating numbers
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    //Random interer
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    // Check the area and send it to the user to display, the user display must be turned off
    setInterval(function(){
        global["area"] = writeOutbound();
        socket.emit('outbound', global["area"]);

        // // use this to send it once:
        // if (typeof global["area"] != "object") {
        //     global["area"] = writeOutbound();
        //     socket.emit('outbound', global["area"]);
        // };

    }, 1000);


    // Create for the first time Opponents
    setInterval(function(){

        // Check if Opponents exist
        try {
            if (global["opponent"]["opponent_0"][0] === 0) {
                var ready = true;
            };
        }
        catch(error){
            var ready = false;
        }

        if ((typeof global["theCanvas"] === "object")&& ready) {
            var theCanvas = global["theCanvas"];

            console.log("> Create for the first time Opponents");
            console.log(theCanvas)

            var latmin = theCanvas[0][0];
            var latmax = theCanvas[0][1];
            var longmin = theCanvas[1][0];
            var longmax = theCanvas[1][1];

            // loop for new Opponents
            // [lat,long,score, offEarthScore]
            for (var i = 0; i < opponent_lenght; i++) {
                global["opponent"]["opponent_" + i] = [getRandomArbitrary(latmin-0.0006, latmax+0.0006),getRandomArbitrary(longmin-0.0006, longmax+0.0006),10,15];
            };

        };

    }, 1000);


    // Create single Opponents, when you kill some, or moved out of canvas
    function newOpponent (i) {
            var theCanvas = global["theCanvas"];
            var latmin = theCanvas[0][0];
            var latmax = theCanvas[0][1];
            var longmin = theCanvas[1][0];
            var longmax = theCanvas[1][1];

            // [lat,long,score, offEarthScore]
            global["opponent"]["opponent_" + i] = [getRandomArbitrary(latmin-0.0006, latmax+0.0006),getRandomArbitrary(longmin-0.0006, longmax+0.0006),10,15];
    }
    

    // Move Opponents on the canvas
    setInterval(function(){

        // move left|right or down|up
        var oneORzero = getRandomInt(0, 1); 

        // all Opponents loop
        for (var i = 0; i < opponent_lenght; i++) {

            // error if statement
            if (global["opponent"]["opponent_0"][0] != 0 && global["area"] != 0 ) {

                // Gearbox, change the speed
                var speedInt = getRandomInt(0, 3);
                switch (speedInt){
                    case 0:
                        var speed = 0.000037/2;
                        break;
                    case 1:
                        var speed = 0.000057/2;
                        break;
                    case 2:
                        var speed = 0.00009/2;
                        break;
                    case 3:
                        var speed = 0.0001/2;
                        break;
                }
                var speedNeg = speed * -1;
                var value = getRandomArbitrary(speedNeg, speed);

                var position = Number(opponent["opponent_" + i][oneORzero]);
                var newPosition = Number(value + position);

                // Box protection
                if (oneORzero === 0) {
                    if ((global["area"]["topLeft"][0] > newPosition)&& (global["area"]["bottomRight"][0] < newPosition)) {
                    }
                    else {
                        // offEarthScore -1
                        newPosition = position;
                        global["opponent"]["opponent_" +i ][3] = Number(global["opponent"]["opponent_" +i][3] -1)
                    }
                }
                else {
                    if ((global["area"]["topLeft"][1] < newPosition)&& (global["area"]["bottomRight"][1] > newPosition)) {
                    }
                    else {
                        // offEarthScore -1
                        newPosition = position;
                        global["opponent"]["opponent_" +i][3] = Number(global["opponent"]["opponent_" +i][3] -1)
                    }
                }

                // write the new posistion:
                global["opponent"]["opponent_" + i][oneORzero] = newPosition;


                // Kill the offEarthScore
                if (global["opponent"]["opponent_" +i][3] < 0) {
                    newOpponent (i);
                };
               
            };
        };

        // Send oponnents to the user:
        socket.emit('opponent', global["opponent"]);

    }, 250); // doble speed



    // Score HANDELING , kill the opponent, seperate channel

    global["score"][userid] = 0;

    socket.on('shoot', function(shoot){

        // check if the shooting is inside the circle
        var isInBox = false;
        try {
            if (calcCrow(shoot.lat, shoot.lng, userData[c][userid][0], userData[c][userid][1]) <= 0.0199883) {
                console.log(shoot);
                var isInBox = true;
            };
        }
        catch(e) {}

        if (isInBox) {

            // Whitch opponent is in the circle and has been shot?
            for (var i = 0; i < opponent_lenght; i++) {

                var posLat = global["opponent"]["opponent_" + i][0];
                var posLng = global["opponent"]["opponent_" + i][1];

                // calculate the distance of the opponent related to the point that has been shot
                if (calcCrow(shoot.lat, shoot.lng, posLat, posLng) < 0.006) {


                    // Check Not a Number > give three points
                    if (isNaN(global["opponent"]["opponent_" + i][2])) {
                        global["opponent"]["opponent_" + i][2] = 3;
                    };

                    // Give -1 to opponent
                    global["opponent"]["opponent_" + i][2]--;

                    // display in terminal
                    console.log("> User: " + userid + " -> opponent " + i + ", score: " + global["opponent"]["opponent_" + i][2] );

                    // opponent has lost:
                    if (global["opponent"]["opponent_" + i][2] <= 0) {
                        global["opponent"]["opponent_" + i][0] = newOpponent (i); 
                        global["opponent"]["opponent_" + i][1] = newOpponent (i);
                    };


                    if (isNaN(global["score"][userid] + 1)) {
                        console.log("WARNING: Score restart");
                        global["score"][userid] = 0;
                    };

                    // Give +1 to the user
                    global["score"][userid]++;
                    // send score to user:
                    socket.emit('score', {"points": global["score"][userid]});
                };

                var posLat;
                var posLng;

            };

        var isInBox = false;

        };//e/isInBox

    });///e/shoot




    // Logger --> /logs/*.scrgpx
    setInterval(function(){

        try {
            if ((userData[c][userid][0] != 0) && (userData[c][userid][0] != undefined)) {
                var lat = userData[c][userid][0];
            };
            if ((userData[c][userid][1] != 0) && (userData[c][userid][1] != undefined)) {
                var lng = userData[c][userid][1];
                var altitude = userData[c][userid][3];
                var speed = userData[c][userid][4];

                if (altitude === 0 || altitude == undefined) {
                    altitude = -1000;
                };

                if (speed ===  null) {
                    speed = 0;
                };

                var myDate = new Date().toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
                var today = new Date().toJSON().slice(0,10);

                var logfilename = "logs/" + userid + ".srcgpx";

                var appendData = '<trkpt lat="'+ lat +'" lon="'+ lng +'">' + "\n" + "<ele>" + altitude + "</ele>\n" + "<time>" + today + "T" + myDate + "Z" +"</time>" + "\n<extensions>\n<speed>" + speed +"</speed>\n</extensions>\n"+ "</trkpt> \n";
                var appendData = appendData;

                if ( (lat != 0) && (lng != 0 ) && (userid != 0 )) {
                    fs.appendFile(logfilename, appendData, function (err) {
                    });                    
                };
            };

        }
        catch(e) {
            console.log("srcgpx writer fails under: " + userid);
        }


    }, 2000);

    setInterval(function(){
        try {
            // var fs = require('fs');
            var logfilename = "logs/" + userid + ".srcgpx";

            var file = "";
            fs.readFile(logfilename, 'utf8', function (err,data) {
              if (err) {
                return console.log(err);
              }
              // console.log(data);
              global["file_" + userid ] = data;
            });

            var logfilename = "logs/" + userid + ".gpx";

            var prevAppendData = '<?xml version="1.0" encoding="UTF-8" ?>' + "\n" + '<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="Qdraw" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd ">' + "\n" + "<trk>" +"\n" + "<name>Qdraw " + userid + "</name> \n <trkseg> \n\n";
            var afterAppendData = "</trkseg></trk></gpx>";
            writeFile = prevAppendData + global["file_" + userid ] + afterAppendData;
            fs.writeFile(logfilename, writeFile, function(err) {
                if(err) {
                    return console.log(err);
                }
            });
            global["file_" + userid ] = "";  
        }
        catch(e) {
            console.log("gpx writer fails");
        }
    }, 20000);


    // end of logger

});


function writeApacheLog(path,res,httpcode) {
 
    var ip = res.connection.remoteAddress || res.socket.remoteAddress || res.connection.socket.remoteAddress;
    // req.header('x-forwarded-for') ||

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

    var log = ip + " -  - ["+ day +"/" + month_names_short[d.getMonth()] + "/" + d.getFullYear() + ":" + myDate + " " + u + "] " + '"' + "GET " + path + " HTTP/1.0"+ '"' + " " + httpcode + " " + fileSizeInBytes + "\n";

    try {
        fs.appendFile("logs/access_log.src", log, function (err) {
        }); 
    }
    catch(e){}

    // var today = new Date().toJSON().slice(0,10);
    // console.log("today " + today);
    // var toda1y = new Date();
    // console.log("toda1y " + toda1y);



}


// START opponent as global variables to avoid diffececes between users:
global["opponent"] = {};
var opponent_lenght = 5;

startOpponent();
function startOpponent() {
    for (var i = 0; i < opponent_lenght; i++) {
                                            // xy, score offEarth
        global["opponent"]["opponent_" + i] = [0,0,0,0];
    };
}//e/startOpponent

// Global object Score:
global["score"] = {};




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

// Converts numeric degrees to radians
function toRad(Value){
    return Value * Math.PI / 180;
}




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
console.log("> Local IP: " + addresses);


console.log("> Script loaded");