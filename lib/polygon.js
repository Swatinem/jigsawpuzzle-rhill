module.exports = Polygon;
var Contour = require('./contour');
var Point = require('./point');
var Bbox = require('./bbox');
var Side = require('./side');


// Polygon object, a collection of Contour objects
function Polygon(a) {
	this.contours=[]; // no contour
	if (a) {
		if (a instanceof Polygon) {
			var contours = a.contours;
			var nContours = contours.length;
			for ( var iContour=0; iContour<nContours; iContour++ ) {
				this.contours.push(new Contour(contours[iContour]));
				}
			if ( this.bbox ) {
				this.bbox = a.bbox.clone();
				}
			this.area = a.area;
			if ( this.centroid ) {
				this.centroid = a.centroid.clone();
				}
			this.mostlyHollow = a.mostlyHollow;
			}
		else if (a instanceof Array) {
			this.contours.push(new Contour(a));
			}
		else {
			alert("Polygon ctor: Unknown arg 'a'");
			}
		}
	}
Polygon.prototype.clone = function() {
	return new Polygon(this);
	};
Polygon.prototype.getBbox = function() {
	if (!this.bbox) {
		this.bbox=new Bbox();
		var contours=this.contours;
		var nContours=contours.length;
		for (var iContour=0; iContour<nContours; iContour++) {
			this.bbox.union(contours[iContour].getBboxConst());
			}
		}
	return this.bbox.clone();
	};
Polygon.prototype.getArea = function() {
	// We addup the area of all our contours.
	// Contours representing holes will have a negative area.
	if (!this.area) {
		var area=0;
		var contours=this.contours;
		var nContours=contours.length;
		for (var iContour=0; iContour<nContours; iContour++) {
			area+=contours[iContour].getArea();
			}
		this.area=area;
		}
	return this.area;
	};
Polygon.prototype.getCentroid = function() {
	if (!this.centroid) {
		var contours=this.contours;
		var nContours=contours.length;
		var sides; var nSides;
		var x=0; var y=0;
		var iSide; var side; var ptA; var ptB; var f;
		for (var iContour=0; iContour<nContours; iContour++) {
			sides=contours[iContour].sides;
			nSides=sides.length;
			// http://local.wasp.uwa.edu.au/~pbourke/geometry/polyarea/ by Paul Bourke
			for (iSide=0; iSide<nSides; iSide++) {
				side=sides[iSide];
				ptA=side.ptA;
				ptB=side.ptB;
				f=ptA.x*ptB.y-ptB.x*ptA.y;
				x+=(ptA.x+ptB.x)*f;
				y+=(ptA.y+ptB.y)*f;
				}
			}
		f=this.getArea()*6;
		// centroid relative to self bbox
		var origin=this.getBbox().getTopleft();
		var rnd=Math.round;
		this.centroid=new Point({x:rnd(x/f-origin.x),y:rnd(y/f-origin.y)});
		}
	return this.centroid.clone();
	};
Polygon.prototype.pointIn = function(p) {
	alert("Polygon.prototype.pointIn: No longer supported");
	};
Polygon.prototype.offset = function(dx,dy) {
	var contours=this.contours;
	var nContours=contours.length;
	for (var iContour=0; iContour<nContours; iContour++) {
		contours[iContour].offset(dx,dy);
		}
	if (this.bbox) {
		this.bbox.offset(dx,dy);		
		}
	if (this.centroid) {
		this.centroid.offset(dx,dy);		
		}
	};
Polygon.prototype.moveto = function(x,y) {
	// position is centroid
	var centroid=this.getCentroid();
	var tl=this.getBbox().getTopLeft();
	this.offset(x-tl.x-centroid.x,y-tl.y-centroid.y);
	};
Polygon.prototype.rotate = function(angle,x0,y0) {
	var cosang=Math.cos(angle);
	var sinang=Math.sin(angle);
	var contours=this.contours;
	var nContours=contours.length;
	for (var iContour=0; iContour<nContours; iContour++) {
		contours[iContour].rotate(angle,x0,y0,cosang,sinang);
		}
	delete this.bbox; // no longer valid
	delete this.centroid; // no longer valid (since it's relative to self bbox
	};
Polygon.prototype.doesIntersect = function(bbox) {
	return this.getBbox().doesIntersect(bbox);
	};
Polygon.prototype.isMostlyHollow = function() {
	if (this.mostlyHollow===undefined) {
		// we add up all solid and hollow contours and
		// compare the result to determine whether this
		// polygon is mostly solid or hollow
		var areaSolid=0;
		var areaHollow=0;
		var contours=this.contours;
		var nContours=contours.length;
		var area;
		for (var iContour=0; iContour<nContours; iContour++) {
			area=contours[iContour].getArea();
			if (area < 0) {
				areaSolid+=area;
				}
			else {
				areaHollow+=area;
				}
			}
		this.mostlyHollow=(areaHollow>areaSolid);
		}
	return this.mostlyHollow;
	};
