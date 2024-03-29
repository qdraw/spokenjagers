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

// Set option to debug:    javascript:document.cookie="debug=true"


// Requries socket.io


var socket = io.connect();


var maxZoom = 20;

// var userid = 0;

var public_html = "";

var map = L.map('map', { zoomControl:false }).setView([51, 5.1], 16);


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

// untested
// var Stamen_Toner = L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.{ext}', {
// 	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
// 	subdomains: 'abcd',
// 	minZoom: 0,
// 	maxZoom: 20,
// 	ext: 'png'
// });

// Nokia Here Maps, Thanks: http://leaflet-extras.github.io/leaflet-providers/preview/
// L.tileLayer('https://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/satellite.day/{z}/{x}/{y}/256/jpg?app_id={app_id}&app_code={app_code}', {
// 	// attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
// 	subdomains: '1234',
// 	mapID: 'newest',
// 	app_id: 'Y8m9dK2brESDPGJPdrvs',
// 	app_code: 'dq2MYIvjAotR8tHvY8Q_Dg',
// 	base: 'aerial',
// 	minZoom: 0,
// 	maxZoom: maxZoom
// }).addTo(map);


// // // https: also suppported. The grey maps
// L.tileLayer('https://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/normal.day.grey/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
// 	// attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
// 	subdomains: '1234',
// 	mapID: 'newest',
// 	app_id: 'oenPwMCqbQkUSqj1WhRx',
// 	app_code: 'kBxLcdTofTHUlsT7tl2X5w',
// 	base: 'base',
// 	minZoom: 0,
// 	maxZoom: 18
// }).addTo(map);

// L.tileLayer('https://{s}.tile.thunderforest.com/transport/{z}/{x}/{y}.png', {
// 		minZoom: 6,
// 		maxZoom: 18
// }).addTo(map);


L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	minZoom: 6,
	maxZoom: 18
}).addTo(map);


// // // LocalMaps
//  L.tileLayer('local-maps/{z}/{x}/{y}.jpg', {
//  	minZoom: 4,
//  	maxZoom: 18
//  }).addTo(map);




// Check if user support geolocation, after this load FirstFindGeoLocation
if (!navigator.geolocation){
    alert("Geolocation is not supported by your browser");
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
		console.log(latitude,longitude);
		map.panTo(L.latLng(latitude, longitude));
	}
	function error(e) {
		console.log("Error code "+ e.code , e.message);
		if (document.querySelectorAll("#error").length >= 0) {
			document.querySelector("#error").style.display = "block";
			document.querySelector("#error").innerHTML = "There is a geolocation error";
		}; //e/fi

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

		if (document.querySelectorAll("#error").length >= 0) {
			document.querySelector("#error").style.display = "none";
		}; //e/fi

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
		// console.log(data);

		sendToQ(data)
	}
	function error(e) {
		console.log("Error code "+ e.code , e.message);
		if (document.querySelectorAll("#error").length >= 0) {
			document.querySelector("#error").style.display = "block";
			document.querySelector("#error").innerHTML = "There is a geolocation error";
		}; //e/fi
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
    iconUrl: public_html + 'images/fa-map-marker.svg',
    shadowUrl: public_html + 'js/images/marker-shadow.png',

    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 50], // size of the shadow
    iconAnchor:   [25, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [15, 55],  // the same for the shadow
    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});


var blueIcon = L.icon({
    iconUrl: public_html + 'images/fa-map-marker-blue.svg',
    shadowUrl: public_html + 'js/images/marker-shadow.png',

    iconSize:     [50, 50], // size of the icon
    shadowSize:   [50, 50], // size of the shadow
    iconAnchor:   [25, 50], // point of the icon which will correspond to marker's location
    shadowAnchor: [15, 55],  // the same for the shadow
    popupAnchor:  [0, -50] // point from which the popup should open relative to the iconAnchor
});

var whiteIcon = L.icon({
    iconUrl: public_html + 'images/fa-map-marker-ghost.svg',
    shadowUrl: public_html + 'js/images/marker-shadow.png',

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
	// console.log("users");
	// console.log(users);


		// loop though object 
		// Visit non-inherited enumerable keys
		// var obj = { first: "John", last: "Doe" };
		Object.keys(users).forEach(function(key) {
			// console.log("key")
			// console.log(key)

			key = String(key);


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
				YouCircle = L.circle([users[key][0],users[key][1]],40 ).addTo(map);
			}
			if ((userid === key) && (YouCircle != 0)) {
				map.removeLayer(YouCircle);
				YouCircle = L.circle([users[key][0],users[key][1]],40 ).addTo(map);
			}

		});


		// // Display a list of users:
		// var userList = "Users: <br />";
		// Object.keys(users).forEach(function(key) {
		// 	userList = userList + key + "<br />";
		// });
		// document.getElementById("users").innerHTML = userList;



	});

}//e/sS

startSocket();


// Ask the Server time
var date = 0;
socket.on('date', function(data){
	document.getElementById("cpuload").innerHTML = "cpuload: " + data.cpuload + "%<br />";

	date = data.date;
});

