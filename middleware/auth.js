module.exports = (req, res, next) => {
  const key = req.header('x-api-key');
  const expected = process.env.API_KEY || 'supersecretapikey';
  if (!key || key !== expected) return res.status(401).json({ error: 'Unauthorized: invalid API key' });
  next();
};
