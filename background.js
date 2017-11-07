// init storage
chrome.runtime.onInstalled.addListener(function(){
  chrome.storage.sync.set({
		'onceClickedDomains': [],
		'userDefinedDomains': [],
		'timer': 3,
		'trustedTimerActivated': false,
		'userTimerActivated': false,
		'trustedListActivated': true,
		'referrerPart1': ["https://deref-gmx.net/mail/client/","https://deref-web-02.de/mail/client/"],
		'referrerPart2': ["/dereferrer/?redirectUrl=","/dereferrer/?redirectUrl="],
    'trustedDomains':["google.de","youtube.com","facebook.com","amazon.de","google.com","ebay.de","wikipedia.org","web.de","gmx.net","t-online.de","bing.com","ebay-kleinanzeigen.de","yahoo.com","bild.de","msn.com","spiegel.de","live.com","chip.de","mobile.de","paypal.com","otto.de","gutefrage.net","focus.de","immobilienscout24.de","outbrain.com","twitter.com","telekom.com","postbank.de","instagram.com","bahn.de","chefkoch.de","autoscout24.de","1und1.de","microsoft.com","kicker.de","blogspot.de","welt.de","netflix.com","booking.com","idealo.de","xing.com","fiducia.de","twitch.tv","pinterest.com","tumblr.com","zalando.de","wetter.com","heise.de","dict.cc","arbeitsagentur.de","wordpress.com","computerbild.de","ikea.com","sueddeutsche.de","vice.com","sky.de","leo.org","zeit.de","sport1.de","ask.com","deutsche-bank.de","linkedin.com","commerzbank.de","zdf.de","freenet.de","faz.net","adobe.com","n-tv.de","mediamarkt.de","siteadvisor.com","aol.com","tchibo.de","hm.com","immowelt.de","vodafone.de","ing-diba.de","dhl.de","giga.de","telekom.de","meinestadt.de","wetteronline.de","tagesschau.de","bonprix.de","apple.com","duden.de","whatsapp.com","lidl.de","check24.de","reddit.com","stern.de","wikia.com","9gag.com","arcor.de","ebay.com","dasoertliche.de","dropbox.com","holidaycheck.de","dkb.de","dawanda.com","tripadvisor.de","ardmediathek.de","google.co.uk","amazon.co.uk","bbc.co.uk","ebay.co.uk","dailymail.co.uk","theguardian.com","gov.uk","rightmove.co.uk","bt.com","imgur.com","amazon.com","lloydsbank.co.uk","sky.com","imdb.com","tripadvisor.co.uk","tesco.com","telegraph.co.uk","office.com","argos.co.uk","hsbc.co.uk","santander.co.uk","national-lottery.co.uk","booking.com","itv.com","barclays.co.uk","independent.co.uk","mirror.co.uk","nationwide.co.uk","asda.com","marksandspencer.com","natwest.com","johnlewis.com"],
    'redirectDomains':["bit.ly","goo.gl","bit.do","tinyurl.com","is.gd","cli.gs","pic.gd","DwarfURL.com","ow.ly","yfrog.com","migre.me","ff.im","tiny.cc","url4.eu","tr.im","twit.ac","su.pr","twurl.nl","snipurl.com","BudURL.com","short.to","ping.fm","Digg.com","post.ly","Just.as","bkite.com","snipr.com","flic.kr","loopt.us","doiop.com","twitthis.com","htxt.it","AltURL.com","RedirX.com","DigBig.com","short.ie","u.mavrev.com","kl.am","wp.me","u.nu","rubyurl.com","om.ly","linkbee.com","Yep.it","posted.at","xrl.us","metamark.net","sn.im","hurl.ws","eepurl.com","idek.net","urlpire.com","chilp.it","moourl.com","snurl.com","xr.com","lin.cr","EasyURI.com","zz.gd","ur1.ca","URL.ie","adjix.com","twurl.cc","s7y.us","EasyURL.net","atu.ca","sp2.ro","Profile.to","ub0.cc","minurl.fr","cort.as","fire.to","2tu.us","twiturl.de","to.ly","BurnURL.com","nn.nf","clck.ru","notlong.com","thrdl.es","spedr.com","vl.am","miniurl.com","virl.com","PiURL.com","1url.com","gri.ms","tr.my","Sharein.com","urlzen.com","fon.gs","Shrinkify.com","ri.ms","b23.ru","Fly2.ws","xrl.in","Fhurl.com","wipi.es","korta.nu","shortna.me","fa.b","WapURL.co.uk","urlcut.com","6url.com","abbrr.com","SimURL.com","klck.me","x.se","2big.at","url.co.uk","ewerl.com","inreply.to","TightURL.com","a.gg","tinytw.it","zi.pe","riz.gd","hex.io","fwd4.me","bacn.me","shrt.st","ln-s.ru","tiny.pl","o-x.fr","StartURL.com","jijr.com","shorl.com","icanhaz.com","updating.me","kissa.be","hellotxt.com","pnt.me","nsfw.in","xurl.jp","yweb.com","urlkiss.com","QLNK.net","w3t.org","lt.tl","twirl.at","zipmyurl.com","urlot.com","a.nf","hurl.me","URLHawk.com","Tnij.org","4url.cc","firsturl.de","Hurl.it","sturly.com","shrinkster.com","ln-s.net","go2cut.com","liip.to","shw.me","XeeURL.com","liltext.com","lnk.gd","xzb.cc","linkbun.ch","href.in","urlbrief.com","2ya.com","safe.mn","shrunkin.com","bloat.me","krunchd.com","minilien.com","ShortLinks.co.uk","qicute.com","rb6.me","urlx.ie","pd.am","go2.me","tinyarro.ws","tinyvid.io","lurl.no","ru.ly","lru.jp","rickroll.it","togoto.us","ClickMeter.com","hugeurl.com","tinyuri.ca","shrten.com","shorturl.com","Quip-Art.com","urlao.com","a2a.me","tcrn.ch","goshrink.com","DecentURL.com","decenturl.com","zi.ma","1link.in","sharetabs.com","shoturl.us","fff.to","hover.com","lnk.in","jmp2.net","dy.fi","urlcover.com","2pl.us","tweetburner.com","u6e.de","xaddr.com","gl.am","dfl8.me","go.9nl.com","gurl.es","C-O.IN","TraceURL.com","liurl.cn","MyURL.in","urlenco.de","ne1.net","buk.me","rsmonkey.com","cuturl.com","turo.us","sqrl.it","iterasi.net","tiny123.com","EsyURL.com","adf.ly","urlx.org","IsCool.net","twitterpan.com","GoWat.ch","poprl.com","njx.me","shrinkify.info"],
    "referrerSites":["3c-bap.web.de","3c.web.de","3c.gmx.net"],
    "publicSuffixList":{}
	});
})

