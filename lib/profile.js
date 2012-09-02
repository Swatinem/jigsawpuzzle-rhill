module.exports = Profile;
var Bezier = require('./bezier');
var Bbox = require('./bbox');


// Profile object
function Profile(a) {
	this.beziers=[];
	if (a) {
		if (a.beziers!==undefined) {
			var beziers=a.beziers;
			var nBeziers=beziers.length;
			for (var iBezier=0; iBezier<nBeziers; iBezier++) {
				this.beziers.push(new Bezier(beziers[iBezier]));
				}
			}
		}
	}
Profile.prototype.getBboxConst = function() {
	if (!this.bbox) {
		var beziers=this.beziers;
		var nBeziers=beziers.length;
		if (nBeziers>0){
			this.bbox=new Bbox();
			this.bbox.set(beziers[0]);
			for (var iBezier=1; iBezier<nBeziers; iBezier++) {
				this.bbox.unionPoints(beziers[iBezier]);
				}
			}
		else {
			this.bbox=new Bbox();
			}
		}
	return this.bbox;
	};
Profile.prototype.getBbox = function() {
	return new Bbox(this.getBboxConst());
	};
Profile.prototype.complement = function() {
	var r=new Profile(this);
	// Just a matter of (normalized profiles required):
	// * vertical flip = sign inversion of Y
	// * horizontal flip = 1024 minus X
	// * for each bezier curve:
	//   * swap control point 1 with control point 2
	//   * the point is taken from the previous curve
	// * reverse order of the beziers in the array
	// This way we end up with a mirror curve which is
	// still drawn from pt A to pt B
	var beziers=r.beziers;
	var nBeziers=beziers.length;
	var bezier;
	var nx; var ny;
	var x=1024; var y=0;
	for (var iBezier=0; iBezier<nBeziers; iBezier++) {
		bezier=beziers[iBezier];
		nx=bezier[4];
		ny=bezier[5];
		bezier[4]=x;
		bezier[5]=y;
		x=1024-bezier[0];
		y=-bezier[1];
		bezier[0]=1024-bezier[2];
		bezier[1]=-bezier[3];
		bezier[2]=x;
		bezier[3]=y;
		x=1024-nx;
		y=-ny;
		}
	beziers.reverse();
	return r;
	};
Profile.prototype.transform = function(ptA,ptB) {
	var r=new Profile();
	var round=self.Math.round;
	// first we need to find the scaling factor, dependent on the length
	// of the line defined by ptA-ptB (normalized profiles are drawn in a
	// 1024x1024px world, origin at (0,0)
	var scale=self.Math.sqrt(self.Math.pow(ptB.x-ptA.x,2)+self.Math.pow(ptB.y-ptA.y,2))/1024;
	// Then we need to find the angle of the line defined by ptA-ptB
	var angle=self.Math.atan2(ptB.y-ptA.y,ptB.x-ptA.x);
	// now transform each point
	var cosang=self.Math.cos(angle);
	var sinang=self.Math.sin(angle);
	var beziers=this.beziers;
	var nBeziers=beziers.length;
	var bezier;
	var cx1; var cy1; var cx2; var cy2; var x; var y;
	for (var iBezier=0; iBezier<nBeziers; iBezier++) {
		bezier=beziers[iBezier];
		x=bezier[0]*scale;
		y=bezier[1]*scale;
		cx1=round(x*cosang-y*sinang);
		cy1=round(x*sinang+y*cosang);
		x=bezier[2]*scale;
		y=bezier[3]*scale;
		cx2=round(x*cosang-y*sinang);
		cy2=round(x*sinang+y*cosang);
		x=bezier[4]*scale;
		y=bezier[5]*scale;
		r.beziers.push([cx1,cy1,cx2,cy2,round(x*cosang-y*sinang),round(x*sinang+y*cosang)]);
		}
	return r;
	};
Profile.prototype.toCanvas = function(ctx,ptA,ptB) {
	// special case: no profile
	if (!this.beziers.length) {
		ctx.lineTo(ptB.x,ptB.y);
		}
	// else apply profile
	else {
		var x0=ptA.x;
		var y0=ptA.y;
		var beziers=this.beziers;
		var nBeziers=beziers.length;
		var bezier;
		for (var iBezier=0; iBezier<nBeziers; iBezier++) {
			bezier=this.beziers[iBezier];
			ctx.bezierCurveTo(x0+bezier[0],y0+bezier[1],x0+bezier[2],y0+bezier[3],x0+bezier[4],y0+bezier[5]);
			}
		}
	};
// Built-in profiles
// Profiles must be built horizontally, along the top edge of a 1024x1024 tile, and must
// extend to the whole edge, expressly starting at the top-left corner (the origin=0,0)
// and ending at the top-right corner (1024,0). In between, all is allowed. I use GIMP,
// create a 1024x1024 canvas, then use the path tool to create a path in between (0,0) and
// (1024,0), and then export the path as an SVG file, and manually convert to JSON as seen
// below.
// Format: each member of the array is an
// array of integer value ordered as follow:
// [cx1,cy1,cx2,cy2,x,y]
Profile.prototype.stock={
	"straight":{
		beziers:[
			[0,0,1024,0,1024,0]
			]
		},
	"classic":{
		beziers:[
			[0,0,448,-224,448,-96],
			[448,-32,384,-32,384,64],
			[384,160,448,192,512,192],
			[576,192,640,160,640,64],
			[640,-32,576,-32,576,-96],
			[576,-224,1024,0,1024,0]
			]
		},
	"wave":{
		beziers:[
			[128,128,192,-96,320,0],
			[352,32,224,96,256,128],
			[448,224,576,-224,768,-128],
			[800,-96,672,-32,704,0],
			[832,96,896,-128,1024,0]
			]
		},
	"tenon":{
		beziers:[
			[0,0,224,0,224,0],
			[224,0,224,192,224,192],
			[224,192,416,192,416,192],
			[416,192,416,0,416,0],
			[416,0,608,0,608,0],
			[608,0,608,192,608,192],
			[608,192,800,192,800,192],
			[800,192,800,0,800,0],
			[800,0,1024,0,1024,0]
			]
		}
	};
