var torpedo = torpedo || {};
torpedo.state = "unknown";
r = null;

/**
* determine security status of domain by
* looking up trusted, redirect, and user defined domains
*/
function getSecurityStatus(storage){
  r = storage;

  console.log(torpedo.domain);
  console.log(" is referrer?" + isReferrer());

      console.log(" is redirect?" + isRedirect());

      console.log(" is mismatch?" + isMismatch());
  if(isReferrer()){ // redirect
    resolveReferrer(r);
    console.log(torpedo.domain);
    console.log(" is referrer?" + isReferrer());

        console.log(" is redirect?" + isRedirect());

        console.log(" is mismatch?" + isMismatch());
    if(isReferrer()){// redirect + redirect
      torpedo.state = "WarnungPhish";
    }
    else if(isRedirect()){ // redirect + short url
      torpedo.state = "URLnachErmittelnButton2";
    }
    else if(isMismatch(true)){ // redirect + mismatch
      if(inTrusted()){
        torpedo.state = "T2PHTH";
      }
      else if(inUserList()){
        torpedo.state = "T3PHTH";
      }
      else{
        torpedo.state = "T1PHTH";
      }
    }
    else { // simple redirect
        console.log(" is in trusted?" + inTrusted());
            console.log(" is in user?" + inUserList());
      if(inTrusted()){
        torpedo.state = "T2PH";
      }
      else if(inUserList()){
        torpedo.state = "T3PH";
      }
      else{
        torpedo.state = "T1PH";
      }
    }
  }
  else if(isRedirect()){ // short url
  console.log(" is referrer?" + isReferrer());

      console.log(" is redirect?" + isRedirect());

      console.log(" is mismatch?" + isMismatch());
    if(isMismatch(true)){
      torpedo.state = "WarnungPhish";
    }
    else{
      torpedo.state = "ShortURL";
    }
  }
  else if(isMismatch()){ // mismatch
    if(inTrusted()){
      torpedo.state = "T2TH";
    }
    else if(inUserList()){
      torpedo.state = "T3TH";
    }
    else{
      torpedo.state = "T1TH";
    }
  }
  else{
    if(inTrusted()){
      torpedo.state = "T2";
    }
    else if(inUserList()){
      torpedo.state = "T3";
    }
    else{
      torpedo.state = "T1";
    }
  }
};

function isReferrer(){
  var lst = r.referrerPart1;
  for(var i = 0; i < lst.length; i++){
    if(lst[i].indexOf(torpedo.domain) > -1) return true;
  }
  return false;
}

function isRedirect(){
  var lst = r.redirectDomains;
  for(var i = 0; i < lst.length; i++){
    if(lst[i].indexOf(torpedo.domain) > -1) return true;
  }
  return false;
}

function isMismatch(alreadyChecked){
  // TODO
  if(alreadyChecked) return false;
  try{
    const url = new URL(torpedo.target.innerHTML.replace(" ",""));
    var linkTextDomain = extractDomain(url.hostname);
    if(linkTextDomain != torpedo.domain){
        return true;
    }
  } catch(e){}
  return false;
}

function inTrusted(){
  if(r.trustedListActivated){
      var lst = r.trustedDomains;
      for(var i = 0; i < lst.length; i++){
        if(lst[i].indexOf(torpedo.domain) > -1) return true;
      }
  }
  return false;
}


function inUserList(){
  var lst = r.userDefinedDomains;
  for(var i = 0; i < lst.length; i++){
    if(lst[i].indexOf(torpedo.domain) > -1) return true;
  }
  return false;
}