function showTutorial(){
	chrome.tabs.create({
	    url: chrome.runtime.getURL('tutorial.html')
	});
};
chrome.runtime.onInstalled.addListener(showTutorial);

loc = "";
works = false;

function sendEmail() {
    var emailUrl = 'mailto:betty.ballin@secuso.org?subject='
                           + encodeURIComponent("Error with TORPEDO Webextension")
                           + "&body="
                           + encodeURIComponent("Mail panel could not be found in page: " + loc);
    chrome.tabs.create({ url: emailUrl });
}

function getStatus(){
  return {"works":works,"location":loc};
}

// enable page action only on email pages
chrome.tabs.onUpdated.addListener(function(tabId,status,info){
  var manifest = chrome.runtime.getManifest();
  var websites = manifest.content_scripts[0].matches;
  var showIcon = false;
  for( var i = 0; i < websites.length; i++){
    if(info.url.match(websites[i]) != null) showIcon = true;
  }
  if(showIcon){
    chrome.pageAction.show(tabId);
  }
});

// message passing with content script
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
  switch(request.name){
    case "redirect":
      var xhttp = new XMLHttpRequest();
  		xhttp.onreadystatechange = function(){
  			if (xhttp.readyState == 4){
  				sendResponse(xhttp.responseURL);
  			}
  		};
  		xhttp.open('GET', request.url, true);
  		xhttp.send(null);
      return true;
  		break;
    case "TLD":
      var xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function(){
        if (xhttp.readyState == 4){
          sendResponse(xhttp.response);
        }
      };
      xhttp.open('GET', "https://publicsuffix.org/list/public_suffix_list.dat", true);
      xhttp.send(null);
      return true;
      break;
    case "error":
      loc = request.location;
      works = false;
    	chrome.tabs.query({currentWindow: true,active:true}, function(tabs){
        try{
  				chrome.pageAction.setIcon({tabId: tabs[0].id, path: { "38" : "img/error38.png" }});
        } catch(e){}
  			});
      break;
    case "ok":
      loc = request.location;
      works = true;
      chrome.tabs.query({currentWindow: true,active:true}, function(tabs){
        try{
          chrome.pageAction.setIcon({tabId: tabs[0].id, path: { "38" : "img/icon38.png" }});
        } catch(e){}
      });
      break;
    case "settings":
      chrome.runtime.openOptionsPage();
      break;
    case "tutorial":
      showTutorial();
      break;
    case "google":
      var website = "http://google.de/#q="+request.url;
      chrome.tabs.create({
         url: website
      });
      break;
    case "open":
      chrome.tabs.create({
         url: request.url
      });
      break;
  }
});
