const initialStorage = new Map([
    // array of objects with the following structure: {works: boolean, location: string}
    ['state', []],

    // default timer value in seconds for the countdown timer
    ['timer', 3],

    // no direct resolve of redirect domains
    ['privacyModeActivated', true],
    // if false user will be warned if the link is redirecting
    ['redirectModeActivated', false],

    // whether the timer should be activated for trusted domains and links or not
    ['trustedTimerActivated', false],
    // whether the timer should be activated for user defined domains or not
    ['userTimerActivated', false],

    // whether the sections in the tooltip should be shown or not
    ['section_url_active', true],
    ['section_security_active', true],
    ['section_info_active', true],
    ['section_timer_active', true],
    // whether the URL in the tooltip should be shortened to the domain only or not
    ['minimal_url', true],

    // referrer patterns for extracting the original URL
    ['referrerPart1', ["deref-gmx.net", "deref-web-02.de", "deref-web.de", "google.*", "google.*"]],
    ['referrerPart2', ["/mail/client/[...]/dereferrer/?", "/mail/client/[...]/dereferrer/?", "/mail/client/[...]/dereferrer/?", "/url?", "/url?"]],
    ['referrerPart3', ["redirectUrl=", "redirectUrl=", "redirectUrl=", "url=", "q="]],

    // whether the trusted list should be included in the status calculation or not
    ['trustedListActivated', true],
    // list of known trusted domains
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
    // list of domains that have been clicked by the user once
    ['onceClickedDomains', []],

    // list of user defined trusted domains
    ['userDefinedDomains', []],

    // list of known redirect domains for the redirect detection
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
        "share.google"
    ]],
]);


// Time-to-live for the TLD cache in milliseconds (24 hours)
const TLD_CACHE_TTL_MS = 24 * 60 * 60 * 1000;


/**
 * Initializes the storage with default values if they are not already set.
 * @returns {Promise<void>} A promise that resolves when the storage is initialized.
 */
const initializeStorage = async () => {
    const currentStorage = await browser.storage.sync.get(null);
    const newStorage = {};

    for (const [key, value] of initialStorage.entries()) {
        if (currentStorage[key] === undefined) {
            newStorage[key] = value;
        }
    }
    if (Object.keys(newStorage).length > 0) {
        await browser.storage.sync.set(newStorage);
    }
};


/**
 * Opens the tutorial page in a new tab.
 * @returns {Promise<void>} A promise that resolves when the tutorial page is opened.
 */
const showTutorial = async () => {
    await browser.tabs.create({ url: browser.runtime.getURL("tutorial.html") });
}


/**
 * Handles the extension installation event.
 * Initializes storage, registers message display scripts and shows the tutorial on first install.
 * @param details - The installation details.
 * @returns {Promise<void>} A promise that resolves when the installation handling is complete.
 */
const onInstalledHandler = async (details) => {
    await initializeStorage();
    await registerMessageDisplayScripts();

    if (details.reason === "install") {
        await showTutorial();
    }

    await browser.action.disable();
}


/**
 * Toggles the action icon based on the URL of the updated tab.
 * @param tabId - The ID of the updated tab.
 * @param changeInfo - The change information of the updated tab.
 * @param tab - The updated tab object.
 * @returns {Promise<void>} A promise that resolves when the action icon is toggled.
 */
const toggleActionIcon = async (tabId, changeInfo, tab) => {
    if (tab.url === undefined) {
        await browser.action.disable(tabId);
        return;
    }

    await browser.action.enable(tabId);
}


/**
 * Sends an email to the TORPEDO development team with information about an error.
 * @param location - The location where the error occurred.
 * @returns {Promise<void>} A promise that resolves when the email is sent.
 */
