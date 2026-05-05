document.addEventListener("DOMContentLoaded", async () => {
    await OptionsPage.init();
});

const OptionsPage = {
    originalSettings: {},

    async init() {
        this.setStaticTexts();
        await this.loadAndApplySettings();
        await this.attachEventListeners();
    },

    async loadAndApplySettings() {
        const settings = await browser.storage.sync.get(null);
        this.originalSettings = { ...settings };

        // Timer tab
        document.getElementById("timerInput").value = settings.timer;
        document.getElementById("timerCheckbox").checked = settings.timer > 0;
        document.getElementById("trustedTimerCheckbox").checked = settings.trustedTimerActivated;
        document.getElementById("userTimerCheckbox").checked = settings.userTimerActivated;
        document.getElementById("privacyModeCheckbox").checked = settings.privacyModeActivated;
        document.getElementById("securityModeCheckbox").checked = settings.securityModeActivated;
        document.getElementById("redirectModeCheckbox").checked = settings.redirectModeActivated;

        // Domains tab
        document.getElementById("trustedListActivated").checked = settings.trustedListActivated;
        document.getElementById("showTrustedDomains").disabled = !settings.trustedListActivated;

        // Referrer tab
        document.getElementById("addDefaultReferrer").disabled = settings.referrerPart1?.includes("deref-gmx.net") &&
            settings.referrerPart1?.includes("deref-web-02.de");

        // Tooltip tab
        if (settings.section_url_active === true) {
            document.querySelector(".tooltip-preview-url").classList.remove("disabled")

        } else {
            document.querySelector(".tooltip-preview-url").classList.add("disabled")
        }

        if (settings.minimal_url === true) {
            document.querySelector(".tooltip-preview-href").classList.remove("disabled")
        } else {
            document.querySelector(".tooltip-preview-href").classList.add("disabled")
        }

        if (settings.section_security_active === true) {
            document.querySelector(".tooltip-preview-risk").classList.remove("disabled")
        } else {
            document.querySelector(".tooltip-preview-risk").classList.add("disabled")
        }

        if (settings.section_info_active === true) {
            document.querySelector(".tooltip-preview-info").classList.remove("disabled")
        } else {
            document.querySelector(".tooltip-preview-info").classList.add("disabled")
        }

        if (settings.section_timer_active === true) {
            document.querySelector(".tooltip-preview-timer").classList.remove("disabled")
        } else {
            document.querySelector(".tooltip-preview-timer").classList.add("disabled")
        }

        const img_element = document.getElementById("tooltip-preview-info-img");
        img_element.src = browser.runtime.getURL("img/info.png");

        document.getElementById("tooltipCheckbox-url").checked = settings.section_url_active;
        document.getElementById("tooltipCheckbox-url-minimal").checked = settings.minimal_url;
        document.getElementById("tooltipCheckbox-security").checked = settings.section_security_active;
        document.getElementById("tooltipCheckbox-info").checked = settings.section_info_active;
        document.getElementById("tooltipCheckbox-timer").checked = settings.section_timer_active;

        if (document.getElementById("referrerList")) await this.fillReferrerList();
        if (document.getElementById("trustedList")) await this.fillTrustedList();
        if (document.getElementById("userList")) await this.fillUserList();
        if (document.getElementById("shortURLList")) await this.fillShortURLList();

        document.getElementById('statusSettings').textContent = '';
        document.getElementById('errorAddUserDefined').textContent = '';
        document.getElementById('errorAddReferrer').textContent = '';
        document.getElementById('errorAddUserDefinedShortURL').textContent = '';
    },

    async attachEventListeners() {
        // Tab navigation
        document.querySelectorAll('.data-table').forEach(table => table.style.display = 'none');

        document.querySelector('.tab-links').addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                this.switchTab(e.target);
            }
        });

        // Timer tab
        document.getElementById("timerCheckbox").addEventListener('change', (e) => {
            const timerValue = e.target.checked ? 3 : 0;
            document.getElementById('timerInput').value = timerValue;
            chrome.storage.sync.set({ timer: timerValue });
        });

        document.getElementById("timerInput").addEventListener('change', (e) => {
            const timerValue = e.target.value;
            document.getElementById('timerCheckbox').checked = timerValue > 0;
            chrome.storage.sync.set({ timer: timerValue });
        });

        const addCheckboxListener = (id, settingName) => {
            document.getElementById(id).addEventListener('change', (e) => {
                chrome.storage.sync.set({ [settingName]: e.target.checked });
                this.loadAndApplySettings();
            });
        };

        addCheckboxListener('trustedTimerCheckbox', 'trustedTimerActivated');
        addCheckboxListener('userTimerCheckbox', 'userTimerActivated');
        addCheckboxListener('redirectModeCheckbox', 'redirectModeActivated');

        addCheckboxListener("tooltipCheckbox-url", "section_url_active");
        addCheckboxListener("tooltipCheckbox-url-minimal", "minimal_url");
        addCheckboxListener("tooltipCheckbox-security", "section_security_active");
        addCheckboxListener("tooltipCheckbox-info", "section_info_active");
        addCheckboxListener("tooltipCheckbox-timer", "section_timer_active");

        document.getElementById('privacyModeCheckbox').addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            document.getElementById('securityModeCheckbox').checked = !isChecked;
            chrome.storage.sync.set({ privacyModeActivated: isChecked, securityModeActivated: !isChecked });
        });
        document.getElementById('securityModeCheckbox').addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            document.getElementById('privacyModeCheckbox').checked = !isChecked;
            chrome.storage.sync.set({ securityModeActivated: isChecked, privacyModeActivated: !isChecked });
        });

        // Domains tab
        document.getElementById('trustedListActivated').addEventListener('change', (e) => {
            const isChecked = e.target.checked;
            document.getElementById('showTrustedDomains').disabled = !isChecked;
            chrome.storage.sync.set({ trustedListActivated: isChecked });
        });

        document.getElementById('showTrustedDomains').addEventListener('click', () => this.toggleListVisibility('trustedList'));
        document.getElementById('editUserDefined').addEventListener('click', () => this.toggleListVisibility('userList'));
        document.getElementById('addUserDefined').addEventListener('click', () => this.addUserDefined());

        // Redirect tab
        document.getElementById("clearReferrer").addEventListener("click", async () => {
            const table = document.getElementById("referrerList");
            const tbody = table.querySelector('tbody');
            tbody.innerHTML = `
                <tr>
                    <th id="referrerListTitle">${chrome.i18n.getMessage("referrerList")}</th>
                </tr>
            `;
            await chrome.storage.sync.set({ referrerPart1: [], referrerPart2: [], referrerPart3: [] });
            await this.loadAndApplySettings();
        });

        document.getElementById("addDefaultReferrer").addEventListener("click", () => {
            this.addDefaultReferrer();
        });

        document.getElementById("addReferrerAttribute").addEventListener("click", () => {
            this.addReferrer();
        });

        // Short-URL tab
        document.getElementById("addUserDefinedShortURL").addEventListener("click", () => {
            this.addShortURL();
        });

        document.getElementById("editShortURL").addEventListener("click", () => this.toggleListVisibility("shortURLList"));

        document.getElementById("saveChanges").addEventListener("click", async () => {
            const set = await browser.storage.sync.get(null);
            this.originalSettings = {};
            this.originalSettings = { ...set };
            console.log(set);
            document.getElementById("statusSettings").textContent = browser.i18n.getMessage("savedChangesThunderbird");
        });

        document.getElementById("revertChanges").addEventListener("click", async () => {
            await browser.storage.sync.set(this.originalSettings);

            const set = await browser.storage.sync.get(null);
            console.log(set);
            await this.loadAndApplySettings();
            document.getElementById("statusSettings").textContent = browser.i18n.getMessage("reversedChanges");
        });

        document.getElementById("defaultSettings").addEventListener("click", async () => {
            await browser.storage.sync.set({
                state : [],
                timer: 3,

                privacyModeActivated: true,
                redirectModeActivated: false,
                trustedTimerActivated: false,
                userTimerActivated: false,

                section_url_active: true,
                section_security_active: true,
                section_info_active: true,
                section_timer_active: true,
                minimal_url: true,

                referrerPart1: ["deref-gmx.net", "deref-web-02.de", "deref-web.de", "google.*", "google.*"],
                referrerPart2: ["/mail/client/[...]/dereferrer/?", "/mail/client/[...]/dereferrer/?", "/mail/client/[...]/dereferrer/?", "/url?", "/url?"],
                referrerPart3: ["redirectUrl=", "redirectUrl=", "redirectUrl=", "url=", "q="],

                trustedListActivated: true,
                trustedDomains:  [
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
                ],

                onceClickedDomains: [],
                userDefinedDomains: [],

                redirectDomains:  [
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
                ]
            });
            await this.loadAndApplySettings();
            document.getElementById("statusSettings").textContent = browser.i18n.getMessage("defaultSettingsRestored");
        });
    },

    switchTab(clickedLink) {
        document.querySelectorAll(".tab-links a").forEach(el => el.classList.remove("active"));
        document.querySelectorAll('.tab-content .tab').forEach(tab => tab.classList.remove('active'));

        clickedLink.classList.add('active');
        const targetTab = document.querySelector(clickedLink.getAttribute("href"));
        if (targetTab) {
            targetTab.classList.add('active');
        }

        document.querySelectorAll('.data-table').forEach(table => table.style.display = 'none');
    },

    toggleListVisibility(listId) {
        const listElement = document.getElementById(listId);
        if (listElement) {
            const isVisible = listElement.style.display !== 'none';
            // Hide all lists first
            document.querySelectorAll('.data-table').forEach(table => table.style.display = 'none');
            // Then show the target list if it was hidden
            listElement.style.display = isVisible ? 'none' : 'block';
        }
    },

    setStaticTexts() {
        const textMap = {
            // Timer tab
            "options-title": "options",
            "timerCheckboxText": "timerActivated",
            "timerAmountText": "timerAmount",
            "seconds": "seconds",
            "trustedTimerActivated": "activateTimerOnLowRisk",
            "userTimerActivated": "activateTimerOnUserList",
            "privacyModeActivated": "activatePrivacyMode",
            "securityModeActivated": "activateSecurityMode",
            "redirectModeActivated": "activateRedirectMode",
            // Domains tab
            "trustedListText": "lowRiskDomains",
            "activateTrustedList": "activateLowRiskList",
            "showTrustedDomains": "showLowRiskList",
            "userListText": "userDomains",
            "addUserDefined": "addEntries",
            "editUserDefined": "editUserList",
            // Referrer tab
            "referrerDialog1": "referrerInfo1",
            "referrerExample": "referrerExample",
            "referrerDialog2": "referrerInfo2",
            "referrerListTitle": "referrerList",
            "deleteReferrer": "deleteEntries",
            "clearReferrer": "clearEntries",
            "referrerHeadline": "addEntries",
            "addDefaultReferrer": "addDefaultReferrer",
            "addReferrerHost": "addEntries",
            "addReferrerPath": "addEntries",
            "addReferrerAttribute": "addEntries",
            "insertRandom": "insertRandom",
            "exampleReferrerHost": "exampleReferrerHost",
            "exampleReferrerPath": "exampleReferrerPath",
            "exampleReferrerAttribute": "exampleReferrerAttribute",
            // Redirection Short URL tab
            "shortURLText": "shortURLInfo",
            "shortURLListText": "shortURLListText",
            "editShortURL": "editUserList",
            "addUserDefinedShortURL": "addEntries",
            // Additional buttons
            "saveChanges": "saveChanges",
            "revertChanges": "revertChanges",
            "defaultSettings": "defaultSettings",
            // Lists
            "trustedListTitle": "trustedList",
            "userListTitle": "userList",
            // Tooltip tab
            "tooltip-text": "tooltip_text",
            "tooltipCheckboxText-url": "tooltipCheckboxText_url",
            "tooltipCheckboxText-security": "tooltipCheckboxText_security",
            "tooltipCheckboxText-info": "tooltipCheckboxText_info",
            "tooltipCheckboxText-timer": "tooltipCheckboxText_timer"
        }

        for (const id in textMap) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = browser.i18n.getMessage(textMap[id]) || textMap[id];
            }
        }
    },

    async addDefaultReferrer() {
        const defaultReferrers = [
            { host: 'deref-gmx.net', path: '/mail/client/[...]/dereferrer/?', attribute: 'redirectUrl=' },
            { host: 'deref-web-02.de', path: '/mail/client/[...]/dereferrer/?', attribute: 'redirectUrl=' }
        ];

        const settings = await chrome.storage.sync.get(['referrerPart1', 'referrerPart2', 'referrerPart3']);
        const hosts = settings.referrerPart1 || [];
        const paths = settings.referrerPart2 || [];
        const attributes = settings.referrerPart3 || [];

        defaultReferrers.forEach(referrer => {
            const alreadyExists = hosts.some((host, index) =>
                host === referrer.host &&
                paths[index] === referrer.path &&
                attributes[index] === referrer.attribute
            );

            if (!alreadyExists) {
                hosts.push(referrer.host);
                paths.push(referrer.path);
                attributes.push(referrer.attribute);

            }
        });

        await chrome.storage.sync.set({ referrerPart1: hosts, referrerPart2: paths, referrerPart3: attributes });
        await this.fillReferrerList();
        document.getElementById("addDefaultReferrer").disabled = true;
    },

    async fillReferrerList() {
        const settings = await browser.storage.sync.get(['referrerPart1', 'referrerPart2', 'referrerPart3']);
        const hosts = settings.referrerPart1 || [];
        const paths = settings.referrerPart2 || [];
        const attributes = settings.referrerPart3 || [];

        const table = document.getElementById("referrerList");
        const tbody = table.querySelector('tbody');
        tbody.innerHTML = `
                <tr>
                    <th id="referrerListTitle">${chrome.i18n.getMessage("referrerList")}</th>
                </tr>
            `;

        hosts.forEach((host, index) => {
            const path = paths[index] || "";
            const attribute = attributes[index] || "";

            const row = table.insertRow();
            const cell = row.insertCell(0);

            cell.innerHTML = `
                <div>
                    <button class="delete-btn" data-index="${index}" id="row${index}" style="margin-right:10px;color:red">X</button>
                    <span>${host}${path}${attribute}</span>
                </div>
           `;
        });

        tbody.onclick = (event) => {
            if (event.target.classList.contains("delete-btn")) {
                const indexToDelete = parseInt(event.target.dataset.index, 10);
                if (!isNaN(indexToDelete)) {
                    this.deleteReferrer(indexToDelete);
                }
            }
        }
    },

    async deleteReferrer(index) {
        const settings = await chrome.storage.sync.get(['referrerPart1', 'referrerPart2', 'referrerPart3']);

        const hosts = settings.referrerPart1 || [];
        const paths = settings.referrerPart2 || [];
        const attributes = settings.referrerPart3 || [];

        // Remove the element at the specified index from each array
        hosts.splice(index, 1);
        paths.splice(index, 1);
        attributes.splice(index, 1);

        // Save the modified arrays back to storage
        await chrome.storage.sync.set({ referrerPart1: hosts, referrerPart2: paths, referrerPart3: attributes });

        // Re-render the list with the updated data
        await this.fillReferrerList();
    },

    async addReferrer() {
        const hostInput = document.getElementById("referrerInputHost").value.trim().toLowerCase();
        const pathInput = document.getElementById("referrerInputPath").value.trim();
        const attributeInput = document.getElementById("referrerInputAttribute").value.trim();
        const errorElement = document.getElementById('errorAddReferrer');

        errorElement.textContent = '';

        const settings = await browser.storage.sync.get(['referrerPart1', 'referrerPart2', 'referrerPart3']);
        const hosts = settings.referrerPart1 || [];
        const paths = settings.referrerPart2 || [];
        const attributes = settings.referrerPart3 || [];

        const alreadyExists = hosts.some((host, index) => {
            return host === hostInput &&
                paths[index] === pathInput &&
                attributes[index] === attributeInput;
        });

        if (alreadyExists) {
            errorElement.textContent = browser.i18n.getMessage("alreadyInReferrerList");
            return;
        }

        const updatedHosts = [...hosts, hostInput];
        const updatedPaths = [...paths, pathInput];
        const updatedAttributes = [...attributes, attributeInput];

        await browser.storage.sync.set({
            referrerPart1: updatedHosts,
            referrerPart2: updatedPaths,
            referrerPart3: updatedAttributes
        })

        // re-rendering the list
        await this.fillReferrerList();

        document.getElementById('referrerInputHost').value = "";
        document.getElementById('referrerInputPath').value = "";
        document.getElementById('referrerInputAttribute').value = "";
    },

    async fillTrustedList() {
        const table = document.getElementById("trustedList");
        const settings = await browser.storage.sync.get(null);

        const tbody = table.querySelector('tbody');
        tbody.innerHTML = `
                <tr>
                    <th id="trustedListTitle">${chrome.i18n.getMessage("trustedList")}</th>
                </tr>
            `;

        settings.trustedDomains.forEach(domain => {
            const row = table.insertRow();
            const cell = row.insertCell(0);
            cell.textContent = domain;
        });
    },

    async fillUserList() {
        const settings = await browser.storage.sync.get(['userDefinedDomains']);
        const table = document.getElementById("userList");

        const tbody = table.querySelector('tbody');
        tbody.innerHTML = `
                <tr>
                    <th id="userListTitle">${chrome.i18n.getMessage("userList")}</th>
                </tr>
            `;

        settings.userDefinedDomains.forEach((domain, index) => {
            const row = table.insertRow();
            const cell = row.insertCell(0);
            cell.innerHTML = `
                <div>
                    <button class="delete-btn" data-index="${index}" id="row${index}" style="margin-right:10px;color:red">X</button>
                    <span>${domain}</span>
                </div>
            `;

            tbody.onclick = (event) => {
                if (event.target.classList.contains("delete-btn")) {
                    const indexToDelete = parseInt(event.target.dataset.index, 10);
                    if (!isNaN(indexToDelete)) {
                        const domains = settings.userDefinedDomains;
                        domains.splice(indexToDelete, 1);
                        browser.storage.sync.set({ userDefinedDomains: domains });
                        this.fillUserList();
                    }
                }
            }
        });
    },

    async addUserDefined() {
        let input = document.getElementById("userDefinedInput").value.trim();
        const errorElement = document.getElementById('errorAddUserDefined');
        const settings = await browser.storage.sync.get(null);

        errorElement.textContent = '';

        chrome.runtime.sendMessage({ name: "TLD" }, async (tld) => {
            torpedo.publicSuffixList.parse(tld, punycode.toASCII);
        });

        try {
            const href = new URL(input);
            input = TooltipManager.extractDomain(href.hostname);
        } catch (e) {
            errorElement.textContent = browser.i18n.getMessage("nonValidUrl");
            return;
        }

        if (settings.trustedDomains.includes(input) && settings.trustedListActivated) {
            errorElement.textContent = browser.i18n.getMessage("alreadyInTrustedUrls");
            return;
        }

        input = document.getElementById("userDefinedInput").value;
        if (settings.userDefinedDomains.includes(input)) {
            errorElement.textContent = browser.i18n.getMessage("alreadyInUserDefinedDomains");
            return;
        }

        const updatedDomains = [...settings.userDefinedDomains, input];
        await browser.storage.sync.set({ userDefinedDomains: updatedDomains });

        await this.fillUserList();
        document.getElementById("userDefinedInput").value = "";
    },

    async fillShortURLList() {
        const settings = await browser.storage.sync.get(['redirectDomains']);
        const table = document.getElementById("shortURLList");

        const tbody = table.querySelector('tbody');
        tbody.innerHTML = `
                <tr>
                    <th id="shortURLListTitle">${chrome.i18n.getMessage("trustedList")}</th>
                </tr>
            `;

        settings.redirectDomains.forEach((domain, index) => {
            const row = table.insertRow();
            const cell = row.insertCell(0);
            cell.innerHTML = `
                <div>
                    <button class="delete-btn" data-index="${index}" id="row${index}" style="margin-right:10px;color:red">X</button>
                    <span>${domain}</span>
                </div>
            `;

            tbody.onclick = (event) => {
                if (event.target.classList.contains("delete-btn")) {
                    const indexToDelete = parseInt(event.target.dataset.index, 10);
                    if (!isNaN(indexToDelete)) {
                        const domains = settings.redirectDomains;
                        domains.splice(indexToDelete, 1);
                        browser.storage.sync.set({ redirectDomains: domains });
                        this.fillShortURLList();
                    }
                }
            }
        });
    },

    async addShortURL() {
        const inputElement = document.getElementById("userDefinedShortURLInput").value.trim().toLowerCase();
        const settings = await browser.storage.sync.get(['redirectDomains']);
        const errorElement = document.getElementById('errorAddUserDefinedShortURL');

        if (settings.redirectDomains.includes(inputElement)) {
            errorElement.textContent = browser.i18n.getMessage("alreadyInReferrerList");
            return;
        }

        const domains = [...settings.redirectDomains, inputElement];
        await browser.storage.sync.set({ redirectDomains: domains });
        document.getElementById("userDefinedShortURLInput").value = "";

        await this.fillShortURLList();
    }
};