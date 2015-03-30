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
            return send404(res);
        }

        // res.writeHead(200, {'Content-Type': path == '.js' ? 'text/javascript' : 'text/html'});

        
        res.write(data, 'utf8');
        res.end();
    });

    // var path = url.parse(req.url).pathname;
    // switch (path){
    //     case '/':
    //         res.writeHead(200, {'Content-Type': 'text/html'});
    //         res.write('<h1>Hello! Try the <a href="/test.html">Test page</a></h1>');
    //         res.end();
    //         break;
    //     case '/test.html':
    //         fs.readFile(__dirname + path, function(err, data){
    //             if (err){ 
    //                 return send404(res);
    //             }
    //             res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'});
    //             res.write(data, 'utf8');
    //             res.end();
    //         });
    //     break;
    //     default: send404(res);
    // }
}),

send404 = function(res){
    res.writeHead(404);
    fs.readFile(__dirname + "/404.html", function(err, data){
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



// define interactions with client
io.sockets.on('connection', function(socket){
	var geoData = "q";
    // //send data to client
    // setInterval(function(){
    //     socket.emit('date', {'date': new Date()});
    // }, 1000);

    //send data to client
    setInterval(function(geoData){
        socket.emit('date', {'date': geoData});
        console.log("hi" + geoData);

        var geoData = "";
    }, 2000);

    //recieve client data
    socket.on('geo', function(data){
    	geoData = geoData + "*" + data.letter;
        // process.stdout.write(data.letter);
        // process.stdout.write(data.letter);

    });



});





