changes = [];

$(document).ready(function() {
  $('.tabs .tab-links a').on('click', function(e)  {
    var currentAttrValue = $(this).attr('href');
    // Show/Hide Tabs
    $('.tabs ' + currentAttrValue).show().fadeIn(400).siblings().hide();

    // Change/remove current tab to active
    $(this).parent('li').addClass('active').siblings().removeClass('active');
    e.preventDefault();
  });
  $('li').on("click", function(e){
    $("#trustedList").hide();
    $("#userList").hide();
  });

  $("#trustedList").hide();
  $("#userList").hide();

  addTexts();
  init();
  addEvents();
});

/**
* set texts of options page
*/
function addTexts(){
  // Title
  $("#options").html(chrome.i18n.getMessage("options"));
  $("#title").html(chrome.i18n.getMessage("options"));

  // Timer tab
  $("#timerCheckboxText").html(chrome.i18n.getMessage("timerActivated"));
  $("#timerAmountText").html(chrome.i18n.getMessage("timerAmount"));
  $("#seconds").html(chrome.i18n.getMessage("seconds"));
  $("#trustedTimerActivated").html(chrome.i18n.getMessage("activateTimerOnLowRisk"));
  $("#userTimerActivated").html(chrome.i18n.getMessage("activateTimerOnUserList"));

  // Domains tab
  $("#trustedListText").html(chrome.i18n.getMessage("lowRiskDomains"));
  $("#activateTrustedList").html(chrome.i18n.getMessage("activateLowRiskList"));
  $("#showTrustedDomains").html(chrome.i18n.getMessage("showLowRiskList"));
  $("#userListText").html(chrome.i18n.getMessage("userDomains"));
  $("#addUserDefined").html(chrome.i18n.getMessage("addEntries"));
  $("#editUserDefined").html(chrome.i18n.getMessage("editUserList"));

  // Referrer tab
  $("#referrerDialog1").html(chrome.i18n.getMessage("referrerInfo1"));
  $("#referrerExample").html(chrome.i18n.getMessage("referrerExample"));
  $("#referrerDialog2").html(chrome.i18n.getMessage("referrerInfo2"));
  $("#referrerListTitle").html(chrome.i18n.getMessage("referrerList"));
  $("#deleteReferrer").html(chrome.i18n.getMessage("deleteEntries"));
  $("#clearReferrer").html(chrome.i18n.getMessage("clearEntries"));
  $("#referrerHeadline").html(chrome.i18n.getMessage("addEntries"));
  $("#addDefaultReferrer").html(chrome.i18n.getMessage("addDefaultReferrer"));
  $("#addReferrer").html(chrome.i18n.getMessage("addEntries"));
  $("#insertRandom").html(chrome.i18n.getMessage("insertRandom"));

  // Additional buttons
  $("#saveChanges").html(chrome.i18n.getMessage("saveChanges"));
  $("#revertChanges").html(chrome.i18n.getMessage("revertChanges"));
  $("#defaultSettings").html(chrome.i18n.getMessage("defaultSettings"));

  // Lists
  $("#trustedListTitle").html(chrome.i18n.getMessage("trustedList"));
  $("#userListTitle").html(chrome.i18n.getMessage("userList"));
}

/**
* initialize the options page
*/
function init(){
  chrome.storage.sync.get(null,function(r) {
    // init changes for "revert changes" button
    changes = [];

    // Timer tab
    $("#timerCheckbox").prop("checked", r.timer>0);
    $("#timerInput").val(r.timer);
    $("#trustedTimerCheckbox").prop("checked", r.trustedTimerActivated);
    $("#userTimerCheckbox").prop("checked", r.userTimerActivated);

    // Domains tab
    $("#trustedListActivated").prop("checked", r.trustedListActivated);
    $("#showTrustedDomains").prop("disabled", !r.trustedListActivated);

    // Referrer tab
    var arr1 = r.referrerPart1;
    var arr2 = r.referrerPart2;
    var index1 = arr1.indexOf("https://deref-gmx.net/mail/client/");
    var index2 = arr1.indexOf("https://deref-web-02.de/mail/client/");
    var containsDefault = false;
    if(index1 > -1 && index2 > -1){
      containsDefault = arr2[index1] == "/dereferrer/?redirectUrl=" && arr2[index2] == "/dereferrer/?redirectUrl=";
    }
    if(document.getElementById("addDefaultReferrer")) document.getElementById("addDefaultReferrer").disabled = containsDefault;
    if(document.getElementById("referrerList")) fillReferrerList();

    // Additional buttons
    $("#statusSettings").html("");

    // Additional lists
    if(document.getElementById("trustedList")) fillTrustedList();
    if(document.getElementById("userList")) fillUserList();
    $("#errorAddUserDefined").html("");
  });
}

