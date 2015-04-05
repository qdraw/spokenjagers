// 	// Find the right method, call on correct element
// 	function launchIntoFullscreen(element) {
// 		if(element.requestFullscreen) {
// 			element.requestFullscreen();
// 		} else if(element.mozRequestFullScreen) {
// 			element.mozRequestFullScreen();
// 		} else if(element.webkitRequestFullscreen) {
// 			element.webkitRequestFullscreen();
// 		} else if(element.msRequestFullscreen) {
// 			element.msRequestFullscreen();
// 		}
// 	}

// // Launch fullscreen for browsers that support it!
// // launchIntoFullscreen(document.documentElement); // the whole page

// function launchIntoFullscreenProxy () {
// 	launchIntoFullscreen(document.documentElement)
// }


// document.getElementById("fullscreen").addEventListener("click", launchIntoFullscreenProxy, false);
