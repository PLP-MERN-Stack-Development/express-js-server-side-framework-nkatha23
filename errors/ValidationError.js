const ApiError = require('./ApiError');
module.exports = class ValidationError extends ApiError {
  constructor(msg='Validation Error') { super(msg, 400); }
};