/**
*   filling the options page elements with functionalities
*/
function addEvents(){
  chrome.storage.sync.get(null,function(r) {
    // Timer tab
    $("#timerCheckbox").on('change', function(e) {
      save("timer",r.timer);
      var checked = $(this).prop("checked");
      if(!checked){
        chrome.storage.sync.set({ 'timer': 0 });
        $("#timerInput").val("0");
      }
      else {
        chrome.storage.sync.set({ 'timer': 3 });
        $("#timerInput").val("3");
      }
    });
    $("#timerInput").on('change', function(e) {
      save("timer", r.timer);
      var timer = $(this).val();
      chrome.storage.sync.set({ 'timer': timer });
      if(timer == 0) $("#timerCheckbox").prop("checked",false);
      else $("#timerCheckbox").prop("checked",true);
    });
    $("#trustedTimerCheckbox").on('change', function(e) {
      save("trustedTimerActivated", r.trustedTimerActivated);
      var checked = $(this).prop("checked");
      chrome.storage.sync.set({ 'trustedTimerActivated': checked });
    });
    $("#userTimerCheckbox").on('change', function(e) {
      save("userTimerActivated", r.userTimerActivated);
      var checked = $(this).prop("checked");
      chrome.storage.sync.set({ 'trustedTimerActivated': checked });
    });

    // Domains tab
    $("#trustedListActivated").on('change', function(e) {
      save("trustedListActivated", r.trustedListActivated);
      var checked = $(this).prop("checked");
      chrome.storage.sync.set({ 'trustedListActivated': checked });
      if(!checked) $("#showTrustedDomains").prop("disabled",true);
      else $("#showTrustedDomains").prop("disabled",false);
    });
    $("#showTrustedDomains").on('click', function(e)  {
      $("#userList").hide();
      $("#trustedList").toggle();
    });
    $("#addUserDefined").on('click', function(e)  {
      addUserDefined();
    });
    $("#editUserDefined").on('click', function(e)  {
      $("#trustedList").hide();
      $("#userList").toggle();
    });

    // Referrer tab
    $("#clearReferrer").on('click', function(e)  {
      save("referrerPart1", r.referrerPart1);
      save("referrerPart2", r.referrerPart2);
      var table = document.getElementById("referrerList");
      table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
      var arr1 = [];
      var arr2 = [];
      chrome.storage.sync.set({ 'referrerPart1': arr1 });
      chrome.storage.sync.set({ 'referrerPart2': arr2 });
      init();
    });
    $("#addDefaultReferrer").on('click',function(e){
      addDefaultReferrer();
    });

    $("#addReferrer").on('click', function(e) {
      addReferrer();
      init();
    });
    $("#insertRandom").on('click', function(e)  {
      $("#referrerInput").val($("#referrerInput").val()+"[...]");
    });

    // Additional buttons
    $("#saveChanges").on('click', function(e)  {
      changes = [];
      $("#statusSettings").html(chrome.i18n.getMessage("savedChanges"));
    });
    $("#revertChanges").on('click', function(e)  {
      for(var i=0; i<changes.length;i++){
        if(changes[i][0]=="onceClickedDomains")
          chrome.storage.sync.set({ 'onceClickedDomains'  :  changes[i][1] });
        else if(changes[i][0]=="userDefinedDomains")
          chrome.storage.sync.set({ 'userDefinedDomains' : changes[i][1] });
        else if(changes[i][0]=="timer")
          chrome.storage.sync.set({ 'timer' : changes[i][1] });
        else if(changes[i][0]=="trustedTimerActivated")
          chrome.storage.sync.set({ 'trustedTimerActivated' : changes[i][1] });
        else if(changes[i][0]=="userTimerActivated")
          chrome.storage.sync.set({ 'userTimerActivated' : changes[i][1] });
        else if(changes[i][0]=="trustedListActivated")
          chrome.storage.sync.set({ 'trustedListActivated' : changes[i][1] });
        else if(changes[i][0]=="referrerPart1")
          chrome.storage.sync.set({ 'referrerPart1' : changes[i][1] });
        else if(changes[i][0]=="referrerPart2")
          chrome.storage.sync.set({ 'referrerPart2' : changes[i][1] });
      }
      init();
      $("#statusSettings").html(chrome.i18n.getMessage("reversedChanges"));
    });
    $("#defaultSettings").on('click', function(e)  {
      chrome.storage.sync.set({
    		'onceClickedDomains': [],
    		'userDefinedDomains': [],
    		'timer': 3,
    		'trustedTimerActivated': false,
    		'userTimerActivated': false,
    		'trustedListActivated': true,
    		'referrerPart1': ["https://deref-gmx.net/mail/client/","https://deref-web-02.de/mail/client/"],
    		'referrerPart2': ["/dereferrer/?redirectUrl=","/dereferrer/?redirectUrl="]
    	});
      init();
      $("#statusSettings").html(chrome.i18n.getMessage("defaultSettingsRestored"));
    });
  });
}

