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
var theAPIredirect = 'http://www.keranmckenzie.com' // a url that exists but doesn't really
var theAPIredirect_encoded = encodeURIComponent( theAPIredirect ) // make sure 
var oauthServer = 'https://secure.myob.com/oauth2/v1/authorize'
var apiURL = 'https://api.myob.com/accountright/'

var accessCode = ''
// lets fetch the accessToken out of localstorage if we have it
if(localStorage.getItem("accessToken")) {
	var accessToken = localStorage.getItem("accessToken")
	var accessExpire = localStorage.getItem("accessExpire") // this will be the seconds from EPOC till this token expires
	var refreshToken = localStorage.getItem("refreshToken")
	var cfCredentials = localStorage.getItem("cfCredentials")
} else {
	var accessToken = ''
	var refreshToken = ''
	var cfCredentials = ''
}

var theData = ''

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
		//appEngine.getAccessToken()
		
		
	}, // end our init function

	hideAll : function() {
		$('#loading').css('display', 'none')
		$('#welcome').css('display', 'none')
		$('#main').css('display', 'none')
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
		if( loading_msg == messages.default_loading ) {
			// show the deafult message & then the home screen
			$('.loading_msg').html( loading_msg )
			setTimeout(function() { 
				$('#loading').css('display', 'none')
				// right, we are done 
				appEngine.showWelcome(null)
			}, loadingOffset)
		} else {
			// show the message and wait, the engine will take care of the rest
			$('.loading_msg').html( loading_msg )
		}

	}, // end show the loading screen

	showWelcome : function(message) {

		// first up we need to check in localstorage to see if there are access tokens
		if(accessToken) {
			// if YES (there are access tokens) then move straight to getting the list of company files
			theTime = new Date().getTime / 1000

			if(accessExpire <= theTime) {
				// token expired
				appEngine.refreshToken()
			} else {
				// show the screen with the list of company files
				appEngine.showMain('cf_list')
			}

		} else {
			// if NO (there are NO access tokens) then show the welcome screen

			// bind the secureMYOB function to the button click
			$('#linkButton').on('click', function(){
				appEngine.secureMYOB()
				return false // prevent the default browser action
			})
			// put the message in place
			if(message) {
				$('#welcome .lead_msg').html( message )
			} else {
				// load the default
				$('#welcome .lead_msg').html( messages.initial_welcome )
			}
			$('#welcome').css('display', 'block')
		} // end check for accessTokens
		
	}, // show Welcome

	showMain : function(purpose) {

		// what are we doing here
		switch(purpose) {
			case 'cf_list':
				// show the company file list
				appEngine.hideAll()
				appEngine.showLoading( messages.cfList_fetching )
				appEngine.getCFList()
			break;
		} // end switch

	}, // end show Main

	hideWelcome : function() {
		$('#welcome').css('display', 'none')
	}, // hide Welcome

	secureMYOB : function() {

		// we are going to use a childBrowser so we can rip the code out of the URL 
		window.plugins.childBrowser.showWebPage('https://secure.myob.com/oauth2/account/authorize?client_id='+theAPIkey+'&redirect_uri='+theAPIredirect_encoded+'&response_type=code&scope=CompanyFile', { showLocationBar: true }) //false, showNavigationBar: false, showAddress: false })

		// we have to listen for a location change so we can capture the URL and rip the access code from it
		window.plugins.childBrowser.onLocationChange = function(loc){ 

		    if( loc.indexOf(theAPIredirect + '/?code') === 0 ){
				//console.log('code found')
				var code = loc.split('?code=')
				//console.log(code[1])
				accessCode = code[1]

				window.plugins.childBrowser.close()

				// now do the oauth token fetching
				appEngine.showLoading( messages.oauth_token_fetching )
				$('#loading').css('display', 'block')

				console.log('lets get the token')
				appEngine.getAccessToken()


			} else if( loc.indexOf(theAPIredirect + '/?error') === 0 ){
				// there was an errror - handle it
				//    error here is the user hit NO instead of YES
				appEngine.showWelcome( messages.error_oauth_denied )
				// close the childbrowser
				window.plugins.childBrowser.close()

			} 
		}

	}, // secureMYOB

	getAccessToken : function() {
		
		// setup the data payload for getting the AccessToken
         theData = 'client_id='+theAPIkey+'&client_secret='+theAPIsecret+'&scope=CompanyFile&code='+decodeURIComponent(accessCode)+'&redirect_uri='+theAPIredirect_encoded+'&grant_type=authorization_code'

         appEngine.getTokenURL( oauthServer, 'POST', theData) 

	}, // getAccessToken

	getRefreshToken : function() {
		
		// setup the payload
		theData = 'client_id='+theAPIkey+'&client_secret='+theAPIsecret+'&refresh_token='+refreshToken+'&grant_type=authorization_code'
		appEngine.getTokenURL( oauthServer, 'POST', theData) 

	}, // getRefreshToken

	processToken : function(data) {

			// sort the expiry date - lets work with the epoc
			secondsTillExpire = new Date().getTime()/1000;
			secondsTillExpire = secondsTillExpire + ( JSON.stringify(data.expires_in) /2) // expire the token halfway through it's life time


			// store the data in localstorage
         	localStorage.setItem('accessToken', JSON.stringify(data.access_token))
			localStorage.setItem('refreshToken', JSON.stringify(data.refresh_token))
			localStorage.setItem('accessExpire', secondsTillExpire)

			accessToken = JSON.stringify(data.access_token)
			accessExpire = JSON.stringify(data.refresh_token)
			refreshToken = secondsTillExpire

			//$('#main').css('display', 'block')
			//$('#main #content').html('<h2>Success</h2>Access Token: '+ JSON.stringify(data.access_token)+'<br />'+JSON.stringify(data.refresh_token)+'<br />'+JSON.stringify(data.expires_in))
			appEngine.showMain('cf_list')

	},

	getCFList : function() {

		var theCFList = appEngine.getURL(apiURL, 'GET', '')

		if(theCFList) {
			appEngine.hideAll()
         	$('#main').append( JSON.stringify(theCFList) )
         	$('#main').css('display', 'block')
		}

	},

	getURL : function(url, type, theData) {

			// fix this
			cfToken = Base64.encode('Administrator:')//+window.password)

		

			$.ajaxSetup({
			    beforeSend: function(xhr) {
			        xhr.setRequestHeader('Authorization', accessToken);
			        xhr.setRequestHeader('x-myobapi-cftoken', cfToken);
			        xhr.setRequestHeader('x-myobapi-key', theAPIkey);
			    }
			});

			

		   $.ajax({
				type: type,
				url: url,
				data: theData,
				dataType: 'json',
				contentType: 'application/json',
				success: function(data) {
					return(data)
				},
				error: function(xhr) {
					// there was an error
		         	appEngine.hideAll()
		         	$('#main').append( messages.error_getting_url + '<br />Error:<br />'+JSON.stringify(xhr.responseText) +'<br />URL '+url +'<br />AccessToken: '+accessToken+'<br />cfToken: '+cfToken+'<br />API Key: '+theAPIkey + '<br />RefreshToken: '+refreshToken+'<br /><hr /><br />The Error'+JSON.stringify(xhr))
		         	$('#main').css('display', 'block')
		         	return false
				}
			});		   
	   },

	getTokenURL : function(url, type, theData) {


		   $.ajax({
				type: type,
				url: url,
				data: theData,
				success: function(data) {
					appEngine.processToken(data)
				},
				error: function(xhr) {
					// there was an error
		         	appEngine.hideAll()
		         	$('#welcome .lead_msg').html( messages.error_oauth_denied + JSON.stringify(data) )
		         	$('#welcome').css('display', 'block')
				}
			});		   
	   },

} // end our engine



