# greytHR attendance automation

Automatically signs you into greytHR every weekday at 10 AM IST. Runs on GitHub Actions — nothing to install, no server needed.

## Setup

1. **Fork or clone this repo** to your own GitHub account.

2. **Add two secrets** at *Settings → Secrets and variables → Actions → New repository secret*:

   | Name | Value |
   |---|---|
   | `GREYTHR_EMP_ID` | your employee ID (e.g. `INT0049`) |
   | `GREYTHR_PASSWORD` | your greytHR password |

3. **Enable Actions** — go to the *Actions* tab and click "I understand my workflows, enable them" if prompted.

4. **Test it** — *Actions* tab → *greytHR sign-in* → *Run workflow*. If the log shows `Result: signed-in`, you're done.

That's it. It'll fire every Mon–Fri at ~10 AM IST from now on.

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
- cron: '30 4 * * 1-5'   # 10:00 IST
- cron: '30 1 * * 1-5'   # 07:00 IST
```

## Update password

*Settings → Secrets → `GREYTHR_PASSWORD` → Update*. No code change needed.

## Optional: phone notifications via ntfy.sh

Get a push notification on your phone each time the bot runs.

1. Install the **[ntfy](https://ntfy.sh)** app on your phone.
2. In the app, subscribe to a topic — pick something unguessable like `gaurav-greythr-x7k2m9pq` (anyone who knows the topic can send you notifications, so don't use a common word).
3. Add a GitHub secret named `NTFY_TOPIC` with that exact topic name.

If the secret isn't set, the workflow just skips the notification.
