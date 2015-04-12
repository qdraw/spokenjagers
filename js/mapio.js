// Requries socket.io
// Requries userid


// Ask for WebSocket Connection
var socket = io.connect();


console.log(userid);

var maxZoom = 20;

var map = L.map('map').setView([51, 5.1], maxZoom);



// // MapBox
// L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
// 	maxZoom: 19,
// 	// attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
// 	// 	'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
// 	// 	'Imagery © <a href="http://mapbox.com">Mapbox</a>',
// 	// id: 'examples.map-i875mjb7'
// 	// id: 'qdraw.lkkkolkj'
// 	// id: 'examples.map-szwdot65'
// 	id: 'lxbarth.map-n8gsdqn4'
// }).addTo(map); 

// // arcgisonline MAX zooom == 18
// L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
// 	maxZoom: 18
// }).addTo(map); 

// Nokia Here Maps, Thanks: http://leaflet-extras.github.io/leaflet-providers/preview/
L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/satellite.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
	// attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
	subdomains: '1234',
	mapID: 'newest',
	app_id: 'Y8m9dK2brESDPGJPdrvs',
	app_code: 'dq2MYIvjAotR8tHvY8Q_Dg',
	base: 'aerial',
	minZoom: 0,
	maxZoom: maxZoom
}).addTo(map);

// Check if user support geolocation, after this load FirstFindGeoLocation
if (!navigator.geolocation){
    mapId.innerHTML = "<p>Geolocation is not supported by your browser</p>";
}
else {
	FirstFindGeoLocation();
}

// Catch and pan the map to the location,
// check the interval for the other panTo
function FirstFindGeoLocation () {

	navigator.geolocation.getCurrentPosition(success, error);
	function success(position) {
		var latitude  = position.coords.latitude;
		var longitude = position.coords.longitude;
		map.panTo(L.latLng(latitude, longitude));
	}
	function error() {
    	map.innerHTML = "Unable to retrieve your location";
 	};	

 	// leave this one over, here chrome doesn't like it inside the succes()
 	findGeoLocation();

}//e/e/FirstFindGeoLocation

// interval === 1000/interval
var interval = 2; //frames per second
// Last Client time
var lastTime = new Date().getTime();

// This format will be send to the server!
var data = {
	userid: userid,
	longitude: 0,
	latitude: 0,
	accuracy: 0,
	altitude: 0,
	speed: 0
}

// access global user variable
window["data"] = data;

// Loaded after FirstFindGeoLocation
function findGeoLocation () {
	// Do you know how late it is?, yes i do:
	var nowTime = new Date().getTime();

	// interval, im using request animationframe, so i ask the browser if he has memory free
	if ((nowTime - lastTime) > (1000 / interval)){
        //do actual asking of the geolocation
		navigator.geolocation.getCurrentPosition(success, error);
		// update the last client time
        lastTime = new Date().getTime();
    }

	function success(position) {
		// when i;ve a succesfull lookup of the geolocation

		var latitude  = position.coords.latitude;
		var longitude = position.coords.longitude;
		var accuracy = position.coords.accuracy;
		var altitude = position.coords.altitude;
		var speed = position.coords.speed;

		// update to the latest location:
		var data = {
			userid: userid,
			longitude: longitude,
			latitude: latitude,
			accuracy: accuracy,
			altitude: altitude,
			speed: speed
		}
		window["data"] = data;

		sendToQ(data)
	}
	function error() {
    	map.innerHTML = "Unable to retrieve your location";
 	};


 	requestAnimationFrame(function(z) {
 		// and this is infinte loop, and this not a bug, this is a feature
 		findGeoLocation();
 	});


}// e/findGeoLocation


// Send it the Q server
function sendToQ (data) {
	socket.emit('data', data);
}








// Decleration of the icons i'm using

var blackIcon = L.icon({
    iconUrl: 'images/fa-map-marker.svg',
    shadowUrl: 'js/images/marker-shadow.png',

    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 50], // size of the shadow
    iconAnchor:   [25, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [15, 55],  // the same for the shadow
    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});


var blueIcon = L.icon({
    iconUrl: 'images/fa-map-marker-blue.svg',
    shadowUrl: 'js/images/marker-shadow.png',

    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 50], // size of the shadow
    iconAnchor:   [25, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [15, 55],  // the same for the shadow
    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});

var whiteIcon = L.icon({
    iconUrl: 'images/fa-map-marker-white.svg',
    shadowUrl: 'js/images/marker-shadow.png',

    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 50], // size of the shadow
    iconAnchor:   [25, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [15, 55],  // the same for the shadow
    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});

// YouCircle === the blue cicrle where you can shoot
var YouCircle = 0;

// global object of all active users
var users = {};