//
// are we ready? lets go
//
// document.ready used for testing in browser
$(document).ready(function(){
	appEngine.init( )
}) // end document ready


//
// Core messages 
// Shouldn't really have HTML in the messages, nor should the messages really be in functions
//   but hey, it's a sample and you are reading the comments ;)
//

var messages = {

	'initial_welcome' : 'To make full use of the awsesomeness of the cloud, bring together the power of MYOB AccountRight Live and our App of Awesome and watch business financial magic happen.',

	'error_oauth_denied' : '<div class="alert alert-error"><strong>Access Denied</strong><br />It seems you have declined access for this app to talk to your company files.<br />That is a shame, I\'m sad now.</div><p><strong>Want to try again?</strong> hit the button below to try again</p>',
	
	'default_loading' : 'Setting Up App',

	'oauth_token_fetching' : 'The Hamsters are off fetching tokens',

	'cfList_fetching' : 'The Hamsters are off getting your company files',

	'error_getting_url' : '<div id="urlError" class="alert alert-error"><strong>Oh Crap</strong><br />Something went wrong - sorry</p>',

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

serialize = function(obj) {
  var str = [];
  for(var p in obj)
     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
  return str.join("&");
}


//
// Ability to Base64 encode
//
/**
*  Base64 encode / decode
*  http://www.webtoolkit.info/
**/

var Base64 = { 
  // private property
  _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

  // public method for encoding
  encode : function (input) {
    var output = "";
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output = output +
      this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
      this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
    }

    return output;
  },

  // public method for decoding
  decode : function (input) {
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

    while (i < input.length) {
      enc1 = this._keyStr.indexOf(input.charAt(i++));
      enc2 = this._keyStr.indexOf(input.charAt(i++));
      enc3 = this._keyStr.indexOf(input.charAt(i++));
      enc4 = this._keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }

    output = Base64._utf8_decode(output);

    return output;
  },

  // private method for UTF-8 encoding
  _utf8_encode : function (string) {
    string = string.replace(/\r\n/g,"\n");
    var utftext = "";

    for (var n = 0; n < string.length; n++) {
      var c = string.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }

    return utftext;
  },

  // private method for UTF-8 decoding
  _utf8_decode : function (utftext) {
    var string = "";
    var i = 0;
    var c = c1 = c2 = 0;

    while ( i < utftext.length ) { 
      c = utftext.charCodeAt(i);

      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      }
      else if((c > 191) && (c < 224)) {
        c2 = utftext.charCodeAt(i+1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      }
      else {
        c2 = utftext.charCodeAt(i+1);
        c3 = utftext.charCodeAt(i+2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }

    return string;
  }
}
