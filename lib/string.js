// Move this into another file then require it.
String.prototype.insert = function (index, string) {
  if (index > 0) {
    return this.substring(0, index) + string + this.substring(index, this.length);
  } else {
    return string + this;
  }
};

String.prototype.insertCharAtIndeces = function(char, indices) {
  var that = this;
  indices.forEach(function(value) {
    that = that.insert(value, char); 
  });  
  return that;
};
