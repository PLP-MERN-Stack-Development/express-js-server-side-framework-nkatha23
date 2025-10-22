const ValidationError = require('../errors/ValidationError');

module.exports = (req, res, next) => {
  const { method, body } = req;
  if (method === 'POST') {
    const errs = [];
    if (!body.name || typeof body.name !== 'string') errs.push('name required (string)');
    if (body.price === undefined || typeof body.price !== 'number') errs.push('price required (number)');
    if (errs.length) return next(new ValidationError(errs.join('; ')));
  }
  if (method === 'PUT') {
    const errs = [];
    if (body.name !== undefined && typeof body.name !== 'string') errs.push('name must be string');
    if (body.price !== undefined && typeof body.price !== 'number') errs.push('price must be number');
    if (errs.length) return next(new ValidationError(errs.join('; ')));
  }
  next();
};
