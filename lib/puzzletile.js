module.exports = PuzzleTile;
var Polygon = require('./polygon');


/**
  Puzzle tile base class
 */
function PuzzleTile() {
	this.polygon = null;
	}
PuzzleTile.prototype.setPolygon = function(sides) {
	if (!this.polygon) {
		this.polygon = new Polygon(sides);
		}
	};
PuzzleTile.prototype.getBbox = function() {
	return this.polygon.getBbox();
	};
PuzzleTile.prototype.getCentroid = function() {
	return this.polygon.getCentroid();
	};
PuzzleTile.prototype.getPolygon = function() {
	return this.polygon.clone();
	};
PuzzleTile.prototype.getPolygonSides = function() {
	return this.polygon.getSides();
	};
PuzzleTile.prototype.getPolygonSidesConst = function() {
	return this.polygon.getSidesConst();
	};
PuzzleTile.prototype.merge = function(others) {
	// build polygons array
	var polygons=[];
	var nOthers=others.length;
	for (var iOther=0; iOther<nOthers; iOther++) {
		polygons.push(others[iOther].polygon);
		}
	this.polygon.merge(polygons);
	};
