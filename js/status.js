var torpedo = torpedo || {};
torpedo.state = "unknown";
torpedo.oldDomain = "";
r = null;

/**
* determine security status of domain by
* looking up trusted, redirect, and user defined domains
*/
function getSecurityStatus(storage){
  r = storage;
  if(torpedo.state == "URLnachErmittelnButton2"){
    if(isReferrer(torpedo.domain) || isRedirect(torpedo.domain)){
      torpedo.state = "WarnungPhish";
    }
    else{
      if(inTrusted(torpedo.domain)){
        torpedo.state = "T2Stern";
      }
      else if(inUserList(torpedo.domain)){
        torpedo.state = "T3Stern";
      }
      else{
        torpedo.state = "T1Stern";
      }
    }
    return;
  }

  torpedo.oldDomain = torpedo.domain;
  if(isReferrer(torpedo.domain)){ // redirect
    resolveReferrer(r);
    if(isReferrer(torpedo.domain)){// redirect + redirect
      torpedo.state = "WarnungPhish";
    }
    else if(isRedirect(torpedo.domain)){ // redirect + short url
      if(isMismatch(torpedo.domain)){
        torpedo.state = "WarnungPhish";
      }
      else{
        torpedo.state = "URLnachErmittelnButton2";
      }
    }
    else if(isMismatch(torpedo.domain)){ // redirect + mismatch
      if(inTrusted(torpedo.domain)){
        torpedo.state = "T2PHTH";
      }
      else if(inUserList(torpedo.domain)){
        torpedo.state = "T3PHTH";
      }
      else{
        torpedo.state = "T1PHTH";
      }
    }
    else { // simple redirect
      if(inTrusted(torpedo.domain)){
        torpedo.state = "T2PH";
      }
      else if(inUserList(torpedo.domain)){
        torpedo.state = "T3PH";
      }
      else{
        torpedo.state = "T1PH";
      }
    }
  }
  else if(isRedirect(torpedo.domain)){ // short url
    if(isMismatch(torpedo.domain)){
      torpedo.state = "WarnungPhish";
    }
    else{
      torpedo.state = "URLnachErmittelnButton2";
    }
  }
  else if(isMismatch(torpedo.domain)){
    if(inTrusted(torpedo.domain)){
      torpedo.state = "T2TH";
    }
    else if(inUserList(torpedo.domain)){
      torpedo.state = "T3TH";
    }
    else{
      torpedo.state = "T1TH";
    }
  }
  else{
    if(inTrusted(torpedo.domain)){
      torpedo.state = "T2";
    }
    else if(inUserList(torpedo.domain)){
      torpedo.state = "T3";
    }
    else{
      torpedo.state = "T1";
    }
  }
};

function isReferrer(url){
  var lst = r.referrerPart1;
  for(var i = 0; i < lst.length; i++){
    if(lst[i].indexOf(url) > -1) return true;
  }
  return false;
}

function isRedirect(url){
  var lst = r.redirectDomains;
  for(var i = 0; i < lst.length; i++){
    if(lst[i].indexOf(url) > -1) return true;
  }
  return false;
}

function isMismatch(url){
  try{
    const uri = new URL(torpedo.target.innerHTML.replace(" ",""));
    var linkTextDomain = extractDomain(uri.hostname);
    if(linkTextDomain != torpedo.oldDomain && linkTextDomain != url){
      return true;
    }
  } catch(e){}
  return false;
}

function inTrusted(url){
  if(r.trustedListActivated){
      var lst = r.trustedDomains;
      for(var i = 0; i < lst.length; i++){
        if(lst[i].indexOf(url) > -1) return true;
      }
  }
  return false;
}


function inUserList(url){
  var lst = r.userDefinedDomains;
  for(var i = 0; i < lst.length; i++){
    if(lst[i].indexOf(url) > -1) return true;
  }
  return false;
}