function startSocket () {

	socket.on('users', function(users){
	// ask the server for a list of users:


		// loop though object 
		// Visit non-inherited enumerable keys
		// var obj = { first: "John", last: "Doe" };
		Object.keys(users).forEach(function(key) {

			if (!window[key]) {

				if (userid === key) {
					// the Client has a different icon, thats all
			    	// window[key] = L.marker([users[key][0],users[key][1]],{icon: blackIcon}).bindPopup("U: " + key + "    R: " + users[key][2] ).addTo(map);
			    	window[key] = L.marker([users[key][0],users[key][1]],{icon: blackIcon}).addTo(map);
					
				}
				else {
			    	// window[key] = L.marker([users[key][0],users[key][1]],{icon: blueIcon}).bindPopup("U: " + key + "    R: " + users[key][2] ).addTo(map);
			    	// window[key] = L.marker([users[key][0],users[key][1]]).bindPopup("U: " + key + "    R: " + users[key][2] ).addTo(map);
			    	window[key] = L.marker([users[key][0],users[key][1]],{icon: blueIcon}).addTo(map);

				}

			}
			window[key].setLatLng([users[key][0],users[key][1]]).update();

		});


		// Update the circle
		Object.keys(users).forEach(function(key) {

			if ((userid === key)&& (YouCircle === 0)) {
				YouCircle = L.circle([users[key][0],users[key][1]],20 ).addTo(map);
			}
			if ((userid === key) && (YouCircle != 0)) {
				map.removeLayer(YouCircle);
				YouCircle = L.circle([users[key][0],users[key][1]],20 ).addTo(map);
			}

		});


		// Display a list of users:
		var userList = "Users: <br />";
		Object.keys(users).forEach(function(key) {
			userList = userList + key + "<br />";
		});
		document.getElementById("users").innerHTML = userList;



	});

}//e/sS

startSocket();


// Ask the Server time
var date = 0;
socket.on('date', function(data){
	date = data.date;
});

// Error handeling, give you a alert when you have no connection
setInterval(function(){
	var delay = Number(new Date().getTime() - date);
	if ((delay > 10001) &&(delay < 15001)) {
		alert("you've lost the connection for 10 seconds");
	};
}, 5000);



// debug showing to all users, must be turned off
setInterval(function(){
	document.getElementById("timedifference").innerHTML = "Delay in ms: <br /> " + Number(new Date().getTime() - date )+ "<br />";
	
	var myDate = new Date(date).toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1");
	document.getElementById("date").innerHTML = "Server time: <br />" + myDate + "<br />";

 }, 1000);


// Kills the users without geolocation
setInterval(function(){
	if (window["data"].longitude === 0) {
		console.log("FAIL");
		window.location = "geolocation.html"
	};
}, 20000);



// Add auto zoom and panToYou explantion mark
document.getElementById("update").addEventListener("click", panToYou, false);

setInterval(function(){
	panToYou ();
}, 90000);

function panToYou () {
	var longitude = window["data"].longitude;
	var latitude = window["data"].latitude;
	console.log("panToYou " + longitude + " "+  latitude);
    map.setZoom((maxZoom), {animate: true});
	map.panTo(L.latLng(latitude, longitude),{animate: true});
}//e/pantoyou


// Fatal error functions:
if (document.querySelectorAll("#error").length >= 0) {
	document.querySelector("#error").style.display = "none";
}; //e/fi

function fatalError(zIndex) {
	if (document.querySelectorAll("#error").length >= 0) {
		document.querySelector("#error").style.display = "block";
		document.querySelector("#error").style.zIndex = zIndex;
	}//fi
}


setTimeout(function(){
	fatalError(-1);
}, 10000);


// // ZOOM START unused

// map.on("zoomstart", function (e) { console.log("ZOOMEND", e); });

// map.on("zoomend", function (e) { 
// 	console.log("ZOOMSTART", e.target._zoom); 

// 	console.log(map.getBounds()._southWest.lat);
// 	console.log(map.getBounds()._southWest.lng);

// 	if (!window["_southWest"]) {
//     	window["_southWest"] = L.marker(map.getBounds()._southWest,{icon: blackIcon}).addTo(map);
// 	}
// 	window["_southWest"].setLatLng(map.getBounds()._southWest).update();



// });


// The spooks are comming, opponent handeling

socket.on('opponent', function(opponent){

	Object.keys(opponent).forEach(function(key) {

		if (opponent[key][0] != 0) {

			if (!window[key]) {
				// if new opponent
		    	window[key] = L.marker([opponent[key][0],opponent[key][1]],{icon: whiteIcon}).addTo(map);
		    	// window[key] = L.marker([opponent[key][0],opponent[key][1]],{icon: whiteIcon}).bindPopup( key ).addTo(map);
			}
			window[key].setLatLng([opponent[key][0],opponent[key][1]]).update();


		};


	});
}); //e/opponent





socket.on('outbound', function(outbound){

	if (outbound != null) {

		Object.keys(outbound).forEach(function(key) {
			
			// console.log(key);

			if (!window[key]) {
		    	window[key] = L.marker([outbound[key][0],outbound[key][1]],{icon: whiteIcon}).bindPopup("outbound " + key ).addTo(map);
			}
			window[key].setLatLng([outbound[key][0],outbound[key][1]]).update();

		});		
	};

}); //e/outbound




map.on('click', onMapClick);

function onMapClick(e) {
	// console.log(e.latlng);
	socket.emit('shoot', e.latlng);
}





document.getElementById("points").innerHTML = 0;
socket.on('score', function(score){
	scoreInPoints = Math.ceil(score["points"]*10);
	scoreInPoints = scoreInPoints/10;

	console.log(score["points"]);
	document.getElementById("points").innerHTML = scoreInPoints;
}); //e/score



