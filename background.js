// init storage
$.each(Torpedo,function(i,v){
	if(!window.localStorage.getItem(v.label)){
		window.localStorage.setItem(v.label,v.value);
	}
});

function showTutorial(){
	chrome.tabs.create({
	    url: chrome.runtime.getURL('tutorial.html')
	});
};
chrome.runtime.onInstalled.addListener(showTutorial);

function sendEmail() {
    var emailUrl = 'mailto:betty.ballin@secuso.org?subject='
                           + encodeURIComponent("Error with TORPEDO Webextension")
                           + "&body="
                           + encodeURIComponent("Mail panel could not be found in page: " + loc);
    chrome.tabs.create({ url: emailUrl });
}

// icon functions

loc = "";
err = "";
reload = 0;

function getStatus(){
	return {loc:loc,err:err};
}

chrome.tabs.onUpdated.addListener(function(tabId,status,info){
  chrome.pageAction.show(tabId);
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if(tabs[0].status == "complete"){
	  	chrome.tabs.sendMessage(tabs[0].id, {msg:"hi"}, function(response) {
				if (inList(info.url)) {
					var img = err?"img/error38.png":"img/icon38.png";
					try{
						chrome.pageAction.setIcon({tabId, path: { "38" : img }});
			    	chrome.pageAction.setPopup({tabId, popup: "/icon.html"});
					}catch(e){}
			  }
				else{
					reload = 0;
					try{
						chrome.pageAction.setIcon({tabId, path: { "38" : "img/none38.png" }});
						chrome.pageAction.setPopup({tabId, popup: ""});
					}catch(e){}
			  }
			});
		}
  });
});

function inList(url){
	var urls = ["mail.google.com","mg.mail.yahoo.com","email.t-online.de","outlook.live.com","navigator.web.de","navigator.gmx.net"]
	var i = 0;
	for(i=0; i< urls.length; i++){
		if(url.indexOf(urls[i])>-1) return true;
	}
	return false;
}

// message passing with content script
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
	// storage get items message
	if(request == "show"){
		var r = {
			onceClickedDomains:(window.localStorage.getItem(Torpedo.onceClickedDomains.label)),
			userDefinedDomains:(window.localStorage.getItem(Torpedo.userDefinedDomains.label)),
			timer:parseInt(window.localStorage.getItem(Torpedo.timer.label)),
			trustedTimerActivated:(window.localStorage.getItem(Torpedo.trustedTimerActivated.label)),
			userTimerActivated:(window.localStorage.getItem(Torpedo.userTimerActivated.label)),
			trustedListActivated:(window.localStorage.getItem(Torpedo.trustedListActivated.label)),
			referrerPart1:(window.localStorage.getItem(Torpedo.referrerPart1.label)),
			referrerPart2:(window.localStorage.getItem(Torpedo.referrerPart2.label))
		};
		sendResponse(r);
	}
	// redirect url message
	else if(request.name == "redirect"){
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if (xhttp.readyState == 4){
				sendResponse({url:xhttp.responseURL});
			}
		};
		xhttp.open('GET', request.url, true);
		xhttp.send(null);
		return true;
	}
	// icon: error with finding mail panel message
	else if(request.name == "error"){
		try{
			chrome.tabs.query({currentWindow: true,active:true}, function(tabs){
				chrome.pageAction.setIcon({tabId: tabs[0].id, path: { "38" : "img/error38.png" }});
			});
		}catch(e){console.log(e)}
		loc = request.case;
		err = "err";
		reload = 0;
		// reload t-online because otherwise iFrame body is not detected
		if(loc == "email.t-online.de"){
			// get current url
			chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
				if(tabs[0].status=="complete" && tabs[0].url.indexOf("showReadmail")>-1){
					if(reload < 1) {
						reload++;
						chrome.tabs.reload();
					}
				}
			});
		}
		sendResponse({});
	}
	// tooltip works message
	else if(request.name == "ok"){
		try{
			chrome.tabs.query({currentWindow: true,active:true}, function(tabs){
				chrome.pageAction.setIcon({tabId: tabs[0].id, path: { "38" : "img/icon38.png" }});
			});
		}catch(e){}
		loc = request.case;
		err = "";
		sendResponse({});
	}
	// storage set items message
	else{
		window.localStorage.setItem(request.name,request.value);
		sendResponse(window.localStorage.getItem(request.name));
	}
});
