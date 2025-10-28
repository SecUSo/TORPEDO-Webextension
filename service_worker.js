const initialStorage = new Map([
    ['onceClickedDomains', []],
    ['userDefinedDomains', []],
    ['timer', 3],
    ['tooltipTextCounter', [0, 0, 0, 0, 0, 0]],
    ['trustedTimerActivated', false],
    ['userTimerActivated', false],
    ['privacyModeActivated', true],
    ['securityModeActivated', false],
    ['redirectModeActivated', false],
    ['trustedListActivated', true],
    ['minimalTooltip_url', true],
    ['minimalTooltip_security', true],
    ['minimalTooltip_info', true],
    ['minimalTooltip_timer', true],
    ['referrerPart1', ["deref-gmx.net", "deref-web-02.de", "deref-web.de", "google.*", "google.*"]],
    ['referrerPart2', ["/mail/client/[...]/dereferrer/?", "/mail/client/[...]/dereferrer/?", "/mail/client/[...]/dereferrer/?", "/url?", "/url?"]],
    ['referrerPart3', ["redirectUrl=", "redirectUrl=", "redirectUrl=", "url=", "q="]],
    ['trustedDomains', [
        "kit.edu",
        "secuso.org",
        "amazon.com",
        "amazon.de",
        "aliexpress.com",
        "bahn.de",
        "bild.de",
        "bing.com",
        "blogspot.com",
        "booking.com",
        "chip.de",
        "deutsche-bank.de",
        "dhl.de",
        "ebay.de",
        "ebay-kleinanzeigen.de",
        "facebook.com",
        "fandom.com",
        "gmx.net",
        "google.com",
        "google.de",
        "google.ru",
        "idealo.de",
        "imdb.com",
        "immobilienscout24.de",
        "instagram.com",
        "live.com",
        "mail.ru",
        "microsoft.com",
        "mobile.de",
        "netflix.com",
        "ok.ru",
        "otto.de",
        "paypal.com",
        "postbank.de",
        "reddit.com",
        "shop-apotheke.com",
        "spiegel.de",
        "telekom.com",
        "t-online.de",
        "twitch.tv",
        "vk.com",
        "web.de",
        "wetter.com",
        "wikipedia.org",
        "yahoo.com",
        "yandex.ru",
        "youtube.com",
        "adobe.com",
        "apple.com",
        "baidu.com",
        "chase.com",
        "cnn.com",
        "craigslist.org",
        "dropbox.com",
        "ebay.com",
        "espn.com",
        "force.com",
        "imdb.com",
        "imgur.com",
        "indeed.com",
        "jd.com",
        "linkedin.com",
        "login.tmall.com",
        "msn.com",
        "myshopify.com",
        "nytimes.com",
        "office.com",
        "qq.com",
        "salesforce.com",
        "sohu.com",
        "spotify.com",
        "stackoverflow.com",
        "taobao.com",
        "tmall.com",
        "tumblr.com",
        "twitter.com",
        "walmart.com",
        "wellsfargo.com",
        "yelp.com",
        "zillow.com",
    ]],
    ['similiarTrustedDomains', [
        "amazon.com",
        "amazon.de",
        "aliexpress.com",
        "bahn.de",
        "bild.de",
        "bing.com",
        "blogspot.com",
        "booking.com",
        "chip.de",
        "deutschebank.de",
        "dhl.de",
        "ebay.de",
        "ebaykleinanzeigen.de",
        "facebook.com",
        "fandom.com",
        "gmx.net",
        "google.com",
        "google.de",
        "google.ru",
        "idealo.de",
        "imdb.com",
        "immobilienscout.de",
        "instagram.com",
        "live.com",
        "mail.ru",
        "microsoft.com",
        "mobile.de",
        "netflix.com",
        "ok.ru",
        "otto.de",
        "paypal.com",
        "postbank.de",
        "reddit.com",
        "shopapotheke.com",
        "spiegel.de",
        "telekom.com",
        "tonline.de",
        "twitch.tv",
        "vk.com",
        "web.de",
        "wetter.com",
        "wikipedia.org",
        "yahoo.com",
        "yandex.ru",
        "youtube.com",
        "adobe.com",
        "apple.com",
        "baidu.com",
        "chase.com",
        "cnn.com",
        "craigslist.org",
        "dropbox.com",
        "ebay.com",
        "espn.com",
        "force.com",
        "imdb.com",
        "imgur.com",
        "indeed.com",
        "jd.com",
        "linkedin.com",
        "login.tmall.com",
        "msn.com",
        "myshopify.com",
        "nytimes.com",
        "office.com",
        "qq.com",
        "salesforce.com",
        "sohu.com",
        "spotify.com",
        "stackoverflow.com",
        "taobao.com",
        "tmall.com",
        "tumblr.com",
        "twitter.com",
        "walmart.com",
        "wellsfargo.com",
        "yelp.com",
        "zillow.com",
    ]],
    ['redirectDomains', [
        "bit.ly",
        "goo.gl",
        "bit.do",
        "tinyurl.com",
        "is.gd",
        "cli.gs",
        "pic.gd",
        "DwarfURL.com",
        "ow.ly",
        "yfrog.com",
        "migre.me",
        "ff.im",
        "tiny.cc",
        "url4.eu",
        "tr.im",
        "twit.ac",
        "su.pr",
        "twurl.nl",
        "snipurl.com",
        "BudURL.com",
        "short.to",
        "ping.fm",
        "Digg.com",
        "post.ly",
        "Just.as",
        "bkite.com",
        "snipr.com",
        "flic.kr",
        "loopt.us",
        "doiop.com",
        "twitthis.com",
        "htxt.it",
        "AltURL.com",
        "RedirX.com",
        "DigBig.com",
        "short.ie",
        "u.mavrev.com",
        "kl.am",
        "wp.me",
        "u.nu",
        "rubyurl.com",
        "om.ly",
        "linkbee.com",
        "Yep.it",
        "posted.at",
        "xrl.us",
        "metamark.net",
        "sn.im",
        "hurl.ws",
        "eepurl.com",
        "idek.net",
        "urlpire.com",
        "chilp.it",
        "moourl.com",
        "snurl.com",
        "xr.com",
        "lin.cr",
        "EasyURI.com",
        "zz.gd",
        "ur1.ca",
        "URL.ie",
        "adjix.com",
        "twurl.cc",
        "s7y.us",
        "EasyURL.net",
        "atu.ca",
        "sp2.ro",
        "Profile.to",
        "ub0.cc",
        "minurl.fr",
        "cort.as",
        "fire.to",
        "2tu.us",
        "twiturl.de",
        "to.ly",
        "BurnURL.com",
        "nn.nf",
        "clck.ru",
        "notlong.com",
        "thrdl.es",
        "spedr.com",
        "vl.am",
        "miniurl.com",
        "virl.com",
        "PiURL.com",
        "1url.com",
        "gri.ms",
        "tr.my",
        "Sharein.com",
        "urlzen.com",
        "fon.gs",
        "Shrinkify.com",
        "ri.ms",
        "b23.ru",
        "Fly2.ws",
        "xrl.in",
        "Fhurl.com",
        "wipi.es",
        "korta.nu",
        "shortna.me",
        "fa.b",
        "WapURL.co.uk",
        "urlcut.com",
        "6url.com",
        "abbrr.com",
        "SimURL.com",
        "klck.me",
        "x.se",
        "2big.at",
        "url.co.uk",
        "ewerl.com",
        "inreply.to",
        "TightURL.com",
        "a.gg",
        "tinytw.it",
        "zi.pe",
        "riz.gd",
        "hex.io",
        "fwd4.me",
        "bacn.me",
        "shrt.st",
        "ln-s.ru",
        "tiny.pl",
        "o-x.fr",
        "StartURL.com",
        "jijr.com",
        "shorl.com",
        "icanhaz.com",
        "updating.me",
        "kissa.be",
        "hellotxt.com",
        "pnt.me",
        "nsfw.in",
        "xurl.jp",
        "yweb.com",
        "urlkiss.com",
        "QLNK.net",
        "w3t.org",
        "lt.tl",
        "twirl.at",
        "zipmyurl.com",
        "urlot.com",
        "a.nf",
        "hurl.me",
        "URLHawk.com",
        "Tnij.org",
        "4url.cc",
        "firsturl.de",
        "Hurl.it",
        "sturly.com",
        "shrinkster.com",
        "ln-s.net",
        "go2cut.com",
        "liip.to",
        "shw.me",
        "XeeURL.com",
        "liltext.com",
        "lnk.gd",
        "xzb.cc",
        "linkbun.ch",
        "href.in",
        "urlbrief.com",
        "2ya.com",
        "safe.mn",
        "shrunkin.com",
        "bloat.me",
        "krunchd.com",
        "minilien.com",
        "ShortLinks.co.uk",
        "qicute.com",
        "rb6.me",
        "urlx.ie",
        "pd.am",
        "go2.me",
        "tinyarro.ws",
        "tinyvid.io",
        "lurl.no",
        "ru.ly",
        "lru.jp",
        "rickroll.it",
        "togoto.us",
        "ClickMeter.com",
        "hugeurl.com",
        "tinyuri.ca",
        "shrten.com",
        "shorturl.com",
        "Quip-Art.com",
        "urlao.com",
        "a2a.me",
        "tcrn.ch",
        "goshrink.com",
        "DecentURL.com",
        "decenturl.com",
        "zi.ma",
        "1link.in",
        "sharetabs.com",
        "shoturl.us",
        "fff.to",
        "hover.com",
        "lnk.in",
        "jmp2.net",
        "dy.fi",
        "urlcover.com",
        "2pl.us",
        "tweetburner.com",
        "u6e.de",
        "xaddr.com",
        "gl.am",
        "dfl8.me",
        "go.9nl.com",
        "gurl.es",
        "C-O.IN",
        "TraceURL.com",
        "liurl.cn",
        "MyURL.in",
        "urlenco.de",
        "ne1.net",
        "buk.me",
        "rsmonkey.com",
        "cuturl.com",
        "turo.us",
        "sqrl.it",
        "iterasi.net",
        "tiny123.com",
        "EsyURL.com",
        "adf.ly",
        "urlx.org",
        "IsCool.net",
        "twitterpan.com",
        "GoWat.ch",
        "poprl.com",
        "njx.me",
        "shrinkify.info",
    ]],
    ['referrerSites', ["3c-bap.web.de", "3c.web.de", "3c.gmx.net"]],
    ['publicSuffixList', {}]
]);


