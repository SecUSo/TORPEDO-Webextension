/**
*   resolve a redirection url, f.e. tinyurl
*/
function resolveRedirect(event){
  chrome.runtime.sendMessage({name: "redirect", url: torpedo.url},function(r){
    torpedo.api.set("hide.event","unfocus");
    torpedo.api.set("hide.delay",0);
    try{
      const href = new URL(r.url);
      torpedo.uri = href;
      torpedo.url = href.href;
      torpedo.domain = extractDomain(href.hostname);
      updateTooltip();
    }catch(e){}
  });
};

/**
*   resolve a referrer url, f.e. https://deref-gmx.net/mail/client/..
*/
function resolveReferrer(part1, part2){
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
        torpedo.uri = href;
        torpedo.url = href.href;
        torpedo.domain = extractDomain(href.hostname);
        updateTooltip();
      }catch(e){console.log(e);}
      break;
    }
  }
};
