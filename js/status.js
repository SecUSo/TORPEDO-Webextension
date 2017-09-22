var torpedo = torpedo || {};
torpedo.status = "unknown";

/**
* determine security status of domain by
* looking up trusted, redirect, and user defined domains
*/
function getSecurityStatus(r){
  var isPhish = false;
  try{
    const url = new URL(torpedo.target.innerHTML.replace(" ",""));
    var linkTextDomain = extractDomain(url.hostname);
    if(r.referrerPart1.indexOf(linkTextDomain) > -1 || torpedo.redirectDomains.indexOf(linkTextDomain) > -1){
      if(linkText.hostname && torpedo.domain != domain){
        isPhish = true;
      }
    }
  } catch(e){}

  if(r.referrerPart1.indexOf(torpedo.domain) > -1) torpedo.status = "encrypted";
  else if(r.redirectDomains.indexOf(torpedo.domain) > -1) torpedo.status = "redirect";
  else if(isPhish) torpedo.status = "phish";
  else if(r.trustedDomains.indexOf(torpedo.domain) > -1 && r.trustedListActivated=="true") torpedo.status = "trusted";
  else if(r.userDefinedDomains.indexOf(torpedo.domain) > -1) torpedo.status = "userdefined";
  else torpedo.status = "unknown";
};
