// Servercode

var http = require('http');
var url = require('url');
var fs = require('fs');
var server;

server = http.createServer(function(req, res){
    // your normal server code
    var path = url.parse(req.url).pathname;

    if (path === "/") {
    	path = "/index.html"
    };

    fs.readFile(__dirname + path, function(err, data){
        if (err){ 
            return send404(path,res);
        }

        // Ban List
        banList = ["Abrave Spider", "GingerCrawler", "HTTrack", "ichiro", "Image Stripper", "Image Sucker", "ISC Systems iRc", "JadynAveBot", "Java", "LexxeBot", "lwp::", "lwp-", "LinkWalker", "libwww-perl", "localbot", "Mass Downloader", "Missigua", "Locator", "Offline", "OpenAnything", "Purebot", "PycURL", "python", "python", "Python-xmlrpc", "SiteSnagger", "SiteSucker", "SuperBot", "swish-e", "Web Image Collector", "Web Sucker", "WebAuto", "WebCopier", "webcollage", "WebFetch", "WebLeacher", "WebReaper", "Website eXtractor", "WebStripper", "WebWhacker", "WebZIP", "Mail.ru", "Yandex", "WinHTTP", "bazqux"]

        banList.push("Googlebot");
        banList.push("MSNBot");
        banList.push("Yahoo");
        banList.push("FacebookExternalHit/1");
        banList.push("Pinterest");

        function wordInString(s, word){
            return new RegExp( '\\b' + word + '\\b', 'i').test(s);
        }

        function contains(array,searchFor) {
            var i = array.length;
            while (i--) {
                containsword = wordInString(searchFor.toLowerCase(),array[i].toLowerCase());
                // console.log(containsword);
                if (containsword) {
                    console.log(array[i]);

                    return true;
                };

                // // if (this[i] === obj){
                // if (this[i].indexOf(obj.toLowerCase()) >= 0) {
                //     console.log(this[i]);
                //     return true;
                // }
            }
            return false;
        }



        if (contains(banList,req.headers['user-agent'])|| req.headers['user-agent'] === "") {
            return send404(path,res);
        };

        // end banList
        

        // res.writeHead(200, {'Content-Type': path == '.js' ? 'text/javascript' : 'text/html'});

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

server.listen(8080);

// use socket.io
var io = require('socket.io').listen(server);

var userData = {
    0: {},
    1: {},
    2: {}
};

var latestConnectionTime = {};

var c = 0;

var isFirstRun = true;

// define interactions with client
io.sockets.on('connection', function(socket){

    var userid = "";

    //recieve client data
    socket.on('data', function(data){
        procesData(data);
    });
    
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


    setInterval(function(){
         socket.emit('users', userData[c]);
    }, 500);

    // stuur tijd door naar client:
    setInterval(function(){
        // socket.emit('date', {'date': new Date()});
        socket.emit('date', {'date': new Date().getTime()});

    }, 1000);

    // Error handeling:
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


    // Kill Bill function
    setInterval(function(){


        Object.keys(latestConnectionTime).forEach(function(key) {

            var diffence = new Date().getTime() - latestConnectionTime[key]

            if (diffence > 10000) {
                console.log(key + " " + diffence);

                userData[0][key] = [ 0, 0];
                userData[1][key] = [ 0, 0];
                userData[2][key] = [ 0, 0];

            };

        });


    }, 5000);






    // All users logedin, make a canvas within 

    Array.prototype.max = function () {
        return Math.max.apply(Math, this);
    };

    Array.prototype.min = function () {
        return Math.min.apply(Math, this);
    };

    function minMaxLatLng () {
        var latArray = [];
        var longArray = [];

        Object.keys(userData[c]).forEach(function(key) {
            try {
                    // console.log(userData[c][key][0]);
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

    }//e/ 

   function playgroundSize (minMaxLatLngData) {

        if (minMaxLatLngData != 0) {
            var latmin = minMaxLatLngData[0][0], 
                latmax = minMaxLatLngData[0][1],
                longmin = minMaxLatLngData[1][0],
                longmax = minMaxLatLngData[1][1];
            var playgroundSizeData = {
                "topLeft":[latmax+0.0006,longmin-0.0006,0],
                "topRight":[latmax+0.0006,longmax+0.0006,0],
                "bottomLeft":[latmin-0.0006,longmin-0.0006,0],
                "bottomRight":[latmin-0.0006,longmax+0.0006,0],
            }
            return playgroundSizeData;
        };

    }


    // Calculate and Send to Client > PlaygroundSize
    setInterval(function(){
        var minMaxLatLngData = minMaxLatLng();
        // use for Add new user:
        global["minMaxLatLngData"] = minMaxLatLngData;

        var playgroundSizeData = playgroundSize (minMaxLatLngData);
        // for box control and update players
        global["playgroundSizeData"] = playgroundSizeData;

        socket.emit('playgroundSizeData', playgroundSizeData);
    }, 1003);



    // Random
    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

 
   // Add New opponents if user login in

    setInterval(function(){
        //check: addNewOpponents
        try {
            if (global["opponent"]["opponent_0"][0] === 0) {
                var ready = true;
            };
        }
        catch(error){
            var ready = false;
        }

        if (typeof global["minMaxLatLngData"] === "object") {
            
            // Read playgroundSizeData!
            var minMaxLatLngData = global["minMaxLatLngData"];
            var latmin = minMaxLatLngData[0][0];
            var latmax = minMaxLatLngData[0][1];
            var longmin = minMaxLatLngData[1][0];
            var longmax = minMaxLatLngData[1][1];
        }

        if (ready) {
            for (var i = 0; i < addNewOpponents; i++) {
                global["opponent"]["opponent_" + i] = [getRandomArbitrary(latmin-0.0006, latmax+0.0006),getRandomArbitrary(longmin-0.0006, longmax+0.0006)];
            };
            global["opponent_lenght"] = addNewOpponents;
        };

    }, 1000);


    // Single New Opponent
    function newOpponent (i) {

        global["minMaxLatLngData"] = minMaxLatLng();
        // Read playgroundSizeData!
        // var minMaxLatLngData = global["minMaxLatLngData"];
        var latmin = minMaxLatLngData[0][0];
        var latmax = minMaxLatLngData[0][1];
        var longmin = minMaxLatLngData[1][0];
        var longmax = minMaxLatLngData[1][1];

        // var newPosition = [getRandomArbitrary(latmin-0.0006, latmax+0.0006),getRandomArbitrary(longmin-0.0006, longmax+0.0006)];
        global["opponent"]["opponent_" + i] = [getRandomArbitrary(latmin-0.0006, latmax+0.0006),getRandomArbitrary(longmin-0.0006, longmax+0.0006)];

        if ((global["playgroundSizeData"]["topLeft"][0] > global["opponent"]["opponent_" + i][0])&& (global["playgroundSizeData"]["bottomRight"][0] < global["opponent"]["opponent_" + i][0])) {

            console.log("Error 0");
        }

        if ((global["playgroundSizeData"]["topLeft"][1] < global["opponent"]["opponent_" + i][1])&& (global["playgroundSizeData"]["bottomRight"][1] > global["opponent"]["opponent_" + i][1])) {
            console.log("Error 1");
        }

        console.log(global["opponent"]["opponent_" + i]);
    }//e/newOpponent
    


   // // // opponent Move
    setInterval(function(){

        var oneORzero = getRandomInt(0, 1); 


        for (var i = 0; i < addNewOpponents; i++) {

            if (global["opponent"]["opponent_0"][0] != 0) {

                var speedInt = getRandomInt(0, 3);

                switch (speedInt){
                    case 0:
                        var value = getRandomArbitrary(-0.000037, +0.000037);
                        // console.log(0);
                        break;
                    case 1:
                        var value = getRandomArbitrary(-0.000057, +0.000057);
                        // console.log(1);
                        break;
                    case 2:
                        var value = getRandomArbitrary(-0.00009, +0.00009);
                        // console.log(2);
                        break;
                    case 3:
                        var value = getRandomArbitrary(-0.00010, +0.00010);
                        // console.log(3);
                        break;
                }
               

                var newPosition = "0";

                try {

                    // box protection
                    if (typeof global["playgroundSizeData"]["topLeft"][1] === "number") {

                        var position = Number(opponent["opponent_" + i][oneORzero]);
                        newPosition = Number(value + position);

                        if ( global["opponent"]["opponent_" + i][3]  == undefined  ) {
                            global["opponent"]["opponent_" + i][3] = 15;
                        };


                        if (oneORzero === 0) {
                            if ((global["playgroundSizeData"]["topLeft"][0] > newPosition)&& (global["playgroundSizeData"]["bottomRight"][0] < newPosition)) {
                            }
                            else {
                                newPosition = position;
                                console.log(opponent["opponent_" + i][3] + " top/bottom == wrong")
                                opponent["opponent_" + i][3]--;
                            }
                        }
                        else {
                            if ((global["playgroundSizeData"]["topLeft"][1] < newPosition)&& (global["playgroundSizeData"]["bottomRight"][1] > newPosition)) {
                            }
                            else {
                                newPosition = position;
                                console.log(opponent["opponent_" + i][3] + " left/right == wrong")
                                opponent["opponent_" + i][3]--;
                            }
                        }

                    };
                }
                catch(e){}


                if (opponent["opponent_" + i][3] < 0) {
                    newOpponent (i);
                };

                global["opponent"]["opponent_" + i][oneORzero] = newPosition;


                // // Number(opponent["opponent_" + i][oneORzero] + getRandomArbitrary(-0.000057, +0.000057));

                // // opponent["opponent_" + i][oneORzero] =  Number(opponent["opponent_" + i][oneORzero] + getRandomArbitrary(-0.000057, +0.000057));
                
            };
        };

        socket.emit('opponent', global["opponent"]);

    }, 500);



  



    // Score handeling
    global["score"][userid] = 0;

    socket.on('shoot', function(shoot){

        var isInBox = false;

        try {
            // console.log(calcCrow(shoot.lat, shoot.lng, userData[c][userid][0], userData[c][userid][1]));
            if (calcCrow(shoot.lat, shoot.lng, userData[c][userid][0], userData[c][userid][1]) <= 0.0199883) {
                console.log(shoot);
                var isInBox = true;
            };
        }
        catch(e) {
        }

        // debug
        if (!isInBox) {

            for (var i = 0; i < addNewOpponents; i++) {

                var posLat = global["opponent"]["opponent_" + i][0];
                var posLng = global["opponent"]["opponent_" + i][1];

                if (calcCrow(shoot.lat, shoot.lng, posLat, posLng) < 0.006) {


                    if (isNaN(global["opponent"]["opponent_" + i][2])) {
                        global["opponent"]["opponent_" + i][2] = 3;
                    };

                    global["opponent"]["opponent_" + i][2]--;

                    console.log("opponent score");
                    console.log(global["opponent"]["opponent_" + i][2]);

                    if (global["opponent"]["opponent_" + i][2] <= 0) {

                        global["opponent"]["opponent_" + i][0] = newOpponent (i); 
                        global["opponent"]["opponent_" + i][1] = newOpponent (i);

                    };


                    if (isNaN(global["score"][userid] + 1)) {
                        console.log("New Score");
                        global["score"][userid] = 0;
                    };


                    global["score"][userid]++;
                    socket.emit('score', {"points": global["score"][userid]});




                };

                var posLat;
                var posLng;

            };

        var isInBox = false;

        };//e/isInBox

    });///e/shoot




    // GPX Logger
    setInterval(function(){

        try {
            if ((userData[c][userid][0] != 0) || (userData[c][userid][0] != undefined)) {
                var lat = userData[c][userid][0];
            };
            if ((userData[c][userid][1] != 0) || (userData[c][userid][1] != undefined)) {
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
                
                if (logfilename != "logs/.srcgpx") {
                    fs.appendFile(logfilename, appendData, function (err) {
                    });                    
                };


            };

        }
        catch(e) {
            console.log("srcgpx writer fails");
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

            var prevAppendData = '<?xml version="1.0" encoding="UTF-8" ?>' + "\n" + '<gpx xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="Qdraw" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd ">' + "\n" + "<trk>" +"\n" + "<name>Qdraw</name> \n <trkseg> \n\n";
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




var addNewOpponents = 1;
global["opponent"] = {};
startOpponent();
function startOpponent() {
    for (var i = 0; i < addNewOpponents; i++) {
                                            // xy, score  offEarth
        global["opponent"]["opponent_" + i] = [0,0,0,20];
    };
}//e/startOpponent



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


console.log("Script started");



// getClientAddress = function (req) {
//         return (req.headers['x-forwarded-for'] || '').split(',')[0] 
//         || req.connection.remoteAddress;
// };