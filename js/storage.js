var torpedo = torpedo || {};

/**
* user has clicked on a link via the tooltip
*/
function processClick(){
  if(torpedo.status == "unknown"){
    chrome.runtime.sendMessage('show', function(r){
      var domains = r.onceClickedDomains;
      if(domains) domains = JSON.parse(domains);
      else domains = [];
      // was domain clicked before ?
      if(domains.indexOf(torpedo.domain) > -1){
          // remove domain from once clicked domains
          var index = domains.indexOf(torpedo.domain);
          domains.splice(index, 1);
          chrome.runtime.sendMessage({name : "onceClickedDomains", value : JSON.stringify(domains)},function(r){});
          // add domain to user defined domains
          domains = r.userDefinedDomains;
          if(domains) domains = JSON.parse(domains);
          else domains = [];
          domains[domains.length] = torpedo.domain;
          chrome.runtime.sendMessage({name : "userDefinedDomains", value : JSON.stringify(domains)},function(r){});
      }
      // add domain to once clicked domains
      else {
        domains[domains.length] = torpedo.domain;
        chrome.runtime.sendMessage({name : "onceClickedDomains", value : JSON.stringify(domains)},function(r){});
      }
    });
  }
};
