const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
const dec = s => Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
async function rd(cmds) {
  const U = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const T = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!U) return;
  try { await fetch(U + '/pipeline', { method: 'POST', headers: { Authorization: 'Bearer ' + T }, body: JSON.stringify(cmds) }); } catch (e) {}
}
module.exports = async (req, res) => {
  const q = req.query || {}, a = q.a, c = String(q.c || '').slice(0, 40);
  const x = /^[a-f0-9]{16}$/.test(String(q.x || '')) ? q.x : '';
  let e = ''; try { e = dec(String(q.e || '')); } catch (x) {}
  if (a === 'o') {
    if (e && x) await rd([['SADD', x + ':o:' + c, e], ['INCR', x + ':ot:' + c]]);
    res.setHeader('Content-Type', 'image/gif'); res.setHeader('Cache-Control', 'no-store, max-age=0');
    return res.end(gif);
  }
  if (a === 'c') {
    let u = ''; try { u = dec(String(q.u || '')); } catch (x) {}
    if (!/^https?:\/\//i.test(u)) return res.status(400).end('Bad link');
    if (e && x) await rd([['SADD', x + ':k:' + c, e], ['INCR', x + ':kt:' + c]]);
    res.writeHead(302, { Location: u }); return res.end();
  }
  if (a === 'u') {
    if (e && x) await rd([['SADD', x + ':u:' + c, e], ['SADD', x + ':unsub', e]]);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.end('<!doctype html><meta name=viewport content="width=device-width,initial-scale=1"><body style="font-family:Arial;text-align:center;padding:60px"><h2>You are unsubscribed</h2><p>You will not receive more emails from us.</p>');
  }
  res.status(404).end();
};
