'use strict';

function QCError(code, message) {
  this.name = 'Error';
  this.code = code;
  this.message = message || 'Default Message';
  this.stack = (new Error()).stack;
}
QCError.prototype = Object.create(Error.prototype);
QCError.prototype.constructor = QCError;

module.exports = QCError;
