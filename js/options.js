changes = [];
jQuery(document).ready(function() {
    jQuery('.tabs .tab-links a').on('click', function(e)  {
        var currentAttrValue = jQuery(this).attr('href');
        changes = [];
        // Show/Hide Tabs
        jQuery('.tabs ' + currentAttrValue).show().fadeIn(400).siblings().hide();

        // Change/remove current tab to active
        jQuery(this).parent('li').addClass('active').siblings().removeClass('active');

        e.preventDefault();
    });
    getTexts();
    init();
    addEvents();
});

function init(){
  // Timer tab
  var bool = window.localStorage.getItem(Torpedo.timer.label)>0;
  changes.push(["#timerCheckbox",bool]);
  jQuery("#timerCheckbox").prop("checked", bool);

  var timer = window.localStorage.getItem(Torpedo.timer.label);
  changes.push(["#timerInput",timer]);
  jQuery("#timerInput").val(timer);

  bool = window.localStorage.getItem(Torpedo.trustedTimerActivated.label) == "true";
  changes.push(["#trustedTimerCheckbox",bool]);
  jQuery("#trustedTimerCheckbox").prop("checked", bool);

  bool = window.localStorage.getItem(Torpedo.userTimerActivated.label) == "true";
  changes.push(["#userTimerCheckbox",bool]);
  jQuery("#userTimerCheckbox").prop("checked",bool);

  // Domains tab
  bool = window.localStorage.getItem(Torpedo.trustedListActivated.label) == "true";
  jQuery("#trustedListActivated").prop("checked",bool);
  changes.push(["#trustedListActivated",bool]);

  // Referrer tab
  var table = document.getElementById("referrerList");
  var part1 = window.localStorage.getItem(Torpedo.referrerPart1.label).split(",");
  var part2 = window.localStorage.getItem(Torpedo.referrerPart2.label).split(",");
  for(i=0; i<part1.length;i++){
    var row = table.insertRow(1);
    var cell = row.insertCell(0);
    jQuery(cell).html('<div><button id="row'+i+'" class="left" style="margin-right:10px;color:red">X</button><p class="right" style="white-space:nowrap;">'+part1[i]+"<span style='color:blue'> [...] </span>"+part2[i]+"</p></div>");
  }

  // Additional buttons
  jQuery("#statusSettings").html("");
}

function addEvents(){
  // Timer tab
  jQuery("#timerCheckbox").on('change', function(e) {
    var checked = jQuery("#timerCheckbox").prop("checked");
    if(!checked){
      window.localStorage.setItem(Torpedo.timer.label, 0);
      jQuery("#timerInput").val("0");
    }
    else {
      window.localStorage.setItem(Torpedo.timer.label, 3);
      jQuery("#timerInput").val("3");
    }
  });
  jQuery("#timerInput").on('change', function(e) {
    var timer = jQuery("#timerInput").val();
    window.localStorage.setItem(Torpedo.timer.label, timer);
    jQuery("#timerCheckbox").prop("checked",true);
    if(timer == 0){
      jQuery("#timerCheckbox").prop("checked",false);
    }
  });
  jQuery("#trustedTimerCheckbox").on('change', function(e) {
    window.localStorage.setItem(Torpedo.trustedTimerActivated.label, jQuery("#trustedTimerCheckbox").prop("checked"));
  });
  jQuery("#userTimerCheckbox").on('change', function(e) {
    window.localStorage.setItem(Torpedo.userTimerActivated.label, jQuery("#userTimerCheckbox").prop("checked"));
  });

  // Domains tab
  jQuery("#trustedListActivated").on('change', function(e) {
    window.localStorage.setItem(Torpedo.trustedListActivated.label, jQuery("#trustedListActivated").prop("checked"));
  });
  // TODO
  jQuery("#showTrustedDomains").on('click', function(e)  {});
  jQuery("#editSecond").on('click', function(e)  {});

  // Referrer tab
  jQuery("#clearReferrer").on('click', function(e)  {
    var table = document.getElementById("referrerList");
    var i = 0;
    var len = table.rows.length;
    for(i=0; i<len;i++){
      table.deleteRow(1);
    }
  });
  jQuery("#addReferrer").on('click', function(e)  {
    var table = document.getElementById("referrerList");
    var row = table.insertRow(table.rows.length);
    var cell = row.insertCell(0);
    var input = jQuery("#referrerInput").val().replace(" ","").split("[...]");
    if(input[1] != undefined) jQuery(cell).html('<div><button id="row'+i+'" class="left" style="margin-right:10px;color:red">X</button><p class="right" style="white-space:nowrap;">'+input[0]+"<span style='color:blue'> [...] </span>"+input[1]+"</p></div>");
    else jQuery(cell).html('<div><button id="row'+i+'" class="left" style="margin-right:10px;color:red">X</button><p class="right">'+input[0]+"</p></div>");
    jQuery("#referrerInput").val("");
  });
  jQuery("#insertRandom").on('click', function(e)  {
    jQuery("#referrerInput").val(jQuery("#referrerInput").val()+"[...]");
  });

  // Additional buttons
  jQuery("#saveChanges").on('click', function(e)  {
    changes = [];
    jQuery("#statusSettings").html(chrome.i18n.getMessage("savedChanges"));
  });
  jQuery("#revertChanges").on('click', function(e)  {
    var i = 0;
    for(i=0;i<changes.length;i++){
      if(changes[i][0] == "#timerInput"){
        jQuery(changes[i][0]).val(""+changes[i][1]);
      }
      else{
        jQuery(changes[i][0]).prop("checked",changes[i][1]);
      }
    }
    jQuery("#statusSettings").html(chrome.i18n.getMessage("reversedChanges"));
  });
  jQuery("#defaultSettings").on('click', function(e)  {
    jQuery("#statusSettings").html(chrome.i18n.getMessage("defaultSettingsRestored"));
  });

}

