# greytHR attendance automation

Headless Playwright bot that signs into [Branch greytHR](https://branchinternational.greythr.com/) every weekday morning. Runs on GitHub Actions — no servers, no Mac uptime required.

## How it works

A cron-scheduled workflow fires at **~10:00 AM IST Mon–Fri**, runs [`attendance.js`](attendance.js), which:

1. Checks the current IST date — bails on Saturday/Sunday.
2. Checks [`holidays.txt`](holidays.txt) — bails on listed public holidays.
3. Launches headless Chromium, logs into greytHR with credentials from secrets.
4. Clicks **Sign In** on the attendance card. If already signed in, exits cleanly.

## Setup

### 1. Add repository secrets

Settings → Secrets and variables → Actions → **New repository secret**:

| Name | Value |
|---|---|
| `GREYTHR_EMP_ID` | your greytHR employee ID (e.g. `INT0049`) |
| `GREYTHR_PASSWORD` | your greytHR password |

### 2. Confirm Actions is enabled

Settings → Actions → General → **Allow all actions and reusable workflows**.

### 3. Verify with a manual run

Actions tab → **greytHR sign-in** → **Run workflow**. Look for `Result: signed-in` in the log.

After that, the scheduled cron takes over.

## Configuration

### Change the time

Edit the cron in [`.github/workflows/attendance.yml`](.github/workflows/attendance.yml). The cron is in **UTC**; subtract 5h 30m for IST.

```yaml
- cron: '30 4 * * 1-5'   # 04:30 UTC = 10:00 IST Mon–Fri
```

GitHub cron can drift 5–15 min during peak load.

### Add / update holidays

Edit [`holidays.txt`](holidays.txt). One `YYYY-MM-DD` per line, optional `# comment`. Weekends are skipped automatically — no need to list Sat/Sun holidays.

```
2026-12-25  # Christmas
2027-01-01  # New Year
```

### Rotate password

Settings → Secrets → `GREYTHR_PASSWORD` → **Update**. No code change needed.

## Running locally

```bash
npm install
npx playwright install chromium
GREYTHR_EMP_ID='INTxxxx' GREYTHR_PASSWORD='...' node attendance.js
```

On a local run, a `result.png` (or `error.png`) screenshot is written for debugging. These are gitignored and never uploaded to Actions.

## Troubleshooting

- **Login fails** — verify the secrets match exactly. greytHR sometimes requires a password reset after long periods; if so, update the secret.
- **"Sign In" button not found** — greytHR may have changed their DOM. Run locally with `headless: false` in [`attendance.js`](attendance.js) and inspect.
- **Schedule didn't fire** — GitHub disables scheduled workflows after 60 days of repo inactivity. Push any commit to re-enable. Also check Actions tab → workflow → it must not be disabled.
- **Cron drift** — GitHub free-tier cron isn't precise; expect 5–15 min lag at 10 AM. If you need it tight, add a second cron entry (e.g. `35 4 * * 1-5`) — the script no-ops if already signed in.

## Maintenance

- **Yearly:** add next year's holidays to `holidays.txt`.
- **If greytHR changes their login/dashboard UI:** update selectors in [`attendance.js`](attendance.js).
