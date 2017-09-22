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
    'redirectDomains':["1u.ro","1url.com","2pl.us","2tu.us","3.ly","a.gd","a.gg","a.nf","a2a.me","abe5.com","adjix.com","alturl.com","atu.ca","awe.sm","b23.ru","bacn.me","bit.ly","bkite.com","blippr.com","blippr.com","bloat.me","bt.io","budurl.com","buk.me","burnurl.com","c.shamekh.ws","cd4.me","chilp.it","chs.mx","clck.ru","cli.gs","clickthru.ca","cort.as","cuthut.com","cutt.us","cuturl.com","decenturl.com","df9.net","digs.by","doiop.com","dwarfurl.com","easyurl.net","eepurl.com","eezurl.com","ewerl.com","fa.by","fav.me","fb.me","ff.im","fff.to","fhurl.com","flic.kr","flq.us","fly2.ws","fuseurl.com","fwd4.me","getir.net","gl.am","go.9nl.com","go2.me","golmao.com","goo.gl","goshrink.com","gri.ms","gurl.es","hellotxt.com","hex.io","href.in","htxt.it","hugeurl.com","hurl.ws","icanhaz.com","icio.us","idek.net","is.gd","it2.in","ito.mx","j.mp","jijr.com","kissa.be","kl.am","korta.nu","l9k.net","liip.to","liltext.com","lin.cr","linkbee.com","littleurl.info","liurl.cn","ln-s.net","ln-s.ru","lnkurl.com","loopt.us","lru.jp","lt.tl","lurl.no","memurl.com","migre.me","minilien.com","miniurl.com","miniurls.org","minurl.fr","moourl.com","myurl.in","ncane.com","netnet.me","nn.nf","o-x.fr","ofl.me","omf.gd","ow.ly","oxyz.info","p8g.tw","parv.us","pic.gd","ping.fm","piurl.com","plurl.me","pnt.me","poll.fm","pop.ly","poprl.com","post.ly","posted.at","ptiturl.com","qurlyq.com","rb6.me","readthis.ca","redirects.ca","redirx.com","relyt.us","retwt.me","ri.ms","rickroll.it","rly.cc","rsmonkey.com","rubyurl.com","rurl.org","s3nt.com","s7y.us","saudim.ac","short.ie","short.to","shortna.me","shoturl.us","shrinkster.com","shrinkurl.us","shrtl.com","shw.me","simurl.net","simurl.org","simurl.us","sn.im","sn.vc","snipr.com","snipurl.com","snurl.com","soo.gd","sp2.ro","spedr.com","starturl.com","stickurl.com","sturly.com","su.pr","t.co","takemyfile.com","tcrn.ch","teq.mx","thrdl.es","tighturl.com","tiny.cc","tiny.pl","tinyarro.ws","tinytw.it","tinyurl.com","tl.gd","tnw.to","to.ly","togoto.us","tr.im","tr.my","trcb.me","tumblr.com","tw0.us","tw1.us","tw2.us","tw5.us","tw6.us","tw8.us","tw9.us","twa.lk","twd.ly","twi.gy","twit.ac","twitthis.com","twiturl.de","twitzap.com","twtr.us","twurl.nl","u.mavrev.com","u.nu","ub0.cc","updating.me","ur1.ca","url.co.uk","url.ie","url.inc-x.eu","url4.eu","urlborg.com","urlbrief.com","urlcut.com","urlhawk.com","urlkiss.com","urlpire.com","urlvi.be","urlx.ie","uservoice.com","ustre.am","virl.com","vl.am","wa9.la","wapurl.co.uk","wipi.es","wkrg.com","wp.me","x.co","x.hypem.com","x.se","xav.cc","xeeurl.com","xr.com","xrl.in","xrl.us","xurl.jp","xzb.cc","yatuc.com","ye-s.com","yep.it","yfrog.com","zi.pe","zz.gd"]
	});
})

function showTutorial(){
	chrome.tabs.create({
	    url: chrome.runtime.getURL('tutorial.html')
	});
};
chrome.runtime.onInstalled.addListener(showTutorial);

function sendEmail() {
    var emailUrl = 'mailto:betty.ballin@secuso.org?subject='
                           + encodeURIComponent("Error with TORPEDO Webextension")
                           + "&body="
                           + encodeURIComponent("Mail panel could not be found in page: " + loc);
    chrome.tabs.create({ url: emailUrl });
}

// icon functions
err = "";

chrome.tabs.onUpdated.addListener(function(tabId,status,info){
  chrome.pageAction.show(tabId);
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		if(tabs[0].status == "complete"){
	  	chrome.tabs.sendMessage(tabs[0].id, {msg:"hi"}, function(response) {
				if (inList(info.url)) {
					var img = err?"img/error38.png":"img/icon38.png";
					try{
						chrome.pageAction.setIcon({tabId, path: { "38" : img }});
			    	chrome.pageAction.setPopup({tabId, popup: "/icon.html"});
					}catch(e){}
			  }
				else{
					try{
						chrome.pageAction.setIcon({tabId, path: { "38" : "img/none38.png" }});
						chrome.pageAction.setPopup({tabId, popup: ""});
					}catch(e){}
			  }
			});
		}
  });
});

function inList(url){
	var urls = ["mail.google.com","mg.mail.yahoo.com","email.t-online.de","outlook.live.com","navigator.web.de","navigator.gmx.net"]
	var i = 0;
	for(i=0; i< urls.length; i++){
		if(url.indexOf(urls[i])>-1) return true;
	}
	return false;
}

// message passing with content script
chrome.runtime.onMessage.addListener(function(request,sender,sendResponse){
	// redirect url message
	if(request.name == "redirect"){
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if (xhttp.readyState == 4){
				sendResponse(xhttp.responseURL);
			}
		};
		xhttp.open('GET', request.url, true);
		xhttp.send(null);
		return true;
	}
	else if(request.name == "TLD"){
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function(){
			if (xhttp.readyState == 4){
				sendResponse(xhttp.response);
			}
		};
		xhttp.open('GET', "https://publicsuffix.org/list/public_suffix_list.dat", true);
		xhttp.send(null);
		return true;
	}
	// icon: error with finding mail panel message
	else if(request.name == "error"){
		try{
			chrome.tabs.query({currentWindow: true,active:true}, function(tabs){
				chrome.pageAction.setIcon({tabId: tabs[0].id, path: { "38" : "img/error38.png" }});
			});
		}catch(e){}
		err = "err";
		sendResponse({});
	}
	// tooltip works message
	else if(request.name == "ok"){
		try{
			chrome.tabs.query({currentWindow: true,active:true}, function(tabs){
				chrome.pageAction.setIcon({tabId: tabs[0].id, path: { "38" : "img/icon38.png" }});
			});
		}catch(e){}
		err = "";
		sendResponse({});
	}
	else if(request.name == "open"){
		chrome.tabs.create({
			 url: request.url
	 	});
	}
});
