// **************************************************** //
//
//    JS Engine built as sample phonegap app
//       for AccountRight Live API
//
//    Written by: Keran McKenzie
//
// **************************************************** //

//
// define our variables
//
// we want to ensure a tight fit on all mobiles, so lets set the sizes right
var width = window.innerWidth
var height = window.innerHeight // use native JS not any plugin to get the right sizes
var loadingOffset = 1000

// lets get anything out of localstorage that might (or not) be there
var accessToken = localStorage.getItem('accessToken');
var tokenExpiry = localStorage.getItem('tokenExpiry');
var refreshToken = localStorage.getItem('refreshToken');

// lets declare our 'engine'
var appEngine = {

	// init 
	init : function() {
		// lets set the size of the pages & the body
		$('body').css('width, max-width', width)
		$('body').css('height, max-height', height)

		$('.page').css('width', width)
		$('.page').css('height', height)

		// show the loading screen
		appEngine.showLoading()
		
	}, // end our init function

	showLoading : function() {
		console.log("showLoading")
		// position the spinner in the middle of the page
		$('#loading .spinner').css('top', (height/2)-42+'px')
		$('#loading h3').css('top', (height/2)-12+'px')

		// lets delay the showing of the welcome screen by a set time
		$('#loading').css('display', 'block')

		// now lets show our Welcome page while we set everything else up
		setTimeout(function() { 
			$('#loading').css('display', 'none')
			appEngine.showWelcome()
		}, loadingOffset)

	}, // end show the loading screen

	showWelcome : function() {

		// first up we need to check in localstorage to see if there are access tokens
		if(accessToken) {
			// if YES (there are access tokens) then move straight to getting the list of company files
		} else {
			// if NO (there are NO access tokens) then show the welcome screen

			$('#welcome').css('display', 'block')
		} // end check for accessTokens
		
	}, // show Welcome
} // end our engine

//
// are we ready? lets go
//
// document.ready used for testing in browser
$(document).ready(function(){
	appEngine.init()
}) // end document ready



//
// extensions to base functionality
//
// these two items auto stringify items for localstorage 
// source: http://stackoverflow.com/questions/2010892/storing-objects-in-html5-localstorage
Storage.prototype.setObject = function(key, value) {
    this.setItem(key, JSON.stringify(value));
}

Storage.prototype.getObject = function(key) {
    var value = this.getItem(key);
    return value && JSON.parse(value);
}
