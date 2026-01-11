const { ErrorCode } = require('./constants');

function ok(data) {
  return { ok: true, data };
}

function fail(code, message, details) {
  return {
    ok: false,
    error: {
      code: code || ErrorCode.INTERNAL_ERROR,
      message: message || 'Internal error',
      details: details || null,
    },
  };
}

module.exports = {
  ok,
  fail,
};