const sendEmail = async (location) => {
    const recipient = "torpedo@secuso.org";
    const subject = "Error with TORPEDO Webextension"

    const bodyText = `Dear TORPEDO-dev-Team,
    
    TORPEDO seems to not properly work in this location: "${location}"
    
    Here is additional information that might help you (add information to help resolve the issue here):
    `

    const body = encodeURIComponent(bodyText);

    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${body}`;
    await browser.tabs.create({ url: mailtoUrl });
}


/**
 * Updates the extension state in storage and changes the action icon accordingly.
 * @param works - A boolean indicating whether the extension works properly.
 * @param location - The location where the state update is occurring.
 * @returns {Promise<void>} A promise that resolves when the extension state is updated.
 */
const updateExtensionState = async (works, location) => {
    console.log(`update location ${location} to state ${works}`);

    const storage = await browser.storage.sync.get({ state: [] });
    let currentState = Array.isArray(storage.state) ? storage.state : [];

    const newEntry = { works, location };
    const existingIndex = currentState.findIndex(entry => entry.location === location);


    if (existingIndex !== -1) {  // If an entry for the same location already exists
        currentState[existingIndex] = newEntry;

    } else {  // If no entry for the location exists
        currentState.push(newEntry);
    }

    await browser.storage.sync.set({ state: currentState });

    const iconPath = works ? "img/icon38.png" : "img/error38.png";

    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            await browser.action.setIcon({ tabId: tab.id, path: { "38": iconPath } });
        }
    } catch (e) {
        console.log("Failed to set action icon:", e);
    }
}


/**
 * Fetches the Public Suffix List from publicsuffix.org and returns it as text.
 * The result is cached in local storage for TLD_CACHE_TTL_MS to avoid redundant network requests.
 * @returns {Promise<any|string>} - A promise that resolves to the TLD data as text.
 */
const fetchTLDWithCache = async () => {
    const cache = await browser.storage.local.get(["tldData", "tldCacheTime"]);

    if (cache.tldData && cache.tldCacheTime && (Date.now() - cache.tldCacheTime) < TLD_CACHE_TTL_MS) {
        return cache.tldData;
    }

    const res = await fetch("https://publicsuffix.org/list/public_suffix_list.dat");
    if (!res.ok) throw new Error(`TLD fetch failed: ${res.status}`);

    const text = await res.text();
    await browser.storage.local.set({ tldData: text, tldCacheTime: Date.now() });

    return text;
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
        try {
            switch (request.name) {

                case "redirect": {
                    const response = await fetch(request.url);
                    sendResponse(response.url);
                    break;
                }

                case "TLD": {
                    const text = await fetchTLDWithCache();
                    sendResponse(text);
                    break;
                }

                case "error": {
                    const location = request.location || sender?.tab?.url || "unknown";
                    await updateExtensionState(false, location);
                    sendResponse(null);
                    break;
                }

                case "ok": {
                    const location = request.location || sender?.tab?.url || "unknown";
                    await updateExtensionState(true, location);
                    sendResponse(null);
                    break;
                }

                case "settings": {
                    await browser.runtime.openOptionsPage();
                    sendResponse(null);
                    break;
                }

                case "tutorial": {
                    await showTutorial();
                    sendResponse(null);
                    break;
                }

                case "google": {
                    await browser.tabs.create({ url: `https://google.de/?q=${encodeURIComponent(request.url)}` });
                    sendResponse(null);
                    break;
                }

                case "open": {
                    await browser.tabs.create({ url: request.url });
                    sendResponse(null);
                    break;
                }

                case "close": {
                    const [tab] = await browser.tabs.query({ currentWindow: true, active: true });

                    if (tab) {
                        await browser.tabs.remove(tab.id);
                    }

                    sendResponse(null);
                    break;
                }

                case "sendMail": {
                    const location = request.location || "Unknown Location";
                    await sendEmail(location);
                    sendResponse(null);
                    break;
                }

                case "loadResource": {
                    const url = browser.runtime.getURL(request.path);
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Failed to load resource: ${request.path}`);

                    sendResponse(await res.text());
                    break;
                }

                case "getImageData": {
                    const url = browser.runtime.getURL(request.path);
                    const res = await fetch(url);
                    if (!res.ok) throw new Error(`Failed to load image: ${request.path}`);
                    const blob = await res.blob();

                    const dataUrl = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = () => reject(new Error("FileReader failed"));
                        reader.readAsDataURL(blob);
                    });

                    sendResponse(dataUrl);
                    break;
                }

                default:
                    console.warn(`Received message with unknown name: "${request.name}"`);
                    sendResponse(null);
            }

        } catch (error) {
            console.error(`Error handling message "${request.name}":`, error);
            sendResponse(null);
        }
    })();

    return true;  // Indicates that the response will be sent asynchronously
};


/**
 * Registers the scripts and stylesheets for the message display context.
 * @returns {Promise<void>} - A promise that resolves when the scripts are registered.
 */
async function registerMessageDisplayScripts() {
    const SCRIPT_ID = "secuso-torpedo";

    try {
        await messenger.scripting.messageDisplay.unregisterScripts({ ids: [SCRIPT_ID] });
    } catch (e) {}

    try {
        await messenger.scripting.messageDisplay.registerScripts([{
            id: SCRIPT_ID,
            js: [
                "js/floating-ui.core.umd.min.js",
                "js/floating-ui.dom.umd.min.js",
                "js/browser-polyfill.min.js",
                "js/torpedo.js",
                "js/utils.js",
                "js/punycode.js",
                "js/publicsuffixlist.js",
                "js/timer.js",
                "js/tooltip.js",
                "js/status.js",
                "js/redirect.js",
                "js/contentscript.js"
            ],
            css: [
                "css/all.min.css",
                "css/tooltip.css",
                "css/loader/loader.css"
            ]
        }]);

    } catch (error) {
        console.error("Failed to register message display scripts:", error);
    }
}


browser.runtime.onInstalled.addListener(onInstalledHandler);
browser.runtime.onStartup.addListener(registerMessageDisplayScripts);
browser.tabs.onUpdated.addListener(toggleActionIcon);
browser.runtime.onMessage.addListener(onMessageHandler);
