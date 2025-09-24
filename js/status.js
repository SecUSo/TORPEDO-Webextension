/**
 * Determines the security status of the current domain.
 */
async function getSecurityStatus(storage) {
    let referrerURL = matchReferrer(torpedo.url, storage);

    while (referrerURL !== "<NO_RESOLVED_REFERRER>") {
        try {
            const href = new URL(referrerURL);
            TooltipManager.setNewUrl(href);
        } catch (e) { }

        referrerURL = matchReferrer(torpedo.url, storage);
        torpedo.countRedirect++;
    }

    if (await isRedirect(torpedo.domain)) {
        if (!storage.privacyModeActivated) {
            resolveRedirect();
            return "URLnachErmittelnButtonPrivacyMode";
        }
        return "URLnachErmittelnButton2";
    }

    if (inTrusted(torpedo.domain, storage)) return "T1";
    if (inUserList(torpedo.domain, storage)) return "T2";
    if (torpedo.progUrl || torpedo.hasTooltip || isIP(torpedo.domain)) return "T32";

    if (torpedo.countRedirect === 0) {
        return isMismatch(torpedo.domain) ? "T32" : "T31";
    }

    return storage.redirectModeActivated && !isMismatch(torpedo.domain) ? "T31" : "T32";
}

/**
 * Checks if the target element has a programmed tooltip.
 */
function hasTooltip(eventTarget) {
    return eventTarget.getAttribute("title") ?? "<HAS_NO_TOOLTIP>";
}

/**
 * Checks if a URL is a known redirector.
 */
async function isRedirect(url) {
    try {
        const { redirectDomains = [] } = await browser.storage.sync.get("redirectDomains");
        return redirectDomains.some(domain => domain.includes(url));
    } catch (e) { }
}

/**
 * Checks if a string is a URL without a protocol.
 */
function isURLwithoutProtocol(string) {
    return /^(?!https?:\/\/)www\./i.test(string);
}

/**
 * Checks for a mismatch between the link text and the actual domain.
 */
function isMismatch(domain) {
    try {
        let displayedLinkText = torpedo.target.innerText;
        if (isURLwithoutProtocol(displayedLinkText)) {
            displayedLinkText = "http://" + displayedLinkText;
        }

        const uri = new URL(displayedLinkText);
        const displayedLinkTextDom = TooltipManager.extractDomain(uri.hostname);

        return displayedLinkTextDom !== torpedo.oldDomain && displayedLinkTextDom !== domain;
    } catch (e) {
        return false;
    }
}

/**
 * Compares the domains of two URLs.
 */
function isTooltipMismatch(tooltipURL, hrefURL) {
    if (!tooltipURL || !hrefURL) return false;

    try {
        if (isURLwithoutProtocol(tooltipURL)) {
            tooltipURL = "http://" + tooltipURL;
        }

        const hrefDomain = TooltipManager.extractDomain(hrefURL);
        const tooltipDomain = TooltipManager.extractDomain(tooltipURL);
        return tooltipDomain !== hrefDomain;

    } catch (e) {
        return false;
    }
}

/**
 * Checks if a domain is in the trusted list.
 */
function inTrusted(domain, storage) {
    return storage.trustedListActivated && storage.trustedDomains?.some(d => d.includes(domain));
}

/**
 * Checks if a domain is in the user-defined list.
 */
function inUserList(url, storage) {
    return storage.userDefinedDomains?.some(d => d.includes(url));
}

const IPV4_REGEX = new RegExp(
    /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/
);

/**
 * Checks if an address is a valid IPv4 address.
 */
function isIP(address) {
    return IPV4_REGEX.test(address);
}


// unused methods for later features
function getSimilarTrustedList(storage) {
  let similarTrustedList = storage.similiarTrustedDomains;
  let userList = storage.userDefinedDomains;

  for (let i = 0; i < userList.length; i++) {
    let domainUserList = userList[i];
    let similarDomain = domainUserList.replace("-", "");
    similarTrustedList.push(domainUserList);

    const regEx = /^[0-9]+$/;
    similarDomain = similarDomain.replace(regEx, "");

    if (similarDomain.length >= 4) similarTrustedList.push(similarDomain);
  }

  return similarTrustedList;
}

/**
 * checks if the domain of the url is similar to a domain name in the green or blue list
 * @param url
 * @return {boolean}
 */
function isDomainExtension(domain, storage) {
  var domainWithoutTLD = domain.split(".")[0];
  var similarTrustedList = getSimilarTrustedList(storage);

  var okDomainList = storage.trustedDomains;
  var userList = storage.userDefinedDomains;

  okDomainList = okDomainList.concat(userList);
  okDomainList = okDomainList.concat(similarTrustedList);

  for (var j = 0; j < okDomainList.length; j++) {
    var okDomain = okDomainList[j];
    var okDomainSplit = okDomainList[j].split(".");
    var okDomainWithoutTLD = okDomainSplit[0];

    //check if a domain from the green, blue, or ok domain similar list was shortened and used in the link, e.g. immobilienscout.co.uk -> immobilienscout24.de
    if (okDomain.includes(domainWithoutTLD)) {
      var domainTLD = extractTLDfromDomain(domain);
      var domain2TLD = extractTLDfromDomain(okDomain);

      if (domainTLD != domain2TLD && domainTLD != "de" && domainTLD != "com") {
        return true;
      }
    }
    // does the link domain include a domain name from the green/blue list or from the ok domain similar list, e.g google-shop includes google
    if (
      domain.includes(okDomainWithoutTLD) &&
      okDomainWithoutTLD != "" &&
      domainWithoutTLD != okDomainWithoutTLD
    ) {
      return true;
    }
  }
  return false;
}
