const { transport, xOf, gate } = require('./_u');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const a = gate(req, res); if (!a) return;
  const t = transport(a), { emails, ping } = req.body;
  if (ping) {
    try { await t.verify(); return res.json({ ok: true, x: xOf(a.user) }); }
    catch (e) { return res.status(401).json({ error: 'Login failed. Check your email and App Password.' }); }
  }
  if (!Array.isArray(emails) || !emails.length || emails.length > 5) return res.status(400).json({ error: 'Send 1 to 5 emails per call' });
  const from = `"${String(a.name || a.user).replace(/["<>]/g, '')}" <${a.user}>`, results = [];
  for (const m of emails) {
    try {
      await t.sendMail({
        from, to: m.to, subject: m.subject, text: m.text, html: m.html, replyTo: a.user,
        headers: { 'List-Unsubscribe': `<mailto:${a.user}?subject=unsubscribe>${m.unsub ? ', <' + m.unsub + '>' : ''}`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' }
      });
      results.push({ to: m.to, ok: true });
    } catch (e) { results.push({ to: m.to, ok: false, error: e.message, code: String(e.responseCode || '') }); }
  }
  res.json({ results });
};
