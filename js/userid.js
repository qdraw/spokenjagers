// requires: md4.js

var plugins = "";
for (var i = 0; i < navigator.plugins.length; i++) {
	plugins = plugins + navigator.plugins[i].description;
};

var userid = calcMD4(String(navigator.userAgent)  + String(plugins));

document.title = document.title + " U:" + userid;