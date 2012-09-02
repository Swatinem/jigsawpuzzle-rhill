module.exports = Bbox;
var Point = require('./point');


// Bounding box object
function Bbox(a,b,c,d) {
	// a=x1,b=y1,c=x2,d=y2
	if (d!==undefined) {
		this.tl=new Point({x:a,y:b});
		this.br=new Point({x:c,y:d});
		}
	// a=Point or {x:?,y:?},b=Point or {x:?,y:?}
	else if (b!==undefined) {
		var mn=Math.min;
		var mx=Math.max;
		this.tl=new Point({x:mn(a.x,b.x),y:mn(a.y,b.y)});
		this.br=new Point({x:mx(a.x,b.x),y:mx(a.y,b.y)});
		}
	// a=Bbox or {tl:{x:?,y:?},br:{x:?,y:?}}
	else if (a) {
		this.tl=new Point(a.tl);
		this.br=new Point(a.br);
		}
	// empty
	else {
		this.tl=new Point();
		this.br=new Point();
		}
	}
Bbox.prototype.toString = function() {
	return "{tl:"+this.tl+",br:"+this.br+"}";
	};
Bbox.prototype.clone = function() {
	return new Bbox(this);
	};
Bbox.prototype.getTopleft = function() {
	return new Point(this.tl);
	};
Bbox.prototype.getBottomright = function() {
	return new Point(this.br);
	};
Bbox.prototype.unionPoint = function(p) {
	var mn=Math.min;
	var mx=Math.max;
	this.tl.x=mn(this.tl.x,p.x);
	this.tl.y=mn(this.tl.y,p.y);
	this.br.x=mx(this.br.x,p.x);
	this.br.y=mx(this.br.y,p.y);
	};
Bbox.prototype.unionPoints = function(a) {
	// assume array of values
	if (a instanceof Array) {
		var mx=self.Math.max;
		var mn=self.Math.min;
		var x; var y;
		for (var i=0; i<a.length; i+=2) {
			x=a[i]; y=a[i+1];
			this.tl.x=mn(this.tl.x,x);
			this.tl.y=mn(this.tl.y,y);
			this.br.x=mx(this.br.x,x);
			this.br.y=mx(this.br.y,y);
			}
		}
	};
Bbox.prototype.width = function() {
	return this.br.x-this.tl.x;
	};
Bbox.prototype.height = function() {
	return this.br.y-this.tl.y;
	};
Bbox.prototype.offset = function(dx,dy) {
	this.tl.offset(dx,dy);
	this.br.offset(dx,dy);
	};
Bbox.prototype.set = function(a) {
	if (a) {
		if (a instanceof Array) {
			// array of Points
			if (a.length>0) {
				var mx=self.Math.max;
				var mn=self.Math.min;
				var i;
				if (a[0].x!==undefined) {
					this.tl.x=this.br.x=a[0].x;
					this.tl.y=this.br.y=a[0].y;
					var p;
					for (i=1; i<a.length; i++) {
						p=a[i];
						this.tl.x=mn(this.tl.x,p.x);
						this.tl.y=mn(this.tl.y,p.y);
						this.br.x=mx(this.br.x,p.x);
						this.br.y=mx(this.br.y,p.y);
						}
					}
				// assume array of values
				else {
					var x; var y;
					for (i=0; i<a.length; i+=2) {
						x=a[i]; y=a[i+1];
						this.tl.x=mn(this.tl.x,x);
						this.tl.y=mn(this.tl.y,y);
						this.br.x=mx(this.br.x,x);
						this.br.y=mx(this.br.y,y);
						}
					}
				}
			}
		}
	};
Bbox.prototype.pointIn = function(p) {
	return p.x>this.tl.x && p.x<this.br.x && p.y>this.tl.y && p.y<this.br.y;
	};
Bbox.prototype.doesIntersect = function(bb) {
	var mn=self.Math.min;
	var mx=self.Math.max;
	return (mn(bb.br.x,this.br.x)-mx(bb.tl.x,this.tl.x))>0 && (mn(bb.br.y,this.br.y)-mx(bb.tl.y,this.tl.y))>0;
	};
Bbox.prototype.union = function(other) {
	// this bbox is empty
	if (this.isEmpty()) {
		this.tl=new Point(other.tl);
		this.br=new Point(other.br);
		}
	// union only if other bbox is not empty
	else if (!other.isEmpty()) {
		var mn=self.Math.min;
		var mx=self.Math.max;
		this.tl.x=mn(this.tl.x,other.tl.x);
		this.tl.y=mn(this.tl.y,other.tl.y);
		this.br.x=mx(this.br.x,other.br.x);
		this.br.y=mx(this.br.y,other.br.y);
		}
	return this;
	};
Bbox.prototype.inflate = function(a) {
	this.tl.x-=a;
	this.tl.y-=a;
	this.br.x+=a;
	this.br.y+=a;
	};
Bbox.prototype.isEmpty = function() {
	return this.width()<=0 || this.height()<=0;
	};
Bbox.prototype.toCanvasPath = function(ctx) {
	ctx.rect(this.tl.x,this.tl.y,this.width(),this.height());
	};
