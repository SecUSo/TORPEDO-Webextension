<img src="https://raw.githubusercontent.com/SecUSo/TORPEDO-Webextension/refs/heads/main/src/shared/img/TORPEDO_fullLockup.svg"
     alt="Privacy Friendly QR Scanner Icon"
     width="180px"
     align="right"
     style="float: right; margin-right: 10px;" />
# TORPEDO - TOoltip-poweRed Phishing Email DetectiOn
[<img src="https://extensionworkshop.com/assets/img/documentation/publish/get-the-addon-129x45px.8041c789.png" alt="Get it on Firefox" height="60">](https://addons.mozilla.org/en-US/firefox/addon/torpedo-browser/)
[<img src="https://addons.thunderbird.net/static/img/addons-buttons/TB-AMO-button_2.png" alt="Get it on Firefox" height="60">](https://services.addons.thunderbird.net/En-us/thunderbird/addon/torpedo-phishing-detection/)

TORPEDO is a security-focused WebExtension for Thunderbird and Firefox that intercepts link hover
events, analyzes the target URL for phishing indicators, and shows an inline tooltip with a security
verdict before the user can click.

---

## Build System

Assembles a compressed .zip file for the respective target platform.

```bash
# Thunderbird
python build.py --version thunderbird
 
# Chrome
python build.py --version browser --browser chrome
 
# Firefox
python build.py --version browser --browser firefox
```

---

## Supported Webmail-Clients

The browser version of the webextension supports the following webmail clients:

- GoogleMail
- owa.kit.edu

---

## Third-Party Libraries (bundled in `src/shared/js/`)

| Library            | Used for                                   |
|--------------------|--------------------------------------------|
| `floating-ui`      | Tooltip positioning                        |
| `browser-polyfill` | Normalizes `browser.*` API across versions |
