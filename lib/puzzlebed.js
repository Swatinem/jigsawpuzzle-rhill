module.exports = PuzzleBed;
var PuzzlePart = require('./puzzlepart');
var Bbox = require('./bbox');


// Puzzle bed area
function PuzzleBed(img,guide) {
	var me=this;
	this.image=document.createElement('canvas');
	this.image.width=img.width;
	this.image.height=img.height;
	this.bbox=new Bbox(0,0,img.width,img.height);
	var ctx=this.image.getContext('2d');
	if (!guide) {
		ctx.fillStyle='#fff';
		ctx.fillRect(0,0,img.width,img.height);
		var bedbgimg=new Image();
		bedbgimg.onload=function() {
			var ctx=me.image.getContext('2d');
			var bedbgpat=ctx.createPattern(this,'repeat');
			ctx.fillStyle=bedbgpat;
			ctx.fillRect(0,0,me.image.width,me.image.height);
			this.onload=me=null;
			};
		bedbgimg.src='checkerboard.png'; // Source: http://media.photobucket.com/image/transparent%20pattern%20background/bitwierd/Chequerboard.png
		}
	else {
		ctx.save();
		ctx.fillStyle='#eee';
		ctx.fillRect(0,0,img.width,img.height);
		ctx.globalAlpha=0.2;
		ctx.drawImage(img,0,0);
		ctx.restore();
		}
	}
PuzzleBed.prototype=new PuzzlePart();
PuzzleBed.prototype.draw = function(ctx) {
	ctx.drawImage(this.image,this.bbox.tl.x,this.bbox.tl.y);
	};
PuzzleBed.prototype.setDisplayPos = function(x,y) {
	var topleft = this.bbox.getTopleft();
	this.bbox.offset(x-topleft.x,y-topleft.y);
	};
PuzzleBed.prototype.getDisplayPos = function() {
	return this.bbox.getTopleft();
	};
PuzzleBed.prototype.getDisplayBbox = function() {
	return new Bbox(this.bbox);
	};
PuzzleBed.prototype.pointIn = function(p) {
	return false;
	};
PuzzleBed.prototype.doesIntersect = function(bbox) {
	return this.bbox.doesIntersect(bbox);
	};
PuzzleBed.prototype.drawPiece = function(dTile) {
	var dImg=dTile.getDisplayImage();
	var dBbox=dTile.getBbox();
	var ctx=this.image.getContext('2d');
	ctx.drawImage(dImg,dBbox.tl.x-this.bbox.tl.x,dBbox.tl.y-this.bbox.tl.y);
	};
