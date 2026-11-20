module.exports = async (req, res) => {
  const { password, ids } = req.body || {};
  if (!process.env.APP_PASSWORD || password !== process.env.APP_PASSWORD) return res.status(401).json({ error: 'Wrong password' });
  const U = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const T = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!U) return res.status(500).json({ error: 'Database not connected yet. In Vercel, open Storage and connect Upstash Redis, then redeploy.' });
  const list = (ids || []).slice(0, 200), cmds = [['SMEMBERS', 'unsub']];
  list.forEach(i => cmds.push(['SMEMBERS', 'o:' + i], ['GET', 'ot:' + i], ['SMEMBERS', 'k:' + i], ['GET', 'kt:' + i], ['SMEMBERS', 'u:' + i]));
  try {
    const r = await fetch(U + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + T }, body: JSON.stringify(cmds) });
    const j = await r.json(), camps = {};
    list.forEach((id, n) => { const b = 1 + n * 5, g = x => j[x].result; camps[id] = { o: g(b) || [], ot: +g(b + 1) || 0, k: g(b + 2) || [], kt: +g(b + 3) || 0, u: g(b + 4) || [] }; });
    res.json({ unsub: j[0].result || [], camps });
  } catch (e) { res.status(500).json({ error: 'Could not read the database' }); }
};
