var torpedo = torpedo || {};
torpedo.trustedDomains = ["google.de","youtube.com","facebook.com","amazon.de","google.com","ebay.de","wikipedia.org","web.de","gmx.net","t-online.de","bing.com","ebay-kleinanzeigen.de","yahoo.com","bild.de","msn.com","spiegel.de","live.com","chip.de","mobile.de","paypal.com","otto.de","gutefrage.net","focus.de","immobilienscout24.de","outbrain.com","twitter.com","telekom.com","postbank.de","instagram.com","bahn.de","chefkoch.de","autoscout24.de","1und1.de","microsoft.com","kicker.de","blogspot.de","welt.de","netflix.com","booking.com","idealo.de","xing.com","fiducia.de","twitch.tv","pinterest.com","tumblr.com","zalando.de","wetter.com","heise.de","dict.cc","arbeitsagentur.de","wordpress.com","computerbild.de","ikea.com","sueddeutsche.de","vice.com","sky.de","leo.org","zeit.de","sport1.de","ask.com","deutsche-bank.de","linkedin.com","commerzbank.de","zdf.de","freenet.de","faz.net","adobe.com","n-tv.de","mediamarkt.de","siteadvisor.com","aol.com","tchibo.de","hm.com","immowelt.de","vodafone.de","ing-diba.de","dhl.de","giga.de","telekom.de","meinestadt.de","wetteronline.de","tagesschau.de","bonprix.de","apple.com","duden.de","whatsapp.com","lidl.de","check24.de","reddit.com","stern.de","wikia.com","9gag.com","arcor.de","ebay.com","dasoertliche.de","dropbox.com","holidaycheck.de","dkb.de","dawanda.com","tripadvisor.de","ardmediathek.de","google.co.uk","amazon.co.uk","bbc.co.uk","ebay.co.uk","dailymail.co.uk","theguardian.com","gov.uk","rightmove.co.uk","bt.com","imgur.com","amazon.com","lloydsbank.co.uk","sky.com","imdb.com","tripadvisor.co.uk","tesco.com","telegraph.co.uk","office.com","argos.co.uk","hsbc.co.uk","santander.co.uk","national-lottery.co.uk","booking.com","itv.com","barclays.co.uk","independent.co.uk","mirror.co.uk","nationwide.co.uk","asda.com","marksandspencer.com","natwest.com","johnlewis.com"];
torpedo.redirectDomains = ["1u.ro","1url.com","2pl.us","2tu.us","3.ly","a.gd","a.gg","a.nf","a2a.me","abe5.com","adjix.com","alturl.com","atu.ca","awe.sm","b23.ru","bacn.me","bit.ly","bkite.com","blippr.com","blippr.com","bloat.me","bt.io","budurl.com","buk.me","burnurl.com","c.shamekh.ws","cd4.me","chilp.it","chs.mx","clck.ru","cli.gs","clickthru.ca","cort.as","cuthut.com","cutt.us","cuturl.com","decenturl.com","df9.net","digs.by","doiop.com","dwarfurl.com","easyurl.net","eepurl.com","eezurl.com","ewerl.com","fa.by","fav.me","fb.me","ff.im","fff.to","fhurl.com","flic.kr","flq.us","fly2.ws","fuseurl.com","fwd4.me","getir.net","gl.am","go.9nl.com","go2.me","golmao.com","goo.gl","goshrink.com","gri.ms","gurl.es","hellotxt.com","hex.io","href.in","htxt.it","hugeurl.com","hurl.ws","icanhaz.com","icio.us","idek.net","is.gd","it2.in","ito.mx","j.mp","jijr.com","kissa.be","kl.am","korta.nu","l9k.net","liip.to","liltext.com","lin.cr","linkbee.com","littleurl.info","liurl.cn","ln-s.net","ln-s.ru","lnkurl.com","loopt.us","lru.jp","lt.tl","lurl.no","memurl.com","migre.me","minilien.com","miniurl.com","miniurls.org","minurl.fr","moourl.com","myurl.in","ncane.com","netnet.me","nn.nf","o-x.fr","ofl.me","omf.gd","ow.ly","oxyz.info","p8g.tw","parv.us","pic.gd","ping.fm","piurl.com","plurl.me","pnt.me","poll.fm","pop.ly","poprl.com","post.ly","posted.at","ptiturl.com","qurlyq.com","rb6.me","readthis.ca","redirects.ca","redirx.com","relyt.us","retwt.me","ri.ms","rickroll.it","rly.cc","rsmonkey.com","rubyurl.com","rurl.org","s3nt.com","s7y.us","saudim.ac","short.ie","short.to","shortna.me","shoturl.us","shrinkster.com","shrinkurl.us","shrtl.com","shw.me","simurl.net","simurl.org","simurl.us","sn.im","sn.vc","snipr.com","snipurl.com","snurl.com","soo.gd","sp2.ro","spedr.com","starturl.com","stickurl.com","sturly.com","su.pr","t.co","takemyfile.com","tcrn.ch","teq.mx","thrdl.es","tighturl.com","tiny.cc","tiny.pl","tinyarro.ws","tinytw.it","tinyurl.com","tl.gd","tnw.to","to.ly","togoto.us","tr.im","tr.my","trcb.me","tumblr.com","tw0.us","tw1.us","tw2.us","tw5.us","tw6.us","tw8.us","tw9.us","twa.lk","twd.ly","twi.gy","twit.ac","twitthis.com","twiturl.de","twitzap.com","twtr.us","twurl.nl","u.mavrev.com","u.nu","ub0.cc","updating.me","ur1.ca","url.co.uk","url.ie","url.inc-x.eu","url4.eu","urlborg.com","urlbrief.com","urlcut.com","urlhawk.com","urlkiss.com","urlpire.com","urlvi.be","urlx.ie","uservoice.com","ustre.am","virl.com","vl.am","wa9.la","wapurl.co.uk","wipi.es","wkrg.com","wp.me","x.co","x.hypem.com","x.se","xav.cc","xeeurl.com","xr.com","xrl.in","xrl.us","xurl.jp","xzb.cc","yatuc.com","ye-s.com","yep.it","yfrog.com","zi.pe","zz.gd"];
torpedo.status = "unknown";
/**
* determine security status of domain by
* looking up trusted, redirect, and user defined domains
*/
function getSecurityStatus(r){
  var cantBePhish = false;
  try{
    const url = new URL(torpedo.target.innerHTML.replace(" ",""));
    var linkTextDomain = extractDomain(url.hostname);
    console.log(linkTextDomain + " is in referrer? " + r.referrerPart1.indexOf(linkTextDomain) > -1);
    cantBePhish = r.referrerPart1.indexOf(linkTextDomain) > -1 || torpedo.redirectDomains.indexOf(linkTextDomain) > -1;
  } catch(e){console.log(e);}
  console.log("cant be phish: " + cantBePhish);
  console.log("torpedo domain " + torpedo.domain);

  if(r.referrerPart1.indexOf(torpedo.domain) > -1) torpedo.status = "encrypted";
  else if(torpedo.redirectDomains.indexOf(torpedo.domain) > -1) torpedo.status = "redirect";
  else if(!cantBePhish && isPhish(torpedo.domain)) torpedo.status = "phish";
  else if(torpedo.trustedDomains.indexOf(torpedo.domain) > -1 && r.trustedListActivated=="true") torpedo.status = "trusted";
  else if(r.userDefinedDomains.indexOf(torpedo.domain) > -1) torpedo.status = "userdefined";
  else torpedo.status = "unknown";
};

/**
* return true if link text and link target differs (classify link as phish)
* if link text does not contain url or is the same as target, return false
*/
function isPhish(){
  try {
    const linkText = new URL(torpedo.target.innerHTML.replace(" ",""));
    console.log(linkText);
    var domain = extractDomain(linkText.hostname);
    if(linkText.hostname && torpedo.domain != domain){
      return true;
    }
    else return false;
  } catch (e) {
    return false;
  }
};
