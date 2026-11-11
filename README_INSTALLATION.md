# MAZE CYBER POS — Installation & Deployment

This package contains a service-based, offline-first POS front end and a Google Apps Script backend. It is a deployable starter build; it must be connected to the MAZE Google Sheet and tested with the actual Google deployment before live sales are entered.

## What is included

- Premium dark black-and-gold POS interface.
- 103 cyber service catalogue entries extracted from `THE MAZE SYSTEM POS.xlsx` (`catalogue.json` and `catalogue.js`).
- No inventory, stock deduction, consumables, purchases, customer-management or supplier-management modules.
- Cash and M-PESA payment selection, with optional M-PESA transaction reference.
- Government fees shown separately and excluded from cyber income and net operating balance.
- Local IndexedDB transaction queue and PWA service-worker cache for offline use.
- Separate date-based daily reports; period reports can be run for a full month and saved as P&L snapshots in `POS_ReportSnapshots`.
- PDF receipt and report download, CSV export, local backup/restore, and Google Drive spreadsheet backup.
- Multiple devices and locations, device IDs, central Google Sheets sync, duplicate transaction protection.
- Individual POS user accounts and ADMIN / MANAGER / CASHIER / VIEWER roles.

## Architecture

1. **PWA front end:** `index.html`, `styles.css`, `app.js`, `catalogue.js`, `catalogue.json`, `manifest.json`, `sw.js`.
2. **Local offline store:** IndexedDB in each browser/device. Each device queues its own sales and expenses until it can connect.
3. **Central database:** the Google Sheet created from the supplied workbook. The Apps Script creates separate `POS_Users`, `POS_Services`, `POS_Sales`, `POS_Expenses`, `POS_Devices`, `POS_AuditLog`, `POS_Sessions`, and `POS_ReportSnapshots` tabs. Existing workbook tabs are not overwritten.
4. **Backend:** `Code.gs`, deployed as a Google Apps Script web app. Sync is serialized with a script lock and each sale/expense has a unique ID to prevent duplicate appends.
5. **Time:** the POS records the computer's timestamp when the sale/expense is entered. The backend also records server receipt time. Reporting groups transactions by Africa/Nairobi business date.

## Part A — Prepare the Google Sheet

