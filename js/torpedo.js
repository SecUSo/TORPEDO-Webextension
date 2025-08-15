const torpedo = {
    api: null,
    countRedirect: 0,
    countShortURL: 0,
    domain: "",  // the domain of the target URL
    event: null,
    hasTooltip: false,
    location: null,
    oldDomain: "",
    oldUrl: "",
    opened: false,
    pathname: "",  // the pathname of the target URL after the hostname
    progUrl: false,
    publicSuffixList: "",
    state: "unknown",
    target: null,  // target element for which the tooltip should be shown
    tooltip: null,  // tippy html content
    uri: "",  // URI object fot the target URL with protocol, host, port, pathname, search, hash, ...
    url: ""  // the complete URL of the target element
}