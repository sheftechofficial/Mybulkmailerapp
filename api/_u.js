const nodemailer = require('nodemailer'), crypto = require('crypto');
const HOSTS = { gmail: ['smtp.gmail.com', 465], outlook: ['smtp-mail.outlook.com', 587], yahoo: ['smtp.mail.yahoo.com', 465], zoho: ['smtp.zoho.com', 465] };
exports.transport = a => {
  const [host, port] = HOSTS[a.p] || HOSTS.gmail;
  return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user: a.user, pass: String(a.pass).replace(/\s/g, '') } });
};
exports.xOf = u => crypto.createHash('sha256').update(String(u).toLowerCase()).digest('hex').slice(0, 16);
exports.gate = (req, res) => {
  const a = (req.body || {}).auth;
  if (process.env.APP_PASSWORD && (!a || a.code !== process.env.APP_PASSWORD)) { res.status(401).json({ error: 'Wrong access code' }); return null; }
  if (!a || !a.user || !a.pass || !/^\S+@\S+\.\S+$/.test(a.user)) { res.status(400).json({ error: 'Enter your email and App Password' }); return null; }
  return a;
};
