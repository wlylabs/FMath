# Android app on Google Play (Trusted Web Activity)

Installing FMath from the browser makes Chrome mint a WebAPK. Phones from
Transsion (Infinix, Tecno, itel) and some others flag every app that was not
installed from Google Play or their own store, so people see "Risks May Exist"
and "Installation source scan". Publishing FMath on Google Play as a Trusted
Web Activity (TWA) removes that: the app is the same website, opened full
screen by Chrome, but installed from Play.

Nothing in the web app changes. The pieces already in this repo:

- `/privacy/` — the privacy policy URL Play asks for.
- `/disclaimer/` — not financial advice, not affiliated, referral disclosure.
- `scripts/build-assetlinks.mjs` — writes `/.well-known/assetlinks.json` at
  build time, which proves to Android that the app and the site have the same
  owner. Without it the app still works, but shows a browser address bar.

## 1. Generate the Android project

Needs Node 22, a JDK 17 and the Android SDK (Bubblewrap offers to download
both on first run).

```sh
npm i -g @bubblewrap/cli
mkdir android && cd android        # android/ is gitignored
bubblewrap init --manifest https://<your-domain>/manifest.webmanifest
```

Answers that matter:

| Prompt | Value |
| --- | --- |
| Domain | your production domain, no `https://` |
| URL path / start URL | `/?source=pwa` (from `src/app/manifest.ts`) |
| Application ID (package name) | `com.willydetrade.fmath` — must match `TWA_PACKAGE_NAME` if you change it |
| Display mode | `standalone` |
| Notifications / location delegation | **No** — FMath uses neither |
| Signing key | create a new one; keep the `.keystore` file and its passwords safe and **never commit them** |

Then build:

```sh
bubblewrap build     # app-release-bundle.aab for Play, app-release-signed.apk for testing
```

## 2. Publish the fingerprints

Android checks that the SHA-256 fingerprint of the key that signed the app is
listed in `assetlinks.json`. With Play App Signing (the default) Google re-signs
the app, so list **both**:

- Play Console → your app → Test and release → App integrity → **App signing
  key certificate** → SHA-256.
- Your upload key: `keytool -list -v -keystore android.keystore` → SHA-256.

Set them on the host (Vercel → Project → Settings → Environment Variables,
Production), comma separated, and redeploy:

```
TWA_SHA256_CERT_FINGERPRINTS=AB:CD:...:EF,12:34:...:56
TWA_PACKAGE_NAME=com.willydetrade.fmath   # optional, this is the default
```

Check `https://<your-domain>/.well-known/assetlinks.json`, then run it through
Google's [Statement List Tester](https://developers.google.com/digital-asset-links/tools/generator).

## 3. Play Console

- **Developer account**: one-time USD 25. New personal accounts must run a
  closed test with at least 12 testers for 14 days before production access.
- **Category**: Finance or Tools. Describe FMath as a fee and profit
  *calculator*: it holds no funds, connects to no wallet and places no orders.
  Mention that it is not affiliated with fomo and that the referral link earns
  the creator rewards — Play's Financial Services and deceptive-behaviour
  policies look for exactly this.
- **Privacy policy**: `https://<your-domain>/privacy/`.
- **Data safety**: no data collected, no data shared. Token searches go from
  the device straight to DexScreener and are not collected by FMath.
- **Content rating / target audience**: 18+, not designed for children.
- **Ads**: none.

## Updating

Web changes ship by deploying the site as usual; the Play app picks them up on
next launch. Rebuild and upload a new bundle (`bubblewrap update && bubblewrap
build`, bumping the version) only when the manifest's name, icons, colours or
start URL change.
