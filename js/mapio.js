// Requries socket.io
// Requries userid

var socket = io.connect();


console.log(userid);

var mapId = document.getElementById("map");

if (!navigator.geolocation){
    mapId.innerHTML = "<p>Geolocation is not supported by your browser</p>";
}
else {
	findGeoLocation();
}


function findGeoLocation () {
	navigator.geolocation.getCurrentPosition(success, error);

	var data = "";
	function success(position) {
		var latitude  = position.coords.latitude;
		var longitude = position.coords.longitude;
		var data = {
			longitude: longitude,
			latitude: latitude,
			userid: userid
		}
		sendToQ(data)
	}
	function error() {
    	map.innerHTML = "Unable to retrieve your location";
 	};

 	requestAnimationFrame(function(z) {
 		console.log("findGeoLocation");
 		findGeoLocation();
 	});


}// e/findGeoLocation



function sendToQ (data) {
	map.panTo(L.latLng(data.latitude, data.longitude));
	socket.emit('data', data);
}





var map = L.map('map').setView([51, 5.1], 18);

L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
	maxZoom: 18,
	attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
		'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
		'Imagery © <a href="http://mapbox.com">Mapbox</a>',
	id: 'examples.map-i875mjb7'
}).addTo(map); 



// on click remove 
// geojson = L.geoJson(null, {
//     onEachFeature: function(feature, layer) {
//         layer.on('click', function() {
//             geojson.removeLayer(layer);
//         });
//     }
// }).addTo(map);



// on click remove 
geojson = L.geoJson(null, {
    onEachFeature: function(feature, layer) {
    }
}).addTo(map);




socket.on('users', function(users){
	// console.dir(users);

	map.removeLayer(geojson);

	geojson = L.geoJson(null, {
	}).addTo(map);



	for (var i = 0; i < users.length; i++) {
		console.log(users[i].longitude + " ,  " + users[i].latitude);

			console.log(Number(users[i].longitude));

		if ( Number(users[i].longitude) != NaN ) {
		};
		
		geojson.addData({
			type: 'Point',
			coordinates: [users[i].longitude,users[i].latitude]
		});
	};


});










// geojson.addData({
//     type: 'Point',
//     coordinates: [Math.random() * 360 - 180, Math.random() * 160 - 80]
// });




// console.log(userid);


// // Server time
// socket.on('date', function(data){
// 	document.getElementById("date").innerHTML = data.date;
// });

// // geoFindMe();

// function geoFindMe() {
//   var output = document.getElementById("geo");

//   if (!navigator.geolocation){
//     output.innerHTML = "<p>Geolocation is not supported by your browser</p>";
//     return;
//   }

//   function success(position) {
    
//     var latitude  = position.coords.latitude;
//     var longitude = position.coords.longitude;


// 	var map = L.map('map').setView([latitude, longitude], 18);

// 	L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
// 		maxZoom: 18,
// 		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
// 			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
// 			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
// 		id: 'examples.map-i875mjb7'
// 	}).addTo(map);  	




//     try {
//     	output.innerHTML = '<p>Latitude is ' + latitude + ' deg <br/> Longitude is ' + longitude + 'deg </p>';
//     }catch(e) {
//     }

//     updateGeoLocation(map);

//   };

//   function error() {
//     output.innerHTML = "Unable to retrieve your location";
//   };

//   	// show user scrolling sun
// 	navigator.geolocation.getCurrentPosition(success, error);
// }


// var serverSend = "";
// var serverSendPrevious = "";


// function updateGeoLocation (map) {

// 	navigator.geolocation.getCurrentPosition(success, error);

// 	function success(position) {

// 	    var latitude  = position.coords.latitude;
// 	    var longitude = position.coords.longitude;

//         try {
//            	output.innerHTML = '<p>Latitude is ' + latitude + ' deg <br/> Longitude is ' + longitude + 'deg </p>';
//         }catch(e) {
//         }



// 	    serverSend = userid + ";"  + latitude + "," + longitude;


// 	    if (serverSendPrevious != serverSend) {
// 	    	console.log(serverSend);
// 	   		socket.emit('geo', {'letter': serverSend});
// 	   		serverSendPrevious = serverSend;
// 	    }

// 		map.panTo(L.latLng(latitude, longitude));

// 		// var map = L.map('map').setView([latitude, longitude], 18);
// 		// var map = L.map('map').setView(new L.LatLng(latitude, longitude), 18);

// 		// L.marker([latitude, longitude]).addTo(map).bindPopup("<b>Hello world!</b><br />I am a popup.").openPopup();


// 	    requestAnimationFrame(function(z) {
// 	    	updateGeoLocation(map);
// 	    });
// 	}

// 	function error() {
//     	output.innerHTML = "Unable to retrieve your location";
//  	};


// }
