/**
*   resolve a redirection url, f.e. tinyurl
*/
function resolveRedirect(event){
  var url = torpedo.url;
  // url as well as url result has to be https not http!!
  if(url.indexOf("http") == 0){
    if(url.indexOf("https") == -1) url = url.slice(0, 4) + "s" + url.slice(4);
  }
  else{
    url = "https://" + url;
  }

  chrome.extension.sendRequest({name: "redirect", url: url},function(r){
    torpedo.api.set("hide.event","unfocus");
    torpedo.api.set("hide.delay",0);
    try{
      const redirect = new URL(r.url);
      updateTooltip(redirect);
    }catch(e){
      updateTooltip(url);
    }
  });
};

/**
*   resolve a referrer url, f.e. https://deref-gmx.net/mail/client/..
*/
function resolveReferrer(part1,part2){
  var url = torpedo.url;
  part1 = part1.split(",");
  part2 = part2.split(",");
  for(var i = 0; i < part1.length; i++){
    if(url.indexOf(part1[i] > -1)){
      var cut = part2[i] ? part2[i] : part1[i];
      var index = url.indexOf(cut);
      var temp = url.substring(index+cut.length, url.length);
      temp = decodeURIComponent(temp);
      try{
        const href = new URL(temp);
        return href;
      }catch(e){break;}
    }
  }
  return torpedo.uri;
};