/**
 * Initializes the storage with default values if they are not already set.
 * @returns {Promise<void>} A promise that resolves when the storage is initialized.
 */
const initializeStorage = async () => {
    const currentStorage = await chrome.storage.sync.get(null);
    const newStorage = {};
    for (const [key, value] of initialStorage.entries()) {
        if (currentStorage[key] === undefined) {
            newStorage[key] = value;
        }
    }
    if (Object.keys(newStorage).length > 0) {
        await chrome.storage.sync.set(newStorage);
    }
};


/**
 * Opens the tutorial page in a new tab.
 * @returns {Promise<void>} A promise that resolves when the tutorial page is opened.
 */
const showTutorial = async () => {
    await chrome.tabs.create({ url: chrome.runtime.getURL("tutorial.html") });
}


/**
 * Handles the extension installation event.
 * @param details - The installation details.
 * @returns {Promise<void>} A promise that resolves when the installation handling is complete.
 */
const onInstalledHandler = async (details) => {
    await initializeStorage();

    if (details.reason === "install") {
        await showTutorial();
    }

    await chrome.action.disable();
}


/**
 * Toggles the action icon based on the URL of the updated tab.
 * @param tabId - The ID of the updated tab.
 * @param changeInfo - The change information of the updated tab.
 * @param tab - The updated tab object.
 * @returns {Promise<void>} A promise that resolves when the action icon is toggled.
 */
