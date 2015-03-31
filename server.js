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
            res.writeHead(200,'text/javascript');
        };
        if (path.indexOf(".html") >= 0 ) {
            res.writeHead(200,'text/html');
        };
        if (path.indexOf(".png") >= 0 ) {
            res.writeHead(200,'image/png');
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

//turn off debug
// io.set('log level', 1);

var saveData = [];
var savePreviousData = [];

// array with users active
var activeUsers = [];

// define interactions with client
io.sockets.on('connection', function(socket){
    //recieve client data
    socket.on('data', function(data){
        procesData(data);
    });

    
    function procesData(data) {
        
        activeUsers.push(data.userid)

        var addTo = true;

        for (var i = 0; i < saveData.length; i++) {
            if (saveData[i].userid === data.userid) {
                addTo = false;
            };
        }
        if (addTo) {
            saveData.push(data);
        }

    }

    // //send data to client
    setInterval(function(){

        activeUsers = arrayDuplicate(activeUsers);

        if (activeUsers.length != saveData.length) {
            if (activeUsers.length === savePreviousData.length) {
                console.log("Caching-test " + activeUsers.length + " " + savePreviousData.length);
                saveData = savePreviousData;
            }


        };
        console.log(activeUsers);


        
        if (saveData.length != 0) {
            socket.emit('users', saveData);
            console.log(saveData);

            savePreviousData = saveData;
            saveData = [];

        };

    }, 2000);

    setInterval(function(){
        activeUsers = [];        
    }, 20000);


    // stuur tijd door naar client:
    setInterval(function(){
        socket.emit('date', {'date': new Date()});
    }, 1000);



    // //send data to client
    // setInterval(function(geoData){
    //     socket.emit('date', {'date': geoData});
    //     console.log("hi" + geoData);
            // process.stdout.write(data.letter);
        // process.stdout.write(data.letter);

    //     var geoData = "";
    // }, 2000);




});



function arrayDuplicate (array) {

    var temp = {};
    for (var i = 0; i < array.length; i++)
    temp[array[i]] = true;
    var r = [];
    for (var k in temp)
    r.push(k);
    return r;

}//e//arrayDuplicate