function getTexts(){
  // Title
  jQuery("#options").html(chrome.i18n.getMessage("options"));
  jQuery("#title").html(chrome.i18n.getMessage("options"));

  // Timer tab
  jQuery("#timerCheckboxText").html(chrome.i18n.getMessage("timerActivated"));
  jQuery("#timerAmountText").html(chrome.i18n.getMessage("timerAmount"));
  jQuery("#seconds").html(chrome.i18n.getMessage("seconds"));
  jQuery("#trustedTimerActivated").html(chrome.i18n.getMessage("activateTimerOnLowRisk"));
  jQuery("#userTimerActivated").html(chrome.i18n.getMessage("activateTimerOnUserList"));

  // Domains tab
  jQuery("#trustedListText").html(chrome.i18n.getMessage("lowRiskDomains"));
  jQuery("#activateTrustedList").html(chrome.i18n.getMessage("activateLowRiskList"));
  jQuery("#showTrustedDomains").html(chrome.i18n.getMessage("showLowRiskList"));
  jQuery("#userListText").html(chrome.i18n.getMessage("userDomains"));
  jQuery("#editSecond").html(chrome.i18n.getMessage("editUserList"));

  // Referrer tab
  jQuery("#referrerDialog1").html(chrome.i18n.getMessage("referrerInfo1"));
  jQuery("#referrerExample").html(chrome.i18n.getMessage("referrerExample"));
  jQuery("#referrerDialog2").html(chrome.i18n.getMessage("referrerInfo2"));
  jQuery("#referrerListTitle").html(chrome.i18n.getMessage("referrerList"));
  jQuery("#deleteReferrer").html(chrome.i18n.getMessage("deleteEntries"));
  jQuery("#clearReferrer").html(chrome.i18n.getMessage("clearEntries"));
  jQuery("#referrerHeadline").html(chrome.i18n.getMessage("addEntries"));
  jQuery("#addReferrer").html(chrome.i18n.getMessage("addEntries"));
  jQuery("#insertRandom").html(chrome.i18n.getMessage("insertRandom"));

  // Additional buttons
  jQuery("#saveChanges").html(chrome.i18n.getMessage("saveChanges"));
  jQuery("#revertChanges").html(chrome.i18n.getMessage("revertChanges"));
  jQuery("#defaultSettings").html(chrome.i18n.getMessage("defaultSettings"));
}
