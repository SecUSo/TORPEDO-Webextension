/**
*   resolve a redirection url, f.e. tinyurl
*/
function resolveRedirect(event){
  chrome.runtime.sendMessage({name: "redirect", url: torpedo.url},function(r){
    torpedo.api.set("hide.event","unfocus");
    torpedo.api.set("hide.delay",0);
    try{
      const href = new URL(r.url);
      setNewUrl(href);
      updateTooltip();
    }catch(e){}
  });
};

/**
*   resolve a referrer url, f.e. https://deref-gmx.net/mail/client/..
*/
function resolveReferrer(part1, part2){
  var url = torpedo.url;
  var arr1 = [];
  try{
    arr1 = JSON.parse(part1);
  }catch(err){}
  var arr2 = [];
  try{
    arr2 = JSON.parse(part2);
  }catch(err){}

  for(var i = 0; i < arr1.length; i++){
    if(url.indexOf(arr1[i] > -1)){
      var cut = arr2[i] ? arr2[i] : arr1[i];
      var index = url.indexOf(cut);
      var temp = url.substring(index+cut.length, url.length);
      temp = decodeURIComponent(temp);
      try{
        const href = new URL(temp);
        setNewUrl(href);
      }catch(e){
        console.log(e);
      }
      updateTooltip();
      break;
    }
  }
};