const toggleActionIcon = async (tabId, changeInfo, tab) => {
    if (tab.url) {
        const manifest = chrome.runtime.getManifest();
        const contentScriptMatches = manifest.content_scripts[0].matches;
        const isMatched = contentScriptMatches.some((pattern) => tab.url.match(pattern) !== null);

        if (isMatched) {
            await chrome.action.enable(tabId);
        } else {
            await chrome.action.disable(tabId);
        }
    }
}


/**
 * Sends an email to the TORPEDO development team with information about an error.
 * @param location - The location where the error occurred.
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
const sendEmail = async (location) => {
    const emailUrl = new URL("mailto:torpedo@secuso.org")
    emailUrl.searchParams.set("subject", "Error with TORPEDO Webextension");
    emailUrl.searchParams.set("body", `Dear TORPEDO-dev-Team,\n\nTORPEDO seems to not properly work in this 
    location: "${location}"\nHere is additional information that might help you (add information to help resolve the issue here):`)

    await chrome.tabs.create({ url: emailUrl.href });
}


/**
 * Updates the extension state in storage and changes the action icon accordingly.
 * @param works - A boolean indicating whether the extension works properly.
 * @param location - The location where the state update is occurring.
 * @returns {Promise<void>} A promise that resolves when the extension state is updated.
 */
