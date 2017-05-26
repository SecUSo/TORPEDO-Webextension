function resolveRedirect(url){
  var xhr = new XMLHttpRequest();
  // url as well as url result has to be https not http!!
  xhr.open('GET', url, true);
  xhr.onreadystatechange = function(){
    if(this.readyState == 4){
      console.log(xhr.responseURL);
    }
  };
  xhr.send(null);
}
