// storage settings
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
loc = "";
err = "";
reload = true;

function sendEmail() {
    var emailUrl = 'mailto:betty.ballin@secuso.org?subject='
                           + encodeURIComponent("Error with TORPEDO Webextension")
                           + "&body="
                           + encodeURIComponent("Mail panel could not be found in page: " + loc);
    chrome.tabs.create({ url: emailUrl });
}

function getStatus(){
	return {loc:loc,err:err};
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tabInfo) => {
  chrome.pageAction.show(tabId);
	chrome.tabs.sendMessage(tabId, {}, function(response) {});
  if (inList(tabInfo.url)) {
		var img = err?"img/error38.png":"img/icon38.png";
		chrome.pageAction.setIcon({tabId, path: { "38" : img }});
    chrome.pageAction.setPopup({tabId, popup: "/icon.html"});
		if(tabInfo.url.indexOf("email.t-online.de")>-1 && tabInfo.url.indexOf("showReadmail")>-1){
			if(reload) {
				chrome.tabs.reload();
				reload = false;
			}
			if(changeInfo.status && changeInfo.status=="complete"){
				reload = true;
			}
		}
  }
	else{
		chrome.pageAction.setIcon({tabId, path: { "38" : "img/none38.png" }});
		chrome.pageAction.setPopup({tabId, popup: ""});
  }
});

function inList(url){
	var urls = ["mail.google.com","mail.aol.de","mg.mail.yahoo.com","navigator.web.de","email.t-online.de","email.freenet.de","email.vodafone.de","webmail.ewe.de","webmail.unity-mail.de","outlook.live.com","navigator.gmx.net"]
	var i = 0;
	for(i=0; i< urls.length; i++){
		if(url.indexOf(urls[i])>-1) return true;
	}
	return false;
}

chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
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
	else if(request.name == "redirect"){
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if (xhttp.readyState == 4){
				sendResponse({url:xhttp.responseURL});
			}
		};
		xhttp.open('GET', request.url, true);
		xhttp.send();
	}
	else if(request.name == "error"){
		chrome.tabs.query({currentWindow: true,active:true}, function(tabs){
			chrome.pageAction.setIcon({tabId: tabs[0].id, path: { "38" : "img/error38.png" }});
		});
		loc = request.case;
		err = "err";
	}
	else if(request.name == "ok"){
		chrome.tabs.query({currentWindow: true, active:true}, function(tabs){
			chrome.pageAction.setIcon({tabId: tabs[0].id, path: { "38" : "img/icon38.png" }});
		});
		loc = request.case;
		err = "";
	}
	else{
		window.localStorage.setItem(request.name,request.value);
		sendResponse(window.localStorage.getItem(request.name));
	}
});

var accessControlRequestHeaders;
var exposedHeaders;
// CSP settings
var callback = function(details) {
  for (var i = 0; i < details.responseHeaders.length; i++) {
    if ('http' === details.responseHeaders[i].name.toLowerCase()) {
      details.responseHeaders[i].value = '';
    }
  }
	/*var flag = false,
	rule = {
			"name": "Access-Control-Allow-Origin",
			"value": "*"
		};

	for (var i = 0; i < details.responseHeaders.length; ++i) {
		if (details.responseHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
			flag = true;
			details.responseHeaders[i].value = rule.value;
			break;
		}
	}
	if(!flag) details.responseHeaders.push(rule);

	if (accessControlRequestHeaders) {

		details.responseHeaders.push({"name": "Access-Control-Allow-Headers", "value": accessControlRequestHeaders});

	}

	if(exposedHeaders) {
		details.responseHeaders.push({"name": "Access-Control-Expose-Headers", "value": exposedHeaders});
	}

	details.responseHeaders.push({"name": "Access-Control-Allow-Methods", "value": "GET, PUT, POST, DELETE, HEAD, OPTIONS"});
*/
  return {responseHeaders: details.responseHeaders};
};

chrome.webRequest.onHeadersReceived.addListener(callback, {urls: ["<all_urls>"]}, ["blocking", "responseHeaders"]);

// same origin content policy settings
var requestListener = function(details) {
	var flag = false,
		rule = {
			name: "Origin",
			value: "https://navigator.web.de"
		};
	var i;

	for (i = 0; i < details.requestHeaders.length; ++i) {
		if (details.requestHeaders[i].name.toLowerCase() === rule.name.toLowerCase()) {
			flag = true;
			details.requestHeaders[i].value = rule.value;
			break;
		}
	}
	if(!flag) details.requestHeaders.push(rule);

	for (i = 0; i < details.requestHeaders.length; ++i) {
		if (details.requestHeaders[i].name.toLowerCase() === "access-control-request-headers") {
			accessControlRequestHeaders = details.requestHeaders[i].value
		}
	}

	return {requestHeaders: details.requestHeaders};
};
//chrome.webRequest.onBeforeSendHeaders.addListener(requestListener, {urls: ["<all_urls>"]}, ["blocking", "requestHeaders"]);
/*
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        chrome.tabs.update(tab.id, {url: message});
    });
		chrome.runtime.reload();
})
*/
