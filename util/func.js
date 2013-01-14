Number.prototype.format = function () {
  var str = this.toString();
  var Re = /[^0-9]/g;
  var ReN = /(-?[0-9]+)([0-9]{3})/;
  str = str.replace(Re,'');              
  while (ReN.test(str)) { 
    str = str.replace(ReN, "$1,$2"); 
  }
  return str;
};

Date.prototype.hstr = function (format) {
	var m = this.getMonth()+1;
	var d = this.getDate();
	var h = this.getHours();
	var min = this.getMinutes();
	var s = this.getSeconds();
	return format.
			replace('Y', this.getFullYear()).
			replace('m', m.toString().length === 1 ? '0'+ m : m).
			replace('n', m).
			replace('d', d.toString().length === 1 ? '0'+ d : d).
			replace('j', d).
			replace('j', this.getDate()).
			replace('H', h.toString().length === 1 ? '0'+ h : h).
			replace('h', h).
			replace('i', min.toString().length === 1 ? '0'+ min : min).
			replace('s', s.toString().length === 1 ? '0'+ s : s);
};
