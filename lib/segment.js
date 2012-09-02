module.exports = Segment;
var Point = require('./point');


// Segment object
function Segment(a,b) {
	this.ptA = new Point(a);
	this.ptB = new Point(b);
	}
Segment.prototype.toString = function() {
	return "["+this.ptA+","+this.ptB+"]";
	};
Segment.prototype.compare = function(other) {
	return (this.ptA.compare(other.ptA) && this.ptB.compare(other.ptB)) || (this.ptA.compare(other.ptB) && this.ptB.compare(other.ptA));
	};
