module.exports = Contour;
var Side = require('./side');
var Bbox = require('./bbox');


// Contour object, a collection of points forming a closed figure
// Clockwise = filled, counterclockwise = hollow
function Contour(a) {
	this.sides=[]; // no sides
	if (a) {
		var iSide; var nSides;
		if (a instanceof Contour) {
			var sides = a.sides;
			nSides = sides.length;
			for (iSide=0; iSide<nSides; iSide++) {
				this.sides.push(new Side(sides[iSide]));
				}
			if (a.bbox) {
				this.bbox=a.bbox.clone();
				}
			this.area=a.area;
			this.hole=a.hole;
			}
		else if (a instanceof Array) {
			nSides=a.length;
			for (iSide=0; iSide<nSides; iSide++) {
				this.sides.push(new Side(a[iSide]));
				}
			}
		else {
			alert("Contour ctor: Unknown arg 'a'");
			}
		}
	}
Contour.prototype.clone = function() {
	return new Contour(this);
	};
Contour.prototype.addSide = function(side) {
	this.sides.push(new Side(side));
	delete this.bbox;
	delete this.area;
	delete this.hole;
	};
Contour.prototype.getBbox = function() {
	return new Bbox(this.getBboxConst());
	};
Contour.prototype.getBboxConst = function() {
	if (!this.bbox) {
		this.bbox=new Bbox();
		var sides=this.sides;
		var nSides=sides.length;
		for (var iSide=0; iSide<nSides; iSide++) {
			this.bbox.union(sides[iSide].getBboxConst());
			}
		}
	return this.bbox;
	};
Contour.prototype.offset = function(dx,dy) {
	var sides=this.sides;
	var nSides=sides.length;
	for (var iSide=0; iSide<nSides; iSide++) {
		sides[iSide].offset(dx,dy);
		}
	if ( this.bbox ) {
		this.bbox.offset(dx,dy);
		}
	};
Contour.prototype.isHollow = function() {
	// A hole will have a negative surface area as per:
	// http://local.wasp.uwa.edu.au/~pbourke/geometry/polyarea/ by Paul Bourke
	// Since I started this project before I started to care about areas of polygons,
	// and that originally I described my contours with clockwise serie of points, filled
	// contour are currently represented with negative area, while hollow contour are
	// represented with positive area. Something to keep in mind.
	if (this.hole===undefined) {
		this.hole=(this.getArea()>0);
		}
	return this.hole;
	};
Contour.prototype.getArea = function() {
	// http://local.wasp.uwa.edu.au/~pbourke/geometry/polyarea/ by Paul Bourke
	// Quote: "for this technique to work is that the polygon must not be self intersecting"
	// Fine with us, that will never happen (unless there is a bug)
	// Quote: "the holes areas will be of opposite sign to the bounding polygon area"
	// This is great, just by calculating the area, we determine wether the contour
	// is hollow or filled. Moreover, by adding up the areas of all contours describing
	// a polygon, we find whether or not a polygon is mostly hollow or mostly filled,
	// useful to implement display performance enhancement strategies.
	if (this.area===undefined) {
		var area=0;
		var sides=this.sides;
		var nSides=sides.length;
		var side; var ptA; var ptB;
		for (var iSide=0; iSide<nSides; iSide++) {
			side=sides[iSide];
			ptA=side.ptA;
			ptB=side.ptB;
			area+=ptA.x*ptB.y;
			area-=ptA.y*ptB.x;
			}
		this.area=area/2;
		}
	return this.area;
	};
Contour.prototype.rotate = function(angle,x0,y0,cosang,sinang) {
	if (cosang===undefined) {cosang=Math.cos(angle);}
	if (sinang===undefined) {sinang=Math.sin(angle);}
	var sides=this.sides;
	var nSides=sides.length;
	for (var iSide=0; iSide<nSides; iSide++) {
		sides[iSide].rotate(angle,x0,y0,cosang,sinang);
		}
	delete this.bbox; // no longer valid
	};
Contour.prototype.toCanvas = function(ctx) {
	var sides=this.sides;
	var nSides=sides.length;
	if (nSides===0) {return;}
	// begin new canvas path
	var pt=sides[0].ptA;
	ctx.moveTo(pt.x,pt.y);
	// then connect all sides to it
	for (var iSide=0; iSide<nSides; iSide++) {
		sides[iSide].toCanvas(ctx);
		}
	ctx.closePath();
	};
Contour.prototype.draw3dEdge = function(ctx) {
	var sides=this.sides;
	var nSides=sides.length;
	for (var iSide=0; iSide<nSides; iSide++) {
		sides[iSide].draw3dEdge(ctx);
		}
	};
