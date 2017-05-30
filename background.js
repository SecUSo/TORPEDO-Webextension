// storage settings
$.each(Torpedo,function(i,v){
	if(!window.localStorage.getItem(v.label)){
		window.localStorage.setItem(v.label,v.value);
	}
});

chrome.extension.onRequest.addListener(function(request,sender,sendResponse){
	if(request == "show"){
		var r = {
			onceClickedDomains:(window.localStorage.getItem(Torpedo.onceClickedDomains.label)),
			userDefinedDomains:(window.localStorage.getItem(Torpedo.userDefinedDomains.label)),
			timer:parseInt(window.localStorage.getItem(Torpedo.timer.label)),
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

// CSP settings
var callback = function(details) {
  for (var i = 0; i < details.responseHeaders.length; i++) {
    if ('content-security-policy' === details.responseHeaders[i].name.toLowerCase()) {
      details.responseHeaders[i].value = '';
    }
  }
  return {
    responseHeaders: details.responseHeaders
  };
};

var filter = {
  urls: ["*://*/*"],
  types: ["main_frame", "sub_frame"]
};

//chrome.webRequest.onHeadersReceived.addListener(callback, filter, ["blocking", "responseHeaders"]);
