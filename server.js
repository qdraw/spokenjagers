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

        if (isFirstRun) {
            userData[0][userid] = [ data.latitude, data.longitude, data.accuracy];
            userData[1][userid] = [ data.latitude, data.longitude, data.accuracy];
            userData[2][userid] = [ data.latitude, data.longitude, data.accuracy];
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

            userData[0][key] = [ 0, 0, 999999];
            userData[1][key] = [ 0, 0, 999999];
            userData[2][key] = [ 0, 0, 999999];

            };

        });


    }, 5000);


});











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


console.log("Script started")



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