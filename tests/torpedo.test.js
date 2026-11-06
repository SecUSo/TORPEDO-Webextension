// Run from the repo root: node --test
const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const SRC = path.join(__dirname, "..", "src", "shared", "js");

// Fake extension storage; reset before every test.
const storage = {};
const noNetwork = async () => { throw new Error("no network in tests"); };

const ctx = vm.createContext({
    console,
    URL,
    browser: {
        storage: { sync: { get: async () => storage } },
        runtime: { sendMessage: noNetwork }
    }
});

// Same load order as the manifest.
for (const file of ["torpedo.js", "utils.js", "punycode.js", "publicsuffixlist.js", "status.js", "redirect.js"]) {
    vm.runInContext(fs.readFileSync(path.join(SRC, file), "utf8"), ctx, { filename: file });
}

// Tiny suffix list instead of the real download, enough for these cases.
vm.runInContext(`Torpedo.publicSuffixList.parse("com\\nde\\nnet\\nco.uk\\nio\\ngithub.io", punycode.toASCII)`, ctx);

// Top-level function declarations of the loaded scripts live on the context.
const { getSecurityStatus, evaluateDomain, isRedirect, matchReferrer } = ctx;

const defaults = {
    trustedListActivated: true,
    trustedDomains: ["paypal.com", "google.com"],
    userDefinedDomains: ["mybank.de"],
    redirectDomains: ["bit.ly", "tinyurl.com", "BudURL.com"],
    referrerPart1: ["deref-gmx.net", "google.*"],
    referrerPart2: ["/mail/client/[...]/dereferrer/?", "/url?"],
    referrerPart3: ["redirectUrl=", "q="],
    privacyModeActivated: false,
    redirectModeActivated: false
};

// A fake <a> element: only what evaluateDomain reads.
const link = (text, title = null) => ({ innerText: text, getAttribute: () => title });

test.beforeEach(() => {
    Object.assign(storage, structuredClone(defaults));
    ctx.browser.runtime.sendMessage = noNetwork;
});

test.describe("getSecurityStatus", () => {
    test("follows redirect services via the background script", async () => {
        ctx.browser.runtime.sendMessage = async (msg) => {
            assert.deepEqual({ ...msg }, { name: "redirect", url: "https://bit.ly/abc" });
            return "https://www.example.com/";
        };

        const res = await getSecurityStatus(link("https://www.example.com/"), new URL("https://bit.ly/abc"), storage);
        assert.strictEqual(res.domain, "example.com");
        assert.strictEqual(res.redirectPending, false);
        assert.strictEqual(res.status, "T31");
    });

    test("marks the redirect as failed when it cannot be resolved", async () => {
        let calls = 0;
        ctx.browser.runtime.sendMessage = async () => {
            if (++calls > 50) throw new Error("loop");
            return null;
        };

        const res = await getSecurityStatus(link("https://tinyurl.com/dead"), new URL("https://tinyurl.com/dead"), storage);
        assert.ok(calls <= 10, `followed the same link ${calls} times`);
        assert.strictEqual(res.redirectFailed, true);
    });
});

test.describe("evaluateDomain", () => {
    const statusOf = (text, domain, referrerHops = 0) => evaluateDomain(link(text), domain, referrerHops, storage).status;

    test("T1 for trusted domains, only when the trusted list is active", () => {
        assert.strictEqual(statusOf("click", "paypal.com"), "T1");

        storage.trustedListActivated = false;
        assert.strictEqual(statusOf("click", "paypal.com"), "T31");
    });

    test("T2 for user defined domains", () => {
        assert.strictEqual(statusOf("click", "mybank.de"), "T2");
    });

    test("T31 for an unknown but inconspicuous domain", () => {
        assert.strictEqual(statusOf("Click here", "example.com"), "T31");
        assert.strictEqual(statusOf("https://www.example.com/a", "example.com"), "T31");
    });

    test("T32 for suspicious domain", () => {
        assert.strictEqual(statusOf("Click here", "192.168.0.1"), "T32");
        assert.strictEqual(statusOf("Click here", "pаypal.com"), "T32"); // Cyrillic "а"
        assert.strictEqual(statusOf("Click here", "pay​pal.com"), "T32"); // zero-width space
        assert.strictEqual(statusOf("https://paypal.com", "evil.com"), "T32");
    });

    test("broken url as link text is a visual mismatch", () => {
        assert.strictEqual(statusOf("www.paypal.com", "evil.com"), "T32");
    });

    test("referrer hops are only T31 when redirect mode is active", () => {
        assert.strictEqual(statusOf("Click here", "example.com", 1), "T32");

        storage.redirectModeActivated = true;
        assert.strictEqual(statusOf("Click here", "example.com", 1), "T31");

        // Redirect mode never overrules a visual mismatch.
        assert.strictEqual(statusOf("https://paypal.com", "evil.com", 1), "T32");
    });
});

test.describe("isRedirect", () => {
    test("known short link is detected", async () => {
        assert.strictEqual(await isRedirect("bit.ly"), true);
    });

    test("mixed-case (lower-case) list entry is detected", async () => {
        assert.strictEqual(await isRedirect("budurl.com"), true);
    });

    test("substring of a list entry is not a short link", async () => {
        assert.strictEqual(await isRedirect("it.ly"), false);
    });
});

test.describe("matchReferrer", () => {
    const NONE = "<NO_RESOLVED_REFERRER>";

    test("extracts and decodes the embedded URL of a referrer", () => {
        assert.strictEqual(
            matchReferrer("https://deref-gmx.net/mail/client/abc123/dereferrer/?redirectUrl=https%3A%2F%2Fevil.com%2Flogin", storage),
            "https://evil.com/login"
        );
    });

    test("real Google wrapper is unwrapped", () => {
        assert.strictEqual(matchReferrer("https://www.google.com/url?q=https://example.com", storage), "https://example.com");
    });

    test("returns correct message when no referrer", () => {
        assert.strictEqual(matchReferrer("https://google.evil.com/url?q=https://paypal.com", storage), NONE);
        assert.strictEqual(matchReferrer("https://example.com/?q=https://x.com", storage), NONE);
        assert.strictEqual(matchReferrer("https://www.google.de/url?q=notaurl", storage), NONE);
    });
});