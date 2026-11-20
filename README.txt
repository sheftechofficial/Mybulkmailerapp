MYBULKMAILERAPP
Each person signs in on the app with their own email and App Password. No SMTP variables are needed in Vercel.
Optional Vercel variable: APP_PASSWORD = an access code. Set it to limit who can use the app, delete it to let anyone use it.
Reports need Upstash Redis connected in Vercel Storage (prefix KV), then Redeploy.
