$(document).ready(function() {
  var i = 0;
  var lang = chrome.i18n.getUILanguage().substr(0,3);
  for(i = 1; i <= 11; i++){
    var img = $('<img class="image">');
    img.attr('src', "img/tutorial_"+lang + (i<10? "0"+i : i) +".png");
    img.appendTo('div');
  }
});
