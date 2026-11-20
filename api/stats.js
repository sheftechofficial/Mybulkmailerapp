const { transport, xOf, gate } = require('./_u');
module.exports = async (req, res) => {
  const a = gate(req, res); if (!a) return;
  try { await transport(a).verify(); } catch (e) { return res.status(401).json({ error: 'Login failed. Sign in again.' }); }
  const U = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const T = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!U) return res.status(500).json({ error: 'Database not connected yet.' });
  const x = xOf(a.user), list = ((req.body || {}).ids || []).slice(0, 200).map(String), cmds = [['SMEMBERS', x + ':unsub']];
  list.forEach(i => cmds.push(['SMEMBERS', x + ':o:' + i], ['GET', x + ':ot:' + i], ['SMEMBERS', x + ':k:' + i], ['GET', x + ':kt:' + i], ['SMEMBERS', x + ':u:' + i]));
  try {
    const r = await fetch(U + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + T }, body: JSON.stringify(cmds) });
    const j = await r.json(), camps = {};
    list.forEach((id, n) => { const b = 1 + n * 5, g = i => j[i].result; camps[id] = { o: g(b) || [], ot: +g(b + 1) || 0, k: g(b + 2) || [], kt: +g(b + 3) || 0, u: g(b + 4) || [] }; });
    res.json({ unsub: j[0].result || [], camps });
  } catch (e) { res.status(500).json({ error: 'Could not read the database' }); }
};
