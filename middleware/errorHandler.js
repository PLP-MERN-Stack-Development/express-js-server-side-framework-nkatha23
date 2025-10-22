const ApiError = require('../errors/ApiError');

module.exports = (err, req, res, next) => {
  console.error(err);
  if (err instanceof ApiError) return res.status(err.statusCode).json({ error: err.message });
  if (err.name === 'ValidationError') return res.status(400).json({ error: err.message });
  if (err.code === 11000) return res.status(409).json({ error: 'Duplicate key error' });
  res.status(500).json({ error: 'Internal Server Error' });
};
