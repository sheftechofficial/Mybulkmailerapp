const nodemailer = require('nodemailer');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const { password, emails, ping } = req.body || {};
  if (!process.env.APP_PASSWORD || password !== process.env.APP_PASSWORD)
    return res.status(401).json({ error: 'Wrong password' });
  if (ping) return res.json({ ok: true });
  if (!Array.isArray(emails) || !emails.length || emails.length > 5)
    return res.status(400).json({ error: 'Send 1 to 5 emails per call' });
  const port = Number(process.env.SMTP_PORT || 465);
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com', port, secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  const from = `"${process.env.FROM_NAME || 'Sheftechofficial'}" <${process.env.SMTP_USER}>`;
  const results = [];
  for (const m of emails) {
    try {
      await t.sendMail({
        from, to: m.to, subject: m.subject, text: m.text, html: m.html,
        replyTo: process.env.REPLY_TO || process.env.SMTP_USER,
        headers: { 'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>${m.unsub ? ', <' + m.unsub + '>' : ''}`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
      });
      results.push({ to: m.to, ok: true });
    } catch (e) { results.push({ to: m.to, ok: false, error: e.message, code: String(e.responseCode || '') }); }
  }
  res.json({ results });
};
