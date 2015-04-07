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

    //recieve client data
    socket.on('data', function(data){
        procesData(data);
    });
    
    function procesData(data) {
        var userid = data.userid;
        global["userid"] = data.userid;

        if (isFirstRun) {
            userData[0][userid] = [ data.latitude, data.longitude, data.accuracy];
            userData[1][userid] = [ data.latitude, data.longitude, data.accuracy];
            // userData[2][userid] = [ data.latitude, data.longitude, data.accuracy];
            isFirstRun = false;
        };

        userData[c][userid] = [ data.latitude, data.longitude, data.accuracy];

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






    // opponent
    // var opponent = {}  

    Array.prototype.max = function () {
        return Math.max.apply(Math, this);
    };

    Array.prototype.min = function () {
        return Math.min.apply(Math, this);
    };

    function getCanvas() {

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
        // console.log(latmin);
        // console.log(latmax);
        // console.log(longmin);
        // console.log(longmax);
    }

    function getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
        // return [getRandomArbitrary(52.2287453+0.0007, 52.2287453-0.0007), getRandomArbitrary(6.0956636-0.0007, 6.0956636+0.0007)]



    function writeOutbound () {
        
        var theCanvas = getCanvas();
        global["theCanvas"] = theCanvas;

        if (theCanvas != 0) {

            var latmin = theCanvas[0][0];
            // console.log(latmin);
            var latmax = theCanvas[0][1];
            // console.log(latmax);
            var longmin = theCanvas[1][0];
            // console.log(longmin);
            var longmax = theCanvas[1][1];
            // console.log(longmax);

            // var opponent = {
            //         "topRight":[Number(52.2287453+0.0007),Number(6.0956636+0.0007),83],
            //         "topLeft":[Number(52.2287453+0.0007),Number(6.0956636-0.0007),83],

            //         "bottomLeft":[Number(52.2287453-0.0007),Number(6.0956636-0.0007),83],
            //         "bottomRight":[Number(52.2287453-0.0007),Number(6.0956636+0.0007),83],
            // } 

            outbound = {
                    "topLeft":[latmin+0.0006,longmin-0.0006,0],
                    "topRight":[latmin+0.0006,longmax+0.0006,0],
                    "bottomLeft":[latmin-0.0006,longmin-0.0006,0],
                    "bottomRight":[latmin-0.0006,longmax+0.0006,0],
            }
            return outbound;
        }
        else {
            return 0;
        }


    }//e/writeOutbound

    setInterval(function(){
        // to add + make the area bigger

        if (typeof global["area"] != "object") {
            global["area"] = writeOutbound();
            socket.emit('outbound', global["area"]);
        };
    }, 1000);


    setInterval(function(){

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
            console.log("theCanvas");

            console.log(theCanvas)
            var latmin = theCanvas[0][0];
            var latmax = theCanvas[0][1];
            var longmin = theCanvas[1][0];
            var longmax = theCanvas[1][1];


            for (var i = 0; i < 5; i++) {
                global["opponent"]["opponent_" + i] = [getRandomArbitrary(latmin-0.0006, latmax+0.0006),getRandomArbitrary(longmin-0.0006, longmax+0.0006)];
            };

        };

    }, 1000);

    function newOpponent (i) {
            var theCanvas = global["theCanvas"];
            var latmin = theCanvas[0][0];
            var latmax = theCanvas[0][1];
            var longmin = theCanvas[1][0];
            var longmax = theCanvas[1][1];
            global["opponent"]["opponent_" + i] = [getRandomArbitrary(latmin-0.0006, latmax+0.0006),getRandomArbitrary(longmin-0.0006, longmax+0.0006)];
    }
    

    setInterval(function(){
        socket.emit('outbound', global["area"]);

        var oneORzero = getRandomInt(0, 1); 

        for (var i = 0; i < 5; i++) {

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
                        var value = getRandomArbitrary(-0.0001, +0.0001);
                        // console.log(3);
                        break;
                }
               
                var position = Number(opponent["opponent_" + i][oneORzero]);
                var newPosition = Number(value + position);

                if (oneORzero === 0) {
                    if ((global["area"]["topLeft"][0] > newPosition)&& (global["area"]["bottomRight"][0] < newPosition)) {
                    }
                    else {
                        newPosition = position;
                        // console.log("top/bottom == wrong")
                    }
                }
                else {
                    if ((global["area"]["topLeft"][1] < newPosition)&& (global["area"]["bottomRight"][1] > newPosition)) {
                    }
                    else {
                        newPosition = position;
                        // console.log("left/right == wrong")
                    }
                }


                global["opponent"]["opponent_" + i][oneORzero] = newPosition;


                // Number(opponent["opponent_" + i][oneORzero] + getRandomArbitrary(-0.000057, +0.000057));

                // opponent["opponent_" + i][oneORzero] =  Number(opponent["opponent_" + i][oneORzero] + getRandomArbitrary(-0.000057, +0.000057));
                
            };
        };

        socket.emit('opponent', global["opponent"]);

    }, 500);

    var userid = global["userid"];
    global["score"][userid] = 0;

    socket.on('shoot', function(shoot){

        var isInBox = false;

        var userid = global["userid"];
        try {
            // console.log(calcCrow(shoot.lat, shoot.lng, userData[c][userid][0], userData[c][userid][1]));
            if (calcCrow(shoot.lat, shoot.lng, userData[c][userid][0], userData[c][userid][1]) <= 0.0199883) {
                console.log(shoot);
                var isInBox = true;
            };
        }
        catch(e) {
        }

        if (isInBox) {

            for (var i = 0; i < 5; i++) {

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
                        console.log("fdgdf11111111gdfgdf");
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

});




global["opponent"] = {};
startOpponent();
function startOpponent() {
    for (var i = 0; i < 5; i++) {
                                            // xy, score
        global["opponent"]["opponent_" + i] = [0,0,10];
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







    // // var opponent = {}  
    // var outbound = {};





    // function startOpponent() {

    //     var theCanvas = getCanvas();

    //     if (theCanvas != 0) {

    //         var latmin = theCanvas[0][0];
    //         var latmax = theCanvas[0][1];
    //         var longmin = theCanvas[1][0];
    //         var longmax = theCanvas[1][1];

    //         for (var i = 0; i < 5; i++) {
    //             opponent["opponent_" + i] = [getRandomArbitrary(latmin-0.0007, latmax+0.0007),getRandomArbitrary(longmin-0.0007, longmax+0.0007)];
    //             console.log(getRandomArbitrary(latmin-0.0007, latmax+0.0007),getRandomArbitrary(longmin-0.0007, longmax+0.0007));
    //         };
    //         isStartedOpponent = true;
    //     };

    // }


    // setTimeout(function(){
    //     writeOutbound();
    //     socket.emit('outbound', outbound);
        




    //     socket.emit('opponent', opponent);

    // }, 1000);


    // setInterval(function(){

    //     microSeconds = calcMicroSeconds();
    //     if ((microSeconds > 0 && microSeconds < 201) ) {


    //         if (isStartedOpponent) {

    //             var edit = getRandomInt(0, 1);

    //             for (var i = 0; i < 10; i++) {
    //                 console.log(opponent["opponent_" + i]);

    //                 // opponent["opponent_" + i][edit] =  Number(opponent["opponent_" + i][edit] + getRandomArbitrary(-0.000057, +0.000057));
    //             };

    //         };



    //         // opponent["test2"][edit] =  Number(opponent["test2"][edit] + getRandomArbitrary(-0.000057, +0.000057));





    //         // Object { name [ 52.2287453    6.0956636 , 83] }

    //         socket.emit('opponent', opponent);


    //     }; 


    // }, 200);





// var opponent = {}  

// for (var i = 0; i < 5; i++) {
//     opponent["opponent_" + i]
// };

// if (isStartedOpponent === false) {
//     startOpponent();
//     // console.log(opponent);
//     console.log("- startOpponent")

// };



















// function arrayDuplicate (array) {

//     var temp = {};
//     for (var i = 0; i < array.length; i++)
//     temp[array[i]] = true;
//     var r = [];
//     for (var k in temp)
//     r.push(k);
//     return r;

// }//e//arrayDuplicate

        // var nowTime = new Date().getTime();
        // var unixTime = Math.ceil(nowTime/1000);
        // var microSeconds = nowTime;
        // var microSeconds = nowTime.toString().substring(unixTime.toString().length, nowTime.toString().length); 
        // console.log(microSeconds);


    // setInterval(function(){

    //     microSeconds = calcMicroSeconds();
    //     if ((microSeconds > 200 && microSeconds < 400)|| (microSeconds > 600 && microSeconds < 800) ) {
    //         // console.log("start   " +microSeconds);

    //         switch (countToThree) {
    //             case 0:
    //                 Object.keys(db0).forEach(function(key) {
    //                     diffenceDb0vsDb2(key)
    //                 });
    //                 break;
    //             case 1:
    //                 Object.keys(db1).forEach(function(key) {
    //                 });
    //                 break;
    //             case 2:
    //                 Object.keys(db2).forEach(function(key) {
    //                 });
    //                 break;
    //             default:
    //                 console.log("default " + microSeconds);
    //                 break;

    //         }



    //         // console.log("end      " +microSeconds);

    //     }; 


    // }, 200);


    // function diffenceDb0vsDb2(userid) {
    //     // console.log(userid)
    // }



    // function testData(userid) {

    //     // console.log("db0 " + db0[userid]);
    //     // console.log("db1 " + db1[userid]);
    //     // console.log("db2 " + db2[userid]);

    //     if ((db0[userid] != undefined) && (db1[userid] != undefined) ) {
    //         var distance = calcCrow(db0[userid][0], db0[userid][1], db1[userid][0], db1[userid][1])

    //         if (Number(distance) > 0.2) {

    //             console.log("0.2 > " + distance);
    //         };
    //     };
    //     if ((db1[userid] != undefined) && (db2[userid] != undefined) ) {
    //         var distance = calcCrow(db1[userid][0], db1[userid][1], db2[userid][0], db2[userid][1])
    //             // console.log(distance);

    //         if (Number(distance) > 0.2) {
    //             console.log("0.2 >     " + distance);
    //         };
    //     };
    //     if ((db2[userid] != undefined) && (db0[userid] != undefined) ) {
    //         var distance = calcCrow(db2[userid][0], db2[userid][1], db0[userid][0], db0[userid][1])
    //             // console.log(distance);

    //         if (Number(distance) > 0.2) {

    //             console.log("0.2 >     " + distance);
    //         };
    //     };

    // }