1. Upload `THE MAZE SYSTEM POS.xlsx` to Google Drive.
2. Open it in Google Sheets and use **File → Save as Google Sheets** if Drive has not converted it already. Keep this converted copy as the central MAZE CYBER workbook.
3. Open the converted Google Sheet.
4. Choose **Extensions → Apps Script**.
5. Replace the editor's starter code with the contents of `Code.gs`.
6. In Apps Script, open **Project Settings → Script Properties** and add:
   - `MAZE_ADMIN_EMAIL` = the administrator email address (it may be the admin's Google account email).
   - `MAZE_ADMIN_PASSWORD` = a new strong password of at least 12 characters. Do not reuse an email or Google password.
   - `MAZE_ALLOWED_ORIGINS` = temporarily leave blank until Part B identifies the PWA website origin.
   - `MAZE_SPREADSHEET_ID` = optional for a container-bound script; `setupMazePos()` fills this from the active spreadsheet. If needed, use the ID between `/d/` and `/edit` in the Google Sheet URL.
7. Save the project. Select `setupMazePos` and click **Run**. Approve the requested Google Sheets and Drive permissions.
8. Confirm the `POS_` tabs appear. The script creates the first ADMIN user from `MAZE_ADMIN_EMAIL` and `MAZE_ADMIN_PASSWORD` and imports the 103 services. It leaves the workbook's original tabs intact.

**Important:** Run `setupMazePos()` only once for the initial setup. Do not delete the `POS_` tabs or their rows. The service catalogue is seeded only if `POS_Services` is empty.

## Part B — Host the offline-capable POS website

The app needs a secure HTTPS origin for service-worker offline caching. Google Apps Script is the backend, not the PWA file host.

1. Create a private or organization-approved GitHub repository, for example `maze-cyber-pos`.
2. Upload the front-end files from this package to the repository root: `index.html`, `styles.css`, `app.js`, `catalogue.js`, `catalogue.json`, `manifest.json`, and `sw.js`. Do not upload passwords or private credentials; none are embedded in these files.
3. In GitHub repository **Settings → Pages**, publish from the main branch and root folder.
4. GitHub Pages will provide an HTTPS address such as `https://YOUR-ACCOUNT.github.io/maze-cyber-pos/`.
5. The allowed origin is the origin only, without the repository path: `https://YOUR-ACCOUNT.github.io`.
6. Return to Apps Script **Project Settings → Script Properties** and set `MAZE_ALLOWED_ORIGINS` to that exact origin. For local testing you may add `http://localhost:8000` as another comma-separated origin.

You can also host the static PWA on another HTTPS web host. Add that exact origin to `MAZE_ALLOWED_ORIGINS`.

## Part C — Deploy the Apps Script backend

1. In Apps Script choose **Deploy → New deployment**.
2. Select type **Web app**.
3. Set **Execute as: Me** (the spreadsheet owner/admin account).
4. Choose the access setting supported by your Google account/organization. The app uses its own MAZE POS user accounts; the backend writes to the owner's central sheet. If Google requires Google-account access, each staff member must be signed into an allowed Google account in that browser.
5. Deploy and copy the URL ending in `/exec`.
6. Open the published MAZE CYBER POS website. Paste the `/exec` URL into **Google Apps Script Web App URL** on the sign-in screen.
7. Sign in using the initial admin email and password set in Script Properties.

If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version → Deploy** so the `/exec` deployment uses the latest code.

## Part D — Add other staff and locations

1. Sign in as ADMIN on an online computer.
2. Open **User Access** and create an individual POS account for each person. Use their Google account email as the account email if that is how you want to identify them, but assign a separate MAZE POS password.
3. Use roles carefully:
   - ADMIN: full access, user administration and Google Drive backups.
   - MANAGER: sales/expenses and reporting; no user creation or cloud backup.
   - CASHIER: sales/expenses and sync.
   - VIEWER: read-only reporting.
4. On every computer/location, open the same HTTPS PWA URL, enter the same Apps Script `/exec` URL, and sign in online once. Set that computer's **Location / branch name** under Settings.
5. Install the site as an app from the browser's install option where available. Keep the browser profile and Windows user account protected.
6. Open the app online at least once on each device so the service worker caches the interface and the service catalogue. Each user must sign in online on that device before their offline sign-in can work.

## Offline and synchronization behaviour

- Sales and expenses are first saved to that computer's IndexedDB. The POS can continue working without internet after initial setup/cache.
- The app attempts synchronization when internet returns and also has a **Synchronize now** button.
- The server stores each transaction once using its unique transaction ID. A retry after a dropped connection is treated as a duplicate rather than a second sale.
- Each computer has a separate queue and device ID. Online reports are central/global; while offline, reports show only the data currently saved on that device. Once synced, the central Google Sheet contains all locations' records.
- A user must have signed in online on a device before they can sign in offline on it. Offline credentials are stored as a salted PBKDF2 verifier, not as a plain-text password.
- An offline device cannot immediately learn that a user's access was disabled centrally. It receives that change only after reconnecting. Keep offline access limited to trusted devices and protect each computer's operating-system login.

## Financial definitions

- **Customer collections** = cyber fees + government fees received from the customer.
- **Government fees** are visible and separately reported, but excluded from cyber income and net operating balance.
- **Cyber income** = cyber service fees only.
- **Net operating balance** = cyber income − recorded business expenses.
- Cash and M-PESA totals use customer collections and are displayed separately. The M-PESA reference is optional and is recorded with the sale.
- Prices that were variable or unclear in the workbook require the cashier to enter the government fee and cyber fee at checkout. The raw supplied price text is retained in the catalogue. Please review and confirm all variable prices before live use.

## Test checklist before using for real transactions

1. Sign in as admin and create a cashier account.
2. Record one fixed-price service paid by Cash and one paid by M-PESA.
3. Record one government-fee service (for example Good Conduct) and confirm government fees are shown separately from cyber income.
4. Record an expense and verify the net operating balance is cyber income less expenses.
5. Download and open a receipt PDF and a daily report PDF.
6. Disconnect internet, record a test sale, close/reopen the app, and confirm the sale remains visible.
7. Reconnect and synchronize. Check that the same transaction appears only once in `POS_Sales`.
8. Repeat from a second computer/location and confirm both locations appear in the central sheet.
9. Create a Google Drive backup and confirm the backup file appears in Drive.
10. Test disabling a cashier account while online and verify the account is rejected on its next online authentication/sync.

## Important account distinction

The email field can be each user's Google account email, and every staff member has a separate MAZE POS login. This package does **not** implement Google OAuth / “Sign in with Google” identity verification. The backend runs under the spreadsheet owner's Apps Script authorization, while the POS controls access using its own user table and password hashes. If you require true Google Sign-In, that is a separate OAuth/Google Cloud Identity integration and should be added before rollout.

## Limitations to resolve before production

- The Apps Script web-app access option and cross-site iframe response must be tested in the actual Google account/organization. Google Workspace administrators may restrict public web-app deployments.
- The PWA must be hosted over HTTPS (or localhost during development); opening `index.html` directly from a file path does not enable service-worker offline caching.
- The current offline report is device-local until that device synchronizes. Global multi-location totals require an internet connection.
- The local browser database is protected by the computer's user profile, not encrypted with a separately managed device key. Use trusted, password-protected computers and do not share browser profiles.
- This package is a first deployable implementation, not a claim of production certification. Complete the test checklist and review user permissions, backup retention, and price catalogue before live financial use.