const updateExtensionState = async (works, location) => {
    await chrome.storage.sync.set({ state: { works, location } });
    const iconPath = works ? "img/icon38.png" : "img/error38.png";

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            await chrome.action.setIcon({ tabId: tab.id, path: { "38": iconPath } });
        }
    } catch (e) {
        console.log("Failed to set action icon:", e);
    }
}


/**
 * Handles incoming messages from content scripts or other parts of the extension.
 * @param request - The message request object.
 * @param sender - The sender of the message.
 * @param sendResponse - The function to send a response back to the sender.
 * @returns {boolean} - Indicates that the response will be sent asynchronously.
 */
const onMessageHandler = (request, sender, sendResponse) => {
    (async () => {
        switch (request.name) {
            case "redirect": {
                const response = await fetch(request.url);
                sendResponse(response.url);
                break;
            }

            case "TLD": {
                const response = await fetch("https://publicsuffix.org/list/public_suffix_list.dat", {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                const data = await response.text();
                sendResponse(data);
                break;
            }

            case "error": {
                await updateExtensionState(false, request.location);
                break;
            }

            case "ok": {
                await updateExtensionState(true, request.location);
                break;
            }

            case "settings": {
                await chrome.runtime.openOptionsPage()
                break;
            }

            case "tutorial": {
                await showTutorial();
                break;
            }

            case "google": {
                await chrome.tabs.create({ url: `https://google.de/?q=${encodeURIComponent(request.url)}` });
                break;
            }

            case "open": {
                await chrome.tabs.create({ url: request.url });
                break;
            }

            case "close": {
                const [tab] = await chrome.tabs.query({ currentWindow: true, active: true });

                if (tab) {
                    await chrome.tabs.remove(tab.id);
                }

                break;
            }

            case "sendMail": {
                const {state} = await chrome.storage.session.get("state");
                await sendEmail(state?.location || "");
                break;
            }
        }

    })();

    return true;
};


chrome.runtime.onInstalled.addListener(onInstalledHandler);
chrome.tabs.onUpdated.addListener(toggleActionIcon);
chrome.runtime.onMessage.addListener(onMessageHandler);
