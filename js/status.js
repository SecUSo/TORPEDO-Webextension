var torpedo = torpedo || {};
torpedo.state = "unknown";
r = null;

/**
 * determine security status of domain by
 * looking up trusted, redirect, and user defined domains
 */
function getSecurityStatus(storage) {
  r = storage;

  let referrerURL = matchReferrer(torpedo.url);

  while (referrerURL != "<NO_RESOLVED_REFERRER>") {
    try {
      const href = new URL(referrerURL);
      setNewUrl(href);
    } catch (e) {}

    referrerURL = matchReferrer(torpedo.url);
    torpedo.countRedirect++;
  }
  if (isRedirect(torpedo.domain)) {
    // short url
    torpedo.countShortURL++;
    if (!r.privacyModeActivated) {
      resolveRedirect(event);
      return "URLnachErmittelnButtonPrivacyMode";
    }
    return "URLnachErmittelnButton2";
  } else if (inTrusted(torpedo.domain)) {
    return "T1";
  } else if (inUserList(torpedo.domain)) {
    return "T2";
  } else if (torpedo.progUrl || torpedo.hasTooltip || isIP(torpedo.url)) {
    return "T32";
  } else if (torpedo.countRedirect == 0) {
    if (isMismatch(torpedo.domain)) {
      return "T32";
    } else {
      return "T31";
    }
  } else {
    if (r.redirectModeActivated) {
      if (!isMismatch(torpedo.domain)) {
        return "T31";
      } else {
        return "T32";
      }
    } else {
      return "T32";
    }
  }
}

/**
 * checks if link contains a tooltip
 * @param eventTarget
 * @return url from tooltip or <HAS_NO_TOOLTIP> if there is no tooltip
 */

function hasTooltip(eventTarget) {
  if (eventTarget.hasAttribute("title")) {
    tooltipURL = eventTarget.getAttribute("title");
    return tooltipURL;
  }
  return "<HAS_NO_TOOLTIP>";
}

function isRedirect(url) {
  var lst = r.redirectDomains;
  for (var i = 0; i < lst.length; i++) {
    if (lst[i].indexOf(url) > -1) return true;
  }
  return false;
}

function isURLwithoutProtocol(string) {
  var isURLorDomainRegEx = /^(https?:\/\/)|^(www.)/;
  var matchesURLorDomain = string.match(isURLorDomainRegEx);

  if (matchesURLorDomain.length > 0) {
    if (matchesURLorDomain[0] == "www.") {
      return true;
    }
  }
  return false;
}

function isMismatch(domain) {
  try {
    var displayedLinkText = torpedo.target.innerText;
    if (isURLwithoutProtocol(displayedLinkText)) {
      displayedLinkText = "http://" + displayedLinkText;
    }

    const uri = new URL(displayedLinkText);
    var displayedLinkTextDom = extractDomain(uri.hostname);

    if (
      displayedLinkTextDom != torpedo.oldDomain &&
      displayedLinkTextDom != domain
    ) {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

function isTooltipMismatch(tooltipURL, hrefURL) {
  if (
    tooltipURL == "" ||
    tooltipURL == undefined ||
    hrefURL == "" ||
    hrefURL == undefined
  ) {
    return false;
  }
  try {
    if (isURLwithoutProtocol(tooltipURL)) {
      tooltipURL = "http://" + tooltipURL;
    }
    var hrefDomain = extractDomain(hrefURL);
    var tooltipDomain = extractDomain(tooltipURL);
    return tooltipDomain != hrefDomain;
  } catch (e) {
    return false;
  }
}

function inTrusted(domain) {
  if (r.trustedListActivated) {
    const lst = r.trustedDomains;
    for (let i of lst) {
      if (i.indexOf(domain) > -1) return true;
    }
  }
  return false;
}

function inUserList(url) {
  var lst = r.userDefinedDomains;
  for (var i = 0; i < lst.length; i++) {
    if (lst[i].indexOf(url) > -1) return true;
  }
  return false;
}

function isIP(address) {
  const ipWithProtocol = new RegExp(
    "^http[s]?://((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])"
  );
  const ipWithoutProtocol = new RegExp(
    "^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])"
  );
  return ipWithProtocol.test(address) || ipWithoutProtocol.test(address);
}

function getSimilarTrustedList() {
  var similarTrustedList = r.similiarTrustedDomains;
  var userList = r.userDefinedDomains;

  for (var i = 0; i < userList.length; i++) {
    var domainUserList = userList[i];
    var similarDomain = domainUserList.replace("-", "");
    similarTrustedList.push(domainUserList);

    var regEx = /^[0-9]+$/;
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

function isDomainExtension(domain) {
  var domainWithoutTLD = domain.split(".")[0];
  var similarTrustedList = getSimilarTrustedList();

  var okDomainList = r.trustedDomains;
  var userList = r.userDefinedDomains;

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
