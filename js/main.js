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

//
// API Speicific Vars
//
var theAPIkey = 'ew59q4vmuzss7nuyhm8t7st7'
var theAPIsecret = 'w9Wm3f7te2njWPxbxXrt7Jpn'
var theAPIredirect = 'http://www.keranmckenzie.com/' // a url that exists but doesn't really
var theAPIredirect_encoded = encodeURIComponent(theAPIredirect) // make sure 

var accessCode = ''
// lets fetch the accessToken out of localstorage if we have it
if(localStorage.getItem("accessToken")) {
	var accessToken = localStorage.getItem("accessToken")
	var accessExpire = localStorage.getItem("accessExpire")
	var refreshToken = localStorage.getItem("refreshToken")
} else {
	var accessToken = ''
	var refreshToken = ''
}



// we want to ensure a tight fit on all mobiles, so lets set the sizes right
var width = window.innerWidth
var height = window.innerHeight // use native JS not any plugin to get the right sizes
var loadingOffset = 1000

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
		appEngine.showLoading( messages.default_loading )
		
		
	}, // end our init function

	hideAll : function() {
		$('#loading').css('display', 'none')
		$('#welcome').css('display', 'none')
	},

	showLoading : function(loading_msg) {
		// make sure everything else is hidden
		appEngine.hideAll()

		// position the spinner in the middle of the page
		$('#loading .spinner').css('top', (height/2)-42+'px')
		$('#loading h3').css('top', (height/2)-12+'px')

		// lets delay the showing of the welcome screen by a set time
		$('#loading').css('display', 'block')

		// now lets show our Welcome page while we set everything else up
		if( loading_msg() == messages.default_loading() ) {
			// show the deafult message & then the home screen
			$('.loading_msg').html( loading_msg() )
			setTimeout(function() { 
				$('#loading').css('display', 'none')
				// right, we are done, show the welcome page
				appEngine.showWelcome(null)
			}, loadingOffset)
		} else {
			// show the message and wait, the engine will take care of the rest
			$('.loading_msg').html( loading_msg() )
		}

	}, // end show the loading screen

	showWelcome : function(message) {

		// first up we need to check in localstorage to see if there are access tokens
		if(accessToken) {
			// if YES (there are access tokens) then move straight to getting the list of company files

		} else {
			// if NO (there are NO access tokens) then show the welcome screen

			// bind the secureMYOB function to the button click
			$('#linkButton').on('click', function(){
				appEngine.secureMYOB()
				return false // prevent the default browser action
			})
			// put the message in place
			if(message) {
				$('#welcome .lead_msg').html( message() )
			} else {
				// load the default
				$('#welcome .lead_msg').html( messages.initial_welcome() )
			}
			$('#welcome').css('display', 'block')
		} // end check for accessTokens
		
	}, // show Welcome

	hideWelcome : function() {
		$('#welcome').css('display', 'none')
	}, // hide Welcome

	secureMYOB : function() {

		// we are going to use a childBrowser so we can rip the code out of the URL 
		window.plugins.childBrowser.showWebPage('https://secure.myob.com/oauth2/account/authorize?client_id='+theAPIkey+'&redirect_uri='+theAPIredirect_encoded+'&response_type=code&scope=CompanyFile', { showLocationBar: true }); //false, showNavigationBar: false, showAddress: false });

		// we have to listen for a location change so we can capture the URL and rip the access code from it
		window.plugins.childBrowser.onLocationChange = function(loc){ 

		    if( loc.indexOf('/?code') === 0 ){
				//console.log('code found')
				var code = loc.split('?code=')
				//console.log(code[1])
				accessCode = code[1]
				// close the childbrowser
				window.plugins.childBrowser.close();

				// now do the oauth token fetching
				appEngine.showLoading( messages.oauth_token_fetching )
				$('#loading').css('display', 'block')


			} else if( loc.indexOf('/?error') === 0 ){
				// there was an errror - handle it
				//    error here is the user hit NO instead of YES
				appEngine.showWelcome( messages.error_oauth_denied )
				// close the childbrowser
				window.plugins.childBrowser.close();

			} else {
				html += ('<br />code not found<br />')
			}
		}

	}, // secureMYOB


} // end our engine



//
// are we ready? lets go
//
// document.ready used for testing in browser
$(document).ready(function(){
	appEngine.init( messages.default_loading )
}) // end document ready


//
// Core messages 
// Shouldn't really have HTML in the messages, nor should the messages really be in functions
//   but hey, it's a sample and you are reading the comments ;)
//

var messages = {

	initial_welcome : function() {
		return 'To make full use of the awsesomeness of the cloud, bring together the power of MYOB AccountRight Live and our App of Awesome and watch business financial magic happen.';
	}, 

	error_oauth_denied : function() {
		return '<div class="alert alert-error"><strong>Access Denied</strong><br />It seems you have declined access for this app to talk to your company files.<br />That is a shame, I\'m sad now.</div><p><strong>Want to try again?</strong> hit the button below to try again</p>'
	},

	default_loading : function() {
		return 'Setting Up App'
	},

	oauth_token_fetching : function() {
		return 'The Hamsters are off fetching data'
	}

} // end messages




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
