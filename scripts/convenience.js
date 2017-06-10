Array.prototype.random = function() {
  return this[Math.round((this.length - 1) * Math.random())];
}

Array.prototype.randomNot = function(value) {
  let newValue;
  while ((newValue = this.random()) == value) {}
  return newValue;
}
Array.prototype.last = function() {
  return this[this.length - 1];
}

Array.prototype.min = function(property) {
  if (this.length == 0) { return -1; }
  let min = this[0];
  for (let i = 0; i < this.length; i++) {
    if ((this[i][property] || this[i]) < (min[property] || min))
      min = this[i]
  }
  return min[property] || min;
}

Array.prototype.max = function(property) {
  if (this.length == 0) { return -1; }
  let max = this[0];
  for (let i = 0; i < this.length; i++) {
    if ((this[i][property] || this[i]) > (max[property] || max))
      max = this[i];
  }
  return max[property] || max;
}

Array.prototype.sum = function(property) {
  if (this.length == 0) { return 0; }
  let sum = 0;
  for (let i = 0; i < this.length; i++)
    sum += this[i][property] || this[i];
  return sum;
}

Array.prototype.range = function(start, end) {
  let collection = [];
  for (let i = start; i < end; i++)
    collection.push(this[i]);
  return collection;
}

Array.prototype.average = function(property) {
  return this.sum(property) / this.length;
}

Array.prototype.jsonUniqueMerge = function(second) {
  let all = this.concat(second);
  for (let a = 0; a < all.length; a++) {
    let el = JSON.stringify(all[a]);
    for (let b = a + 1; b < all.length; b++) {
      if (JSON.stringify(all[b]) == el)
        all.splice(b, 1);
    }
  }
  return all;
}

Array.prototype.sortBy = function(property) {
  return this.sort(function(a, b) {
    if (a[property] < b[property])
      return -1;
    else if (a[property] > b[property])
      return 1;
    return 0;
  });
}

Date.prototype.format = function() {
  return this.getDate() + "/" + this.getDay() + "/" + this.getFullYear();
}

Number.prototype.formatTime = function() {
  return formatTime(this);
}

function randomRange(a, b) {
  return Math.round(a + (Math.random() * (b - a)))
}

String.prototype.break = function() {
  return this.replace(/\n/g, "<br />");
}
