module.exports = PuzzlePiece;
var PuzzlePart = require('./puzzlepart');
var PuzzleSourceTile = require('./puzzlesourcetile');
var PuzzleTransientTile = require('./puzzletransienttile');
var PuzzleDisplayTile = require('./puzzledisplaytile');


// Puzzle piece
function PuzzlePiece(id,sides,img) {
	this.id=id;
	this.sTile=new PuzzleSourceTile(img);
	this.sTile.setPolygon(sides);
	this.tTile=new PuzzleTransientTile(this.sTile);
	this.dTile=new PuzzleDisplayTile(this.tTile);
	this.piece=true; // this is a puzzle piece
	PuzzlePart.call(this);
	}
PuzzlePiece.prototype = new PuzzlePart();
PuzzlePiece.prototype.getAngleStep = function() {
	return this.dTile.getAngleStep();
	};
PuzzlePiece.prototype.setAngleStep = function(step,numsteps) {
	this.dTile.setAngleStep(step,numsteps);
	};
PuzzlePiece.prototype.setDisplayPos = function(x,y) {
	this.dTile.setDisplayPos(x,y);
	};
PuzzlePiece.prototype.getDisplayPos = function() {
	return this.dTile.getDisplayPos();
	};
PuzzlePiece.prototype.getDisplayBbox = function() {
	return this.dTile.getBbox();
	};
PuzzlePiece.prototype.getDisplayBboxConst = function() {
	return this.dTile.getBboxConst();
	};
PuzzlePiece.prototype.draw = function(ctx) {
	var dImage=this.dTile.getDisplayImage();
	var dTopleft=this.dTile.getBbox().getTopleft();
	ctx.drawImage(dImage,dTopleft.x,dTopleft.y);
	};
PuzzlePiece.prototype.pointIn = function(p) {
	return this.dTile.pointIn(p);
	};
PuzzlePiece.prototype.isEdge = function() {
	return this.edge;
	};
PuzzlePiece.prototype.doesIntersect = function(bbox) {
	return bbox.doesIntersect(this.getDisplayBboxConst());
	};
PuzzlePiece.prototype.merge = function(others) {
	// build display tiles array
	var dTiles=[];
	var nOthers=others.length;
	var other;
	for (var iOther=0; iOther<nOthers; iOther++) {
		other=others[iOther];
		dTiles.push(other.dTile);
		this.edge=this.edge||other.edge;
		if (!this.composite) {
			this.composite=[this.id];
			}
		if (other.composite) {
			this.composite=this.composite.concat(other.composite);
			}
		else {
			this.composite.push(other.id);
			}
		}
	this.dTile.merge(dTiles);
	};
PuzzlePiece.prototype.snapPiece = function(other) {
	// do not snap with self..
	if (other.id==this.id) {return false;}
	// display angle steps must be the same
	if (other.getAngleStep()!=this.getAngleStep()) {return false;}
	// overall display bounding box, inflated as per tolerance, must intersect
	var dBbox=other.getDisplayBbox();
	dBbox.inflate(5); // within 5 pixels
	if (!dBbox.doesIntersect(this.getDisplayBboxConst())) {return false;}
	// we test each side of this piece against each side of the other piece
	var abs=Math.abs;
	var thisSides=this.dTile.getPolygonSidesConst();
	var otherSides=other.dTile.getPolygonSidesConst();
	var nThisSides=thisSides.length;
	var nOtherSides=otherSides.length;
	var thisSide; var otherSide;
	for (var iThisSide=0; iThisSide<nThisSides; iThisSide++) {
		thisSide=thisSides[iThisSide];
		for (var iOtherSide=0; iOtherSide<nOtherSides; iOtherSide++) {
			otherSide=otherSides[iOtherSide];
			if (otherSide.ptA.id==thisSide.ptB.id && otherSide.ptB.id==thisSide.ptA.id && abs(otherSide.ptA.x-thisSide.ptB.x)<5 && abs(otherSide.ptA.y-thisSide.ptB.y)<5) {
				// merge pieces
				var oldTopleft=this.getDisplayBbox().union(other.getDisplayBbox()).getTopleft();
				this.merge([other]);
				var newTopleft=this.getDisplayBbox().getTopleft();
				var newPos=this.getDisplayPos();
				newPos.offset(oldTopleft.x-newTopleft.x,oldTopleft.y-newTopleft.y);
				this.setDisplayPos(newPos.x,newPos.y);
				return true;
				}
			}
		}
	return false;
	};
PuzzlePiece.prototype.isMostlyHollow = function() {
	return this.dTile.isMostlyHollow();
	};
