var torpedo = torpedo || {};

/**
* user has clicked on a link via the tooltip
*/
function processClick(){
  if(torpedo.status == "unknown"){
    chrome.extension.sendRequest('show', function(r){
      var domains = r.onceClickedDomains;
      if(domains) domains = JSON.parse(domains);
      else domains = [];
      // console.log("onceClickedDomains: " + domains);
      // console.log("clicked on: " + torpedo.domain)
      // was domain clicked before ?
      if(domains.indexOf(torpedo.domain) > -1){
          // console.log("is in once clicked");
          // remove domain from once clicked domains
          var index = domains.indexOf(torpedo.domain);
          domains.splice(index, 1);
          chrome.extension.sendRequest({name : "onceClickedDomains", value : JSON.stringify(domains)},function(r){console.log("answer of request after setting onceClickedDomains is: " +r)});
          // add domain to user defined domains
          domains = r.userDefinedDomains;
          if(domains) domains = JSON.parse(domains);
          else domains = [];
          domains[domains.length] = torpedo.domain;
          // console.log("setting new userDefinedDomains with: " + JSON.stringify(domains));
          chrome.extension.sendRequest({name : "userDefinedDomains", value : JSON.stringify(domains)},function(r){console.log("answer of request after setting userDefinedDomains is: " +r)});
      }
      // add domain to once clicked domains
      else {
        // console.log("is not in once clicked");
        // console.log(domains.length);
        domains[domains.length] = torpedo.domain;
        // console.log("setting new onceClickedDomains with: " + JSON.stringify(domains));
        chrome.extension.sendRequest({name : "onceClickedDomains", value : JSON.stringify(domains)},function(r){console.log("answer of request after setting onceClickedDomains is: " +r)});
      }
    });
  }
};
