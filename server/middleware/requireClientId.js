import { createHash } from 'node:crypto';

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function requireClientId(req, res, next) {
  const clientId = req.get('x-client-id');
  if (!clientId || !UUID_V4.test(clientId)) {
    return res.status(400).json({ error: 'A valid app installation ID is required.' });
  }
  req.clientHash = createHash('sha256').update(clientId).digest('hex');
  next();
}