function save(list,value){
  var i = 0;
  for(i=0;i<changes.length;i++){
    if(changes[i][0] == list){
      return;
    }
  }
  changes.push([list,value]);
}

/**
* adding all entries to the list of referrers
*/
function fillReferrerList(){
  chrome.storage.sync.get(null,function(r) {
    var table = document.getElementById("referrerList");
    table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
    var arr1 = r.referrerPart1;
    var arr2 = r.referrerPart2;
    for(i=0; i<arr1.length;i++){
      if(arr1[i].length > 0){
        var row = table.insertRow(table.rows.length);
        var cell = row.insertCell(0);
        var placeholder = arr2[i]? "<span style='color:blue;'> [...] </span>" : "";
        $(cell).html('<div><button id="row'+i+'" style="margin-right:10px;color:red">X</button><span>'+arr1[i]+placeholder+arr2[i]+"</span></div>");

        $("#row"+i).on("click",function(e){
          save("referrerPart1", r.referrerPart1);
          save("referrerPart2", r.referrerPart2);
          var split = $(this).next().html().split('<span style="color:blue;"> [...] </span>');
          var index = $(this).attr("id").replace("row","");
          $(this).parent().parent().parent().remove();
          if(!split[1]) split[1] = "";
          var arr1 = r.referrerPart1;
          var arr2 = r.referrerPart2;
          arr1.splice(index, 1);
          arr2.splice(index, 1);
          chrome.storage.sync.set({ 'referrerPart1': arr1 });
          chrome.storage.sync.set({ 'referrerPart2': arr2 });
          init();
        });
      }
    }
  });
}

/**
* adding all entries to the list of trusted domains
*/
function fillTrustedList(){
  chrome.storage.sync.get(null,function(r) {
    var i = 0;
    var table = document.getElementById("trustedList");
    table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
    for(i=0; i<r.trustedDomains.length;i++){
      var row = table.insertRow(table.rows.length);
      var cell = row.insertCell(0);
      $(cell).html(r.trustedDomains[i]);
    }
  });
}

