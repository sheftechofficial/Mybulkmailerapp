SHEFBUILKMAILER - SETUP
Vercel > Project > Settings > Environment Variables (add all, then Redeploy):
APP_PASSWORD = your dashboard password
SMTP_USER    = Gmail address that sends the emails
SMTP_PASS    = Gmail App Password (16 characters, needs 2-Step Verification on)
FROM_NAME    = Sheftechofficial
REPORTS (opens, clicks, unsubscribes): in Vercel open Storage, create/connect Upstash Redis (free) to this project, then Redeploy.
