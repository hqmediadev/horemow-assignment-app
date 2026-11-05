# HOREMOW Assignment Tracker

Installable web app for tracking Bible study, HOREMOW reading, prayer, and ministry assignments.

## Local development

Requirements: Node.js 20 or newer.

```sh
npm ci
cp .env.example .env
# Add GEMINI_API_KEY to .env to enable the AI endpoints.
npm run dev
```

The app is available at `http://localhost:3000`. PWA installation and service-worker registration are enabled in production builds; browsers require HTTPS (except localhost) to install the app.

## Production VPS deployment

This deployment example targets a single Ubuntu VPS running Node.js, systemd, and Nginx. Use a domain with DNS pointing to the VPS. Do not expose port 3000 publicly; Nginx terminates HTTPS and proxies to the loopback-only Node server.

### 1. Configure Firebase

1. Add your production domain to Firebase Authentication's authorized domains.
2. Deploy the restrictive Firestore rules:

   ```sh
   npx firebase-tools deploy --only firestore:rules --project horemow-assignment-57e4f
   ```

3. In Google Cloud Console, restrict the Firebase web API key in `firebase-applet-config.json` to the required Firebase APIs and your production HTTP referrers. The web API key identifies the Firebase project; it is not an admin credential.
4. Public registration creates member accounts only. To promote an existing account, run the admin script from a trusted machine with Application Default Credentials authorized for Firebase Authentication and Firestore Admin:

   ```sh
   gcloud auth application-default login
   FIREBASE_PROJECT_ID=horemow-assignment-57e4f npm run provision:overseer -- FIREBASE_AUTH_UID
   ```

   Never place service-account keys or admin credentials in the repository or the web server's `.env`. The user must sign out and back in after promotion so Firebase refreshes their custom claim.

### 2. Build and install the app

Install Node.js 20 or newer and Nginx on the VPS, then copy/clone the project into `/opt/horemow/app`. From the project directory:

```sh
npm ci
npm run lint
npm run build
sudo npm prune --omit=dev
```

Create a dedicated service user and an environment file readable only by root:

```sh
sudo useradd --system --home /opt/horemow --shell /usr/sbin/nologin horemow
sudo chown -R horemow:horemow /opt/horemow
sudo install -d -m 0750 /etc/horemow
sudo install -m 0600 /dev/null /etc/horemow/app.env
sudoedit /etc/horemow/app.env
```

Put the server-only Gemini key in `/etc/horemow/app.env`:

```dotenv
GEMINI_API_KEY=replace_with_your_key
```

Install and start the systemd service:

```sh
sudo cp deploy/horemow.service /etc/systemd/system/horemow.service
sudo systemctl daemon-reload
sudo systemctl enable --now horemow
sudo systemctl status horemow
```

### 3. Enable HTTPS with Nginx

Create a temporary HTTP Nginx server block for your domain, issue a TLS certificate with Certbot (`sudo certbot --nginx -d example.com -d www.example.com`), then replace `example.com` and certificate paths in `deploy/nginx.conf` and enable the site:

```sh
sudo cp deploy/nginx.conf /etc/nginx/sites-available/horemow
sudo ln -s /etc/nginx/sites-available/horemow /etc/nginx/sites-enabled/horemow
sudo nginx -t
sudo systemctl reload nginx
```

Allow inbound ports 80 and 443 only; keep SSH restricted to trusted administration networks. The Node service binds to `127.0.0.1:3000`, trusts one reverse proxy hop, applies Helmet security headers, limits JSON request size, and rate-limits AI requests. The in-memory rate limiter is intended for this single-instance setup; use a shared store if you scale to multiple Node processes or hosts.

Verify deployment:

```sh
curl -fsS https://example.com/api/health
```

Then open the HTTPS site on Android or desktop and use the browser's install option. The service worker precaches the app shell and static assets; API requests are not cached.

This makes the site an installable PWA; it does not by itself publish an app to Google Play. A Play Store release also needs a Trusted Web Activity package, a signing key, and a matching `/.well-known/assetlinks.json` file for the production domain.

## Operations

- Keep `.env`, `/etc/horemow/app.env`, admin credentials, and Firebase service-account keys out of source control.
- Rotate the Gemini key if it is ever exposed. Configure usage quotas and monitoring in Google AI Studio / Google Cloud.
- After changing Firestore rules or a service-worker asset, rebuild and redeploy. The service worker updates cached app assets automatically.
- Review logs with `sudo journalctl -u horemow -f`.