/**
* adding all entries to the list of user defined domains
*/
function fillUserList(){
  chrome.storage.sync.get(null,function(r) {
    var userDomains = r.userDefinedDomains;
    var table = document.getElementById("userList");
    table.getElementsByTagName("tbody")[0].innerHTML = table.rows[0].innerHTML;
    for(i=0; i<userDomains.length;i++){
      var row = table.insertRow(table.rows.length);
      var cell = row.insertCell(0);
      $(cell).html('<div><button id="user'+i+'" name="'+userDomains[i]+'" style="margin-right:10px;color:red">X</button><span>'+userDomains[i]+'</span></div>');
      $("#user"+i).on("click",function(e){
        save("userDefinedDomains", r.userDefinedDomains);
        var element = $(this).next().html();
        var index = $(this).attr("id").replace("user","");
        $(this).parent().parent().parent().remove();
        var arr = r.userDefinedDomains;
        arr.splice(index, 1);
        chrome.storage.sync.set({ 'userDefinedDomains': arr });
      });
    }
  });
}
function addDefaultReferrer(){
  chrome.storage.sync.get(null,function(r) {
    save("referrerPart1", r.referrerPart1);
    save("referrerPart2", r.referrerPart2);
    var arr1 = r.referrerPart1;
    var arr2 = r.referrerPart2;
    var index1 = arr1.indexOf("https://deref-gmx.net/mail/client/");
    var index2 = arr1.indexOf("https://deref-web-02.de/mail/client/");
    var containsDefault = false;
    if(index1 > -1 && index2 > -1){
      containsDefault = arr2[index1] == "/dereferrer/?redirectUrl=" && arr2[index2] == "/dereferrer/?redirectUrl=";
    }
    if(!containsDefault){
      if(index1 == -1){
        arr1.push("https://deref-gmx.net/mail/client/");
        arr2.push("/dereferrer/?redirectUrl=");
      }
      if(index2 == -1){
        arr1.push("https://deref-web-02.de/mail/client/");
        arr2.push("/dereferrer/?redirectUrl=");
      }
      chrome.storage.sync.set({ 'referrerPart1': arr1 });
      chrome.storage.sync.set({ 'referrerPart2': arr2 });
      fillReferrerList();
    }
    document.getElementById("addDefaultReferrer").disabled = true;
  });
}
/**
* adding one entry to the list of user defined domains
*/
function addUserDefined(){
  chrome.storage.sync.get(null,function(r) {
    save("userDefinedDomains", r.userDefinedDomains);
    var table = document.getElementById("userList");
    var input = $("#userDefinedInput").val().replace(" ","");
    $("#errorAddUserDefined").html("");
    chrome.runtime.sendMessage({"name":'TLD'}, function(tld){
      torpedo.publicSuffixList.parse(tld, punycode.toASCII);
      try{
        const href = new URL(input);
        input = extractDomain(href.hostname);
      }catch(e){
        $("#errorAddUserDefined").html(chrome.i18n.getMessage("nonValidUrl"));
        return;
      }
      if(r.trustedDomains.indexOf(input)>-1 && r.trustedListActivated == "true"){
        $("#errorAddUserDefined").html(chrome.i18n.getMessage("alreadyInTrustedUrls"));
        return;
      }
      var arr = r.userDefinedDomains;
      if(arr.indexOf(input)>-1){
        $("#errorAddUserDefined").html(chrome.i18n.getMessage("alreadyInUserDefinedDomains"));
        return;
      }
      $("#userDefinedInput").val("");
      arr.push(input);
      chrome.storage.sync.set({ 'userDefinedDomains': arr });

      var row = table.insertRow(table.rows.length);
      var cell = row.insertCell(0);
      $(cell).html('<div><button id="user'+table.rows.length+'" name="'+input+'" style="margin-right:10px;color:red">X</button><span>'+input+"</span></div>");
      $("#userDefinedInput").val("");
      init();
    });
  });
}

/**
* adding one entry to the list of referrers
*/
function addReferrer(){
  chrome.storage.sync.get(null,function(r) {
    save("referrerPart1", r.referrerPart1);
    save("referrerPart2", r.referrerPart2);
    var table = document.getElementById("referrerList");
    var input = $("#referrerInput").val().replace(" ","").split("[...]");

    var arr1 = r.referrerPart1;
    var arr2 = r.referrerPart2;
    if(arr1.indexOf(input[0])>-1 && ((!input[1] && !arr2[arr1.indexOf(input[0])]) || (input[1] && arr2.indexOf(input[1])>-1))){
      $("#errorAddReferrer").html(chrome.i18n.getMessage("alreadyInReferrerList"));
      return;
    }
    var row = table.insertRow(table.rows.length);
    var cell = row.insertCell(0);
    if(input[1] == undefined) input[1] = "";
    var placeholder = input[1]? "<span style='color:blue'> [...] </span>" : "";
    $(cell).html('<div><button id="row'+table.rows.length+'" name="'+input[0]+','+input[1]+'" style="margin-right:10px;color:red">X</button><span>'+input[0]+placeholder+input[1]+"</span></div>");
    arr1.push(input[0]);
    arr2.push(input[1]);
    chrome.storage.sync.set({ 'referrerPart1': arr1 });
    chrome.storage.sync.set({ 'referrerPart2': arr2 });
    $("#referrerInput").val("");
    init();
  });
}
