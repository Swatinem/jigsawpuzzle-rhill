module.exports = PuzzleTransientTile;
var PuzzleTile = require('./puzzletile');


/**
  Transient tile descriptor
 */
function PuzzleTransientTile(sTile) {
	PuzzleTile.call(this);
	this.sTile = sTile;
	this.angleStep = 0;
	this.angleMaxSteps = 1; // default = no rotation
	this.angleRadians = 6.28318530718; // precalculated angle in radians for performance purpose
	}
PuzzleTransientTile.prototype = new PuzzleTile();
PuzzleTransientTile.prototype.getAngleStep = function() {
	return this.angleStep;
	};
PuzzleTransientTile.prototype.setAngleStep = function(step,maxSteps) {
	// quantize max steps into a factor of 360
	if (maxSteps !== undefined) {
		this.angleMaxSteps = 360/Math.round(360/Math.min(Math.max(maxSteps,1),90));
		}
	// ensure step is within range
	this.angleStep=step%this.angleMaxSteps;
	if (this.angleStep < 0) {
		this.angleStep+=this.angleMaxSteps;
		}
	// precalculate angle in radian: 2PI*step/maxsteps
	this.angleRadians=6.28318530718*this.angleStep/this.angleMaxSteps;
	this.tImage=null; // invalidate internal state
	}; 
PuzzleTransientTile.prototype.sync = function() {
	if (!this.tImage) {
		this.tImage=document.createElement('canvas');
		// we need to find out the bbox of the rotated source
		// in order to know the required image size
		this.polygon=this.sTile.polygon.clone();
		var sBbox=this.sTile.getBbox();
		var sTopleft=sBbox.getTopleft();
		var sCentroid=this.sTile.getCentroid();
		// rotate
		this.polygon.rotate(this.angleRadians,sTopleft.x+sCentroid.x,sTopleft.y+sCentroid.y);
		// post-rotation bbox different from pre-
		var tBbox=this.polygon.getBbox();
		var tTopleft=tBbox.getTopleft();
		// set origin to self
		this.polygon.offset(-tTopleft.x,-tTopleft.y);
		var tCentroid=this.polygon.getCentroid();
		this.tImage.width=tBbox.width();
		this.tImage.height=tBbox.height();
		// transfer/rotate source tile image
		var ctx=this.tImage.getContext('2d');
		// first, set the clipping region as per contours
		ctx.save();
		ctx.beginPath();
		this.polygon.toCanvasPath(ctx);
		ctx.clip();
		// copy/rotate source image into local buffer
		ctx.save();
		if ( this.angleStep ) {
			ctx.translate(tCentroid.x,tCentroid.y);
			ctx.rotate(this.angleRadians);
			ctx.translate(-tCentroid.x,-tCentroid.y);
			}
		ctx.drawImage(this.sTile.getSourceImage(),sTopleft.x,sTopleft.y,sBbox.width(),sBbox.height(),tCentroid.x-sCentroid.x,tCentroid.y-sCentroid.y,sBbox.width(),sBbox.height());
		ctx.restore();
		// draw '3d' edges around the piece
		ctx.globalAlpha=0.9;
		ctx.lineWidth=1;
		this.polygon.draw3dEdge(ctx);
		ctx.restore();
		}
	};
PuzzleTransientTile.prototype.getPolygon = function() {
	// we need to overload since our image is valid only when we are in sync with source tile
	if (!this.tImage) {this.sync();}
	return PuzzleTile.prototype.getPolygon.call(this);
	};
PuzzleTransientTile.prototype.getPolygonSides = function() {
	if (!this.tImage) {this.sync();}
	return PuzzleTile.prototype.getPolygonSides.call(this);
	};
PuzzleTransientTile.prototype.getPolygonSidesConst = function() {
	if (!this.tImage) {this.sync();}
	return PuzzleTile.prototype.getPolygonSidesConst.call(this);
	};
PuzzleTransientTile.prototype.getTransientImage = function() {
	// we need to overload since our image is valid only when we are in sync with source tile
	if (!this.tImage) {this.sync();}
	return this.tImage;
	};
PuzzleTransientTile.prototype.getBbox = function() {
	// we need to overload since our bbox is valid only when we are in sync with source tile
	if (!this.tImage) {this.sync();}
	return PuzzleTile.prototype.getBbox.call(this);
	};
PuzzleTransientTile.prototype.getCentroid = function() {
	// we need to overload since our poly is valid only when we are in sync with source tile
	if (!this.tImage) {this.sync();}
	return PuzzleTile.prototype.getCentroid.call(this);
	};
PuzzleTransientTile.prototype.pointIn = function(p) {
	if (!this.tImage) {this.sync();}
	// HTML canvas has a nice function to test whether a point
	// lies inside a polygon, lets use it
	var r=false;
	var ctx=this.tImage.getContext('2d');
	ctx.save();
	ctx.beginPath();
	var contours=this.polygon.contours;
	var nContours=contours.length;
	for (var iContour=0; iContour<nContours; iContour++) {
		contours[iContour].toCanvas(ctx);
		}
	r=ctx.isPointInPath(p.x,p.y);
	ctx.restore();
	return r;
	};
PuzzleTransientTile.prototype.merge = function(others) {
	// build source tiles array
	var sTiles=[];
	var nOthers=others.length;
	for (var iOther=0; iOther<nOthers; iOther++) {
		sTiles.push(others[iOther].sTile);
		}
	this.sTile.merge(sTiles);
	this.tImage = null;
	};
