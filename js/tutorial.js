$(document).ready(function() {
  var i = 0;
  var lang = chrome.i18n.getUILanguage().substr(0,2);
  for(i = 1; i <= 10; i++){
    var img = $('<img class="image">');
    img.attr('src', "img/tutorial_"+lang+"-0"+i +".png");
    img.appendTo('div');
  }
});
