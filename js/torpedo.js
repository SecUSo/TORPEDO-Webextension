const torpedo = {
    api: null,  // tippy instance
    countRedirect: 0,
    countShortURL: 0,
    domain: "",
    event: null,
    hasTooltip: false,
    location: null,
    oldDomain: "",
    oldUrl: "",
    opened: false,
    pathname: "",
    progUrl: false,
    publicSuffixList: "",
    state: "unknown",
    target: null,  // target element for which the tooltip should be shown
    tooltip: null,  // tippy html content
    uri: "",
    url: ""
}