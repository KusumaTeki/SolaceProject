export function notFound(_req, res) {
  res.status(404).json({ error: 'That Solace endpoint was not found.' });
}

export function errorHandler(error, _req, res, _next) {
  if (res.headersSent) return;
  if (error?.type === 'entity.too.large') {
    return res.status(413).json({ error: 'That message is too long. Please shorten it and try again.' });
  }
  if (error?.message === 'Origin is not allowed by CORS') {
    return res.status(403).json({ error: 'This app origin is not allowed by the server.' });
  }
  console.error('Request failed:', error?.name || 'UnknownError');
  res.status(500).json({ error: 'Something went wrong on the Solace server. Please try again.' });
}
