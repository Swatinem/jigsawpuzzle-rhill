module.exports = Point;


// Point object
function Point(a,b,c) {
	// a=x,b=y, c=id
	if (b!==undefined) {
		this.x=a;
		this.y=b;
		this.id=(c!==undefined)?c:0;
		}
	// a=Point or {x:?,y:?,id:?}
	else if (a && a.x!==undefined) {
		this.x=a.x;
		this.y=a.y;
		this.id=(a.id!==undefined)?a.id:0;		
		}
	// empty
	else {
		this.x=this.y=this.id=0;
		}
	}
Point.prototype.toString = function() {
	return "{x:"+this.x+",y:"+this.y+",id:"+this.id+"}";
	};
Point.prototype.toHashkey = function() {
	// We could use toString(), but I am concerned with
	// the performance of Polygon.merge(). As for now
	// I have no idea if its really that much of an
	// improvement, but I figure the shorter the string
	// used as a hash key, the better. This also reduce
	// the number of concatenations from 6 to 2. Ultimately,
	// I could cache the hash key..
	return this.x+"_"+this.y;
	};
Point.prototype.clone = function() {
	return new Point(this);
	};
Point.prototype.offset = function(dx,dy) {
	this.x+=dx; this.y+=dy;
	};
Point.prototype.set = function(a) {
	this.x=a.x;
	this.y=a.y;
	this.id=(a.id!==undefined)?a.id:0;
	};
Point.prototype.compare = function(other,strict) {
	return this.x==other.x && this.y==other.y && (!strict || this.id==other.id);
	};
