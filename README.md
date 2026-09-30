# greytHR attendance automation

Automatically signs you into greytHR every weekday at 5 AM IST. Runs on GitHub Actions — nothing to install, no server needed.

## Setup 

1. **Fork or clone this repo** to your own GitHub account.

2. **Add two secrets** at *Settings → Secrets and variables → Actions → New repository secret*:

   | Name | Value |
   |---|---|
   | `GREYTHR_EMP_ID` | your employee ID (e.g. `INT0049`) |
   | `GREYTHR_PASSWORD` | your greytHR password |

3. **Enable Actions** — go to the *Actions* tab and click "I understand my workflows, enable them" if prompted.

4. **Test it** — *Actions* tab → *greytHR sign-in* → *Run workflow*. If the log shows `Result: signed-in`, you're done.

It now fires every Mon–Fri from ~5 AM IST, with two retries in case GitHub's scheduler runs late.

## Get notified on your phone (recommended)

Pick ntfy.sh for the easiest setup. It's a free push-notification service with no account needed.

1. Install the **[ntfy](https://ntfy.sh)** app — [iOS](https://apps.apple.com/app/ntfy/id1625396347) / [Android](https://play.google.com/store/apps/details?id=io.heckel.ntfy).
2. In the app: **+ → Subscribe to topic**. Pick something unguessable, like `yourname-greythr-x7k2m9pq`. Treat it like a password — anyone who knows the topic can send you notifications.
3. Add a GitHub secret named `NTFY_TOPIC` with the same topic string (just the name, no URL).

That's it. After each run you'll get a phone notification:
- ✅ "Your attendance has been marked for today at greytHR"
- 🏖️ "Holiday today — no attendance needed"
- ❌ "Attendance was NOT marked. Tap to view logs" (with a link)

If the `NTFY_TOPIC` secret isn't set, the workflow just skips the notification.

> **Prefer Slack?** You can swap ntfy for a Slack [incoming webhook](https://api.slack.com/messaging/webhooks) — but it requires creating a Slack app, adding it to a channel, and copying the webhook URL. The ntfy setup above is faster.

## Adding holidays or days off

Edit [`holidays.txt`](holidays.txt), add the date, commit, push:

```
2026-12-25  # Christmas
2026-12-31  # OOO — taking the day
```

One date per line, format `YYYY-MM-DD`. The bot skips these. Saturdays and Sundays are skipped automatically.

## Change the time

Edit the cron in [`.github/workflows/attendance.yml`](.github/workflows/attendance.yml). Cron is in UTC — subtract **5h 30m** for IST.

```yaml
- cron: '30 23 * * 0-4'  # 05:00 IST (note: UTC day shifts back)
- cron: '15 0 * * 1-5'   # 05:45 IST (retry)
```

## Update password

*Settings → Secrets → `GREYTHR_PASSWORD` → Update*. No code change needed.

## Why it stopped working before

GitHub **automatically disables scheduled workflows after 60 days with no
repository activity**. The last commit here was 2026-07-03, so the schedule was
switched off around 2026-09-01 and every morning after that silently did
nothing — no run, no failure, no notification.

The workflow now pushes a small `.keepalive` commit whenever the newest commit
is more than 30 days old, which resets that 60-day clock. If it ever does go
quiet again, check **Actions → greytHR sign-in** for an "enable workflow"
banner, or run:

```
gh workflow enable .github/workflows/attendance.yml
```
