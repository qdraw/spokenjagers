function url2base64(url,userid) {

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





// var q = url2base64 ('http://nodejs.org/logo.png');


// function url2base64 (sURL) {
// 	/*
// 	 * Complete reworking of JS from https://gist.github.com/803410 
// 	 * Removes external `request` dependency
// 	 * Caveats:
// 	 *  * No error checking
// 	 *  * Largely a POC. `data` URI is accurate, but this code cannot simply be inserted into an `express` app
// 	 */
// 	var URL = require('url'),
// 	    sURL = 'http://nodejs.org/logo.png',
// 	    oURL = URL.parse(sURL),
// 	    http = require('http'),
// 	    client = http.request(80, oURL.hostname),
// 	    request = client.request('GET', oURL.pathname, {'host': oURL.hostname}),
// 	    data = 0
// 	;
	 
// 	request.end();
// 	request.on('response', function (response)
// 	{
// 	    var type = response.headers["content-type"],
// 	        prefix = "data:" + type + ";base64,",
// 	        body = "";
	 
// 	    response.setEncoding('binary');
// 	    response.on('end', function () {
// 	        var base64 = new Buffer(body, 'binary').toString('base64'),
// 	            data = prefix + base64;
// 	        console.log(data);
// 	    });
// 	    response.on('data', function (chunk) {
// 	        if (response.statusCode == 200) body += chunk;
// 	    });
// 	});

// 	return data;
// }//e/url2base64