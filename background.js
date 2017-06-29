// storage settings
$.each(Torpedo,function(i,v){
	if(!window.localStorage.getItem(v.label)){
		window.localStorage.setItem(v.label,v.value);
	}
});
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
    if (request.action == "xhttp") {
        var xhttp = new XMLHttpRequest();
        xhttp.onload = function() {
            callback(xhttp.responseText);
        };
        xhttp.onerror = function() {
            callback();
        };
        xhttp.open('GET', request.url, true);
			  xhttp.onreadystatechange = function(){
			    if(this.readyState == 4){
			      try{
			        const redirect = new URL(xhttp.responseURL);
			        console.log(redirect);
			      }catch(e){console.log(e)}
			    }
			  };
			  xhttp.send(null);
        return true;
    }
});
chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
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
