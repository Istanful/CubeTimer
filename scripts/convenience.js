Array.prototype.random = function() {
  return this[Math.round((this.length - 1) * Math.random())];
}
