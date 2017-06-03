Array.prototype.random = function() {
  return this[Math.round((this.length - 1) * Math.random())];
}

Array.prototype.last = function() {
  return this[this.length - 1];
}

Date.prototype.format = function() {
  return this.getDate() + "/" + this.getDay() + "/" + this.getFullYear();
}
