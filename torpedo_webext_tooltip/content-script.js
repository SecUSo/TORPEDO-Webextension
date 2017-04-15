var linkElement = document.getElementsByTagName("a");
var linkNumber = linkElement.length;
console.log("start");

if(linkNumber > 0){
  for(var i = 0; i<linkNumber;i++){
    var aElement = linkElement[i];
    var hrefValue = aElement.getAttribute("href");
    if(hrefValue){
      if(isURL(hrefValue)){
        aElement.setAttribute("class", "tooltip");
        //aElement.onmouseenter = function(event) {mouseOverHref(event);};
        var addonFrame = document.createElement ("IFRAME");
        addonFrame.setAttribute("class", "tooltiptext");
        addonFrame.frameBorder = "2";
        addonFrame.src = chrome.extension.getURL("torpedo.html");
        aElement.appendChild(addonFrame);
      }
    }
  }
}
function mouseOverHref(e){
  var target = e.target;
  /*var addonFrame = document.createElement ("IFRAME");
  addonFrame.style = "align: bottom; width: 150px; height: 38px;";
  addonFrame.frameBorder = "2";
  addonFrame.src = chrome.extension.getURL("torpedo.html");
  target.appendChild(addonFrame);*/
}
/*
If the click was on a link, send a message to the background page.
The message contains the link's URL.
*/
function notifyExtension(e) {
  var target = e.target;
  while ((target.tagName != "A" || !target.href) && target.parentNode) {
    target = target.parentNode;
  }
  if (target.tagName != "A")
    return;
  browser.runtime.sendMessage({"url": target.href});
}
function isURL(url) {
  console.log("is url? " + url);
  url = url.replace(" ", "");
  var regex = new RegExp("/^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([\u00C0-\u017F0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[\u00C0-\u017Fa-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?/g");
  if (regex.test(url)) {
    console.log("regex 1 true");
    // check if part after domain is too long, f.e. www.abc.abcd
    try{
      url = getDomainWithFFSuffix(url)
      var pos = url.lastIndexOf(".");
      url = url.substring(pos+1, url.length);
      if(url.length > 3){
        if(url[2].match(/^[A-Za-z]+$/) && url[3].match(/^[A-Za-z]+$/)) return false;
      }
    }
    catch(e){
    }
    console.log("true");
    return true;
  }
  // for problems with first pattern
  if (url.match(/^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!10(?:\.\d{1,3}){3})(?!127(?:\.\d{1,3}){3})(?!169\.254(?:\.\d{1,3}){2})(?!192\.168(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]+-?)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,3})))(?::\d{2,5})?(?:\/[^\s]*)?$/i)) {
    console.log("regex2 true");
    return true;
  }
  console.log("true");
  return false;
}
function getDomainWithFFSuffix(url) {
  var eTLDService = Components.classes["@mozilla.org/network/effective-tld-service;1"].getService(Components.interfaces.nsIEffectiveTLDService);
  var isIP = String(url).match(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g);
  if(isIP){
    start = url.indexOf("://")+3;
    url = url.substr(start, url.length);
    end = url.indexOf("/");
    var baseDomain = url.substr(0,end);
    return baseDomain;
  }
  try {
    var tempURI = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService).newURI(url, null, null);
    var baseDomain = eTLDService.getBaseDomain(tempURI);
    if(baseDomain.indexOf("www.")==0) {
        var arr = baseDomain.split("www.");
        baseDomain = arr[1];
    }
    return baseDomain;
  }
  catch(err) {
    if (url.indexOf("://") > -1) {
        url = url.split('/')[2];
    }
    else {
        url = url.split('/')[0];
    }
    var regex_var = new RegExp(/[^.]*\.[^.]{2,3}(?:\.[^.]{2,3})?$/);
    var array = regex_var.exec(url);
    try{
        url = array[0];
        array = url.split(".");
        if(array[0] == "www" || array[0].indexOf("http") > -1){
            url = "";
            for(var i = 1; i < array.length-1; i++){
                url += array[i] + ".";
            }
            url += array[array.length-1];
        }
        return url;
    }
    catch(err){
        return url;
    }
  }
};
/*
Add notifyExtension() as a listener to click events.
*/
//window.addEventListener("click", notifyExtension);
