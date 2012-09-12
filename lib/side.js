module.exports = Side;
var Point = require('./point');
var Profile = require('./profile');
var Bbox = require('./bbox');


// Side object
function Side(a) {
	if (a) {
		if (a.ptA!==undefined && a.ptB!==undefined) {
			this.ptA=new Point(a.ptA);
			this.ptB=new Point(a.ptB);
			}
		this.profileNormalized=(a.profileNormalized!==undefined)?a.profileNormalized:new Profile(Profile.prototype.straight);
		}
	}
Side.prototype.clone = function() {
	return new Side(this);
	};
Side.prototype.complement = function() {
	var side=new Side();
	side.ptB=new Point(this.ptA);
	side.ptA=new Point(this.ptB);
	side.profileNormalized=this.profileNormalized.complement();
	return side;
	};
Side.prototype.startPointConst = function() {
	return this.ptA;
	};
Side.prototype.endPointConst = function() {
	return this.ptB;
	};
Side.prototype.offset = function(dx,dy) {
	this.ptA.offset(dx,dy);
	this.ptB.offset(dx,dy);
	if (this.bbox) {
		this.bbox.offset(dx,dy);
		}
	};
Side.prototype.sync = function() {
	if (!this.profile) {
		this.profile=this.profileNormalized.transform(this.ptA,this.ptB);
		}
	};
Side.prototype.getBboxConst = function() {
	if (!this.bbox) {
		if (!this.profile) {this.sync();}
		this.bbox=this.profile.getBbox();
		this.bbox.offset(this.ptA.x,this.ptA.y);
		// a side is always at least one pixel wide or high due to
		// profile which in the simplest case is a single 1-pixel-thick line
		if (this.bbox.width()===0) {
			// cases: |  ^
			//        V  |
			if (this.ptA.y<this.ptB.y) {
				this.bbox.tl.x--;
				}
			else {
				this.bbox.br.x++;
				}
			}
		else if (this.bbox.height()===0) {
			// cases: -->  <--
			if (this.ptA.x<this.ptB.x) {
				this.bbox.br.y++;
				}
			else {
				this.bbox.tl.y--;
				}
			}
		}
	return this.bbox;
	};
Side.prototype.getBbox = function() {
	return new Bbox(this.getBboxConst());
	};
Side.prototype.rotate = function(angle,x0,y0,cosang,sinang) {
	if (cosang===undefined) {cosang=Math.cos(angle);}
	if (sinang===undefined) {sinang=Math.sin(angle);}
	var round=Math.round;
	var x=this.ptA.x-x0;
	var y=this.ptA.y-y0;
	this.ptA.x=round(x*cosang-y*sinang)+x0;
	this.ptA.y=round(x*sinang+y*cosang)+y0;
	x=this.ptB.x-x0;
	y=this.ptB.y-y0;
	this.ptB.x=round(x*cosang-y*sinang)+x0;
	this.ptB.y=round(x*sinang+y*cosang)+y0;
	// invalidate cached vars
	delete this.profile;
	delete this.bbox;
	};
Side.prototype.toCanvas = function(ctx) {
	if (!this.profile) {this.sync();}
	this.profile.toCanvas(ctx,this.ptA,this.ptB);
	};
Side.prototype.draw3dEdge = function(ctx) {
	if (!this.profile) {this.sync();}
	// Draw each bezier segment making up the profile, with a color which
	// depends of the slope of the bezier segment.
	// for a 3d effect. This is of course an approximation, as I don't
	// control the drawing of the bezier curve itself.
	// At this point, it is assumed that the caller has set line style/alpha.
	var abs=Math.abs;
	var rnd=Math.round;
	var atan=Math.atan2;
	var beziers=this.profile.beziers;
	var nBeziers=beziers.length;
	var ptA=this.ptA;
	var x0=ptA.x;
	var y0=ptA.y;
	var xa=0; var ya=0; var xb; var yb;
	var bezier; var dx; var dy; var g;
	for (var iBezier=0; iBezier<nBeziers; iBezier++) {
		bezier=beziers[iBezier];
		// we rotate the segment backward 45 deg, this allow the light
		// source to be located top-left otherwise it would be located
		// left
		// we precalculate as much as we can for performance
		// cos(-PI/4)=0.70710678 and sin(-PI/4)=-0.70710678
		// dx,dy represent the rotated slope parameters as per
		// m = (y2-y1)/(x2-x1)
		// sin(PI/4) = cos(PI/4) = 0.70710678118654752440084436210485
		// 255/PI = 81.169020976866621242130719319982
		xb=bezier[4];
		yb=bezier[5];
		dx=(xb-xa)*0.70710678;
		dy=(yb-ya)*0.70710678;
		g=abs(rnd(atan(dx+dy,dy-dx)*81.16902098));
		g=(g<16)?"0"+g.toString(16):g.toString(16);
		ctx.strokeStyle="#"+g+g+g;
		ctx.beginPath();
		ctx.moveTo(x0+xa,y0+ya);
		ctx.bezierCurveTo(x0+bezier[0],y0+bezier[1],x0+bezier[2],y0+bezier[3],x0+xb,y0+yb);
		ctx.stroke();
		xa=xb; ya=yb;
		}
	};
