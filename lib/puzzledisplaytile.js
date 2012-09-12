module.exports = PuzzleDisplayTile;
var PuzzleTile = require('./puzzletile');
var Point = require('./point');
var Bbox = require('./bbox');


/**
  Display tile descriptor
 */
function PuzzleDisplayTile(tTile) {
	PuzzleTile.call(this);
	this.tTile=tTile;
	this.dPos=new Point();
	}
PuzzleDisplayTile.prototype = new PuzzleTile();
PuzzleDisplayTile.prototype.getDisplayPos = function() {
	return new Point(this.dPos);
	};
PuzzleDisplayTile.prototype.setDisplayPos = function(x,y) {
	var dx=x-this.dPos.x;
	var dy=y-this.dPos.y;
	this.dPos.set({x:x,y:y});
	if (this.polygon) {
		this.polygon.offset(dx,dy);
		}
	if (this.bbox) {
		this.bbox.offset(dx,dy);
		}
	};
PuzzleDisplayTile.prototype.getDisplayImage = function() {
	// the display image is the same as the transient image
	return this.tTile.getTransientImage();
	};
PuzzleDisplayTile.prototype.getAngleStep = function() {
	return this.tTile.getAngleStep();
	};
PuzzleDisplayTile.prototype.setAngleStep = function(step,maxSteps) {
	// pass call down to the transient tile and invalid self
	this.tTile.setAngleStep(step,maxSteps);
	delete this.polygon;
	delete this.bbox;
	};
PuzzleDisplayTile.prototype.sync = function() {
	if (!this.polygon) {
		this.polygon=this.tTile.getPolygon();
		// shift to screen position
		var tCentroid=this.tTile.getCentroid();
		this.polygon.offset(this.dPos.x-tCentroid.x,this.dPos.y-tCentroid.y);
		}
	};
PuzzleDisplayTile.prototype.getPolygonSides = function() {
	if (!this.polygon) {this.sync();}
	return PuzzleTile.prototype.getPolygonSides.call(this);
	};
PuzzleDisplayTile.prototype.getPolygonSidesConst = function() {
	if (!this.polygon) {this.sync();}
	return PuzzleTile.prototype.getPolygonSidesConst.call(this);
	};
PuzzleDisplayTile.prototype.getBbox = function() {
	return new Bbox(this.getBboxConst());
	};
PuzzleDisplayTile.prototype.getBboxConst = function() {
	// we need to overload since our bbox is valid only when we are in sync with transient tile
	if (!this.bbox) {
		if (!this.polygon) {this.sync();}
		this.bbox=PuzzleTile.prototype.getBbox.call(this);
		}
	return this.bbox;
	};
PuzzleDisplayTile.prototype.getCentroid = function() {
	// we need to overload since our poly is valid only when we are in sync with transient tile
	if (!this.polygon) {this.sync();}
	return PuzzleTile.prototype.getCentroid.call(this);
	};
PuzzleDisplayTile.prototype.pointIn = function(p) {
	// coarse test first (this improves performance significantly)
	if (this.getBboxConst().pointIn(p)) {
		// don't forget to convert point to transient tile coords
		// before propagating call
		var dPos=this.getBbox().getTopleft();
		return this.tTile.pointIn(new Point({x:p.x-dPos.x,y:p.y-dPos.y}));
		}
	return false;
	};
PuzzleDisplayTile.prototype.merge = function(others) {
	// build transient tiles array
	var tTiles=[];
	var nOthers=others.length;
	for (var iOther=0; iOther<nOthers; iOther++) {
		tTiles.push(others[iOther].tTile);
		}
	this.tTile.merge(tTiles);
	delete this.polygon;
	delete this.bbox;
	};
PuzzleDisplayTile.prototype.isMostlyHollow = function() {
	if (!this.polygon) {this.sync();}
	return this.polygon.isMostlyHollow();
	};