Polygon.prototype.getSides = function() {
	var r=[];
	var contours=this.contours;
	var nContours=contours.length;
	var contour; var sides; var nSides; var iSide;
	for (var iContour=0; iContour<nContours; iContour++) {
		contour=contours[iContour];
		sides=contour.sides;
		nSides=sides.length;
		for (iSide=0; iSide<nSides; iSide++) {
			r.push(new Side(sides[iSide]));
			}
		}
	return r;
	};
Polygon.prototype.getSidesConst = function() {
	var r=[];
	var contours=this.contours;
	var nContours=contours.length;
	var contour; var sides; var nSides; var iSide;
	for (var iContour=0; iContour<nContours; iContour++) {
		contour=contours[iContour];
		sides=contour.sides;
		nSides=sides.length;
		for (iSide=0; iSide<nSides; iSide++) {
			r.push(sides[iSide]);
			}
		}
	return r;
	};
Polygon.prototype.merge = function(others) {
	// Simply put, this algorithm XOR each side of
	// a polygon with each side of other polygons.
	// This means we delete any side which appear an
	// even number of time. Whatever sides are left in the
	// collection are connected together to form one or more
	// contour.
	// Of course, this works because we know we are working
	// with polygons which are perfectly adjacent and never
	// overlapping.
	// A nice side-effect of the current algorithm is that
	// we do not need to know expressly which contours are full
	// and which are holes: The contours created will automatically
	// have a clockwise/counterclockwise direction such that they
	// fits exactly the non-zero winding number rule used by the
	// <canvas> element, thus suitable to be used as is for
	// clipping and complex polygon filling.
	// TODO: write an article to illustrate exactly how this work.
	// TODO: handle special cases here (ex. empty polygon, etc)

	// A Javascript object can be used as an associative array, but
	// they are not real associative array, as there is no way
	// to query the number of entries in the object. For this
	// reason, we maintain an element counter ourself.
	var pool={};
	var contours=this.contours;
	var nContours=contours.length;
	var sides; var nSides; var iSide; var side;
	var idA; var idB;
	for (var iContour=0; iContour<nContours; iContour++) {
		sides=contours[iContour].sides;
		nSides=sides.length;
		for (iSide=0; iSide<nSides; iSide++) {
			side=sides[iSide];
			idA=side.ptA.toHashkey();
			idB=side.ptB.toHashkey();
			if (!pool[idA]) {
				pool[idA]={n:1,sides:{}};
				}
			else {
				pool[idA].n++;
				}
			pool[idA].sides[idB]=side;
			}
		}
	// enumerate sides in other's contours, eliminate duplicate
	var nPolygons=others.length;
	for (var iPolygon=0; iPolygon<nPolygons; iPolygon++) {
		contours=others[iPolygon].contours;
		nContours=contours.length;
		for (iContour=0; iContour<nContours; iContour++) {
			sides=contours[iContour].sides;
			nSides=sides.length;
			for (iSide=0; iSide<nSides; iSide++) {
				side=sides[iSide];
				idA=side.ptA.toHashkey();
				idB=side.ptB.toHashkey();
				// duplicate (we eliminate same segment in reverse direction)
				if (pool[idB] && pool[idB].sides[idA]) {
					delete pool[idB].sides[idA];
					if (!--pool[idB].n) {
						delete pool[idB];
						}
					}
				// not a duplicate
				else {
					if (!pool[idA]) {
						pool[idA]={n:1,sides:{}};
						}
					else {
						pool[idA].n++;
						}
					pool[idA].sides[idB]=side;
					}
				}
			}
		}
	// recreate and store new contours by jumping from one side to the next,
	// using the second point of the side as hash key for next side
	this.contours=[]; // regenerate new contours
	var contour;
	for (idA in pool) { // we need this to get a starting point for a new contour
		contour = new Contour();
		this.contours.push(contour);
		for (idB in pool[idA].sides) {break;}
		side=pool[idA].sides[idB];
		while (side) {
			contour.addSide(side);
			// remove from collection since it has now been used
			delete pool[idA].sides[idB];
			if (!--pool[idA].n) {
				delete pool[idA];
				}
			idA=side.ptB.toHashkey();
			if (pool[idA]) {
				for (idB in pool[idA].sides) {break;} // any end point will do
				side=pool[idA].sides[idB];
				}
			else {
				side=null;
				}
			}
		}
	// invalidate cached values
	delete this.bbox;
	delete this.area;
	delete this.centroid;
	delete this.mostlyHollow;
	};
Polygon.prototype.toCanvasPath = function(ctx) {
	var contours=this.contours;
	var nContours=contours.length;
	for (var iContour=0; iContour<nContours; iContour++) {
		contours[iContour].toCanvas(ctx);
		}
	};
Polygon.prototype.draw3dEdge = function(ctx) {
	var contours=this.contours;
	var nContours=contours.length;
	for (var iContour=0; iContour<nContours; iContour++) {
		contours[iContour].draw3dEdge(ctx);
		}
	};