// Error handeling, give you a alert when you have no connection
setInterval(function(){
	var delay = Number(new Date().getTime() - date);
	if ((delay > 10001) &&(delay < 15001)) {
		if (document.querySelectorAll("#connection-error").length >= 0) {
			document.querySelector("#connection-error").style.display = "block";
			document.querySelector("#connection-error").innerHTML = "Pas op!, <br />Je bent de verbinding kwijt voor 10 seconde";
		}
		else {
			alert("you've lost the connection for 10 seconds");
		}//e/ls
	}

	if ((delay > 0) &&(delay < 10001)) {
		if (document.querySelectorAll("#connection-error").length >= 0) {
			document.querySelector("#connection-error").style.display = "none";
		}		
	}


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
		console.log("FAIL Fatal Warning");
		window.location = "geolocation.html"
	};
}, 20000);



// Add auto zoom and panToYou explantion mark
document.getElementById("update").addEventListener("click", panToYou, false);

// setInterval(function(){
// 	panToYou ();
// }, 90000);

function panToYou () {
	var longitude = window["data"].longitude;
	var latitude = window["data"].latitude;
	console.log("panToYou " + longitude + " "+  latitude);
    map.setZoom((maxZoom), {animate: true});
	map.panTo(L.latLng(latitude, longitude),{animate: true});
}//e/pantoyou


// // Fatal error functions:
// if (document.querySelectorAll("#error").length >= 0) {
// 	document.querySelector("#error").style.display = "none";
// }; //e/fi

// function fatalError(zIndex) {
// 	if (document.querySelectorAll("#error").length >= 0) {
// 		document.querySelector("#error").style.display = "block";
// 		document.querySelector("#error").style.zIndex = zIndex;
// 	}//fi
// }


// setTimeout(function(){
// 	fatalError(-1);
// }, 10000);


// Kill Users if server crashes or if you logout
socket.on('sessionEnabled', function(sessionEnabled){
	Object.keys(sessionEnabled).forEach(function(key) {
		if (userid === key) {
			if (sessionEnabled[userid] == false || sessionEnabled[userid] == null) {
				window.location = "/game?q=se"
			};
		}
	});
});




// The spooks are comming, opponent handeling
socket.on('ghosts', function(ghosts){

	// console.log("ghosts");
	// console.log(ghosts);

	if (document.querySelectorAll("#preloader").length >= 0) {
		document.getElementById("preloader").style.display = "none";
	}//fi

	var	ghosts = JSON.parse(ghosts)

	// console.log(ghosts["area_1"]["spook5"])
	// console.log(ghosts);

	window["ghosts"] = {};

	Object.keys(ghosts).forEach(function(area) {
		
		// console.log("area");
		// console.log(area);

		window["ghosts"][area] = {};

		Object.keys(ghosts[area]).forEach(function(ghostsName) {


			if (window["ghosts_" + area + "_" + ghostsName] == undefined) {
				// console.log("--> " + area + " "+ghostsName );
				// console.log(ghosts[area][ghostsName][0]);

				window["ghosts_" + area + "_" +ghostsName] = L.marker([ghosts[area][ghostsName][0],ghosts[area][ghostsName][1]],{icon: whiteIcon}).addTo(map);

			};

			window["ghosts_" + area + "_" + ghostsName].setLatLng([ghosts[area][ghostsName][0],ghosts[area][ghostsName][1]]).update();

		});

	});

}); //e/opponent








map.on('click', onMapClick);

function onMapClick(e) {
	console.log("You shoot at", e.latlng.lat, e.latlng.lng);
	socket.emit('shoot', e.latlng);
}





socket.on('score', function(score){
	if (score["points"] != null) {

		scoreInPoints = Math.ceil(score["points"]*10);
		scoreInPoints = scoreInPoints/10;

		// console.log(score["points"]);
		document.getElementById("points").innerHTML = scoreInPoints;
	}

	// low xp user
	if ((score["points"] > -2) && (score["points"] < 2)) {
		console.log("score")
		console.log(score)
		document.getElementById("info").style.display = "none";

	}

	// very new user
	if (score["points"] == null) {
		console.log("null");
		document.getElementById("info").style.display = "block";
		document.getElementById("info").innerHTML = "Binnen de blauwe cirkel kun je spoken vangen"
	};

}); //e/score




socket.on('health', function(health){
	if (health["health"] != null) {

		scoreInPoints = Math.ceil(health["health"]*10);
		scoreInPoints = scoreInPoints/10;

		console.log(health["health"]);
		document.getElementById("health").innerHTML = scoreInPoints + "%";
	}

}); //e/score

socket.on('money', function(money){

	if (money["money"] != null) {

		scoreInPoints = Math.ceil(money["money"]*10);
		scoreInPoints = scoreInPoints/10;

		console.log(money["money"]);
		document.getElementById("money").innerHTML = "$" + scoreInPoints;

	}
}); //e/score











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
