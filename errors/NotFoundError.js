const ApiError = require('./ApiError');
module.exports = class NotFoundError extends ApiError {
  constructor(msg='Not Found') { super(msg, 404); }
};
