# TORPEDO - TOoltip-poweRed Phishing Email DetectiOn

TORPEDO is a security-focused WebExtension (Thunderbird + Chrome/Firefox) that intercepts link hover
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
