module.exports = PuzzlePreview;
var PuzzlePart = require('./puzzlepart');
var Bbox = require('./bbox');


// Puzzle preview box
function PuzzlePreview(img) {
	this.preview=true;
	this.source=img;
	this.shadow=8;
	this.size=160; // starting size
	this.bbox=new Bbox(0,0,0,0);
	}
PuzzlePreview.prototype = new PuzzlePart();
PuzzlePreview.prototype.draw = function(ctx) {
	if (this.hidden) {return;}
	ctx.save();
	//ctx.shadowOffsetX = ctx.shadowOffsetY = this.shadow;
	//ctx.shadowColor = 'rgba(127, 127, 127, 0.33)';
	//ctx.shadowBlur = 2;
	if (!this.image) {
		this.resize();
		}
	ctx.drawImage(this.image,this.bbox.tl.x,this.bbox.tl.y);
	ctx.restore();
	};
PuzzlePreview.prototype.setDisplayPos = function(x,y) {
	var topleft=this.bbox.getTopleft();
	this.bbox.offset(x-topleft.x,y-topleft.y);
	};
PuzzlePreview.prototype.getDisplayPos = function() {
	return this.bbox.getTopleft();
	};
PuzzlePreview.prototype.getDisplayBbox = function() {
	return new Bbox(this.bbox);
	};
PuzzlePreview.prototype.getDisplayBboxConst = function() {
	return this.bbox;
	};
PuzzlePreview.prototype.pointIn = function(p) {
	var noShadowBbox=new Bbox(this.bbox);
	noShadowBbox.br.x-=this.shadow;
	noShadowBbox.br.y-=this.shadow;
	return noShadowBbox.pointIn(p);
	};
PuzzlePreview.prototype.doesIntersect = function(bbox) {
	return this.bbox.doesIntersect(bbox);
	};
PuzzlePreview.prototype.resize = function(sz) {
	var math=Math;
	var w; var h;
	w=h=(!sz)?math.max(this.source.width,this.source.height):sz;
	var ratio=this.source.width/this.source.height;
	if (ratio>=1) {h/=ratio;}
	else {w*=ratio;}
	this.size=sz;
	// ensure no fraction, thus no subpixel operations on the canvas
	w=math.round(w);
	h=math.round(h);
	if (!this.image) {
		this.image=document.createElement('canvas');
		}
	this.image.width=w+this.shadow;
	this.image.height=h+this.shadow;
	// keep track of previous position
	var xpos=0;
	var ypos=0;
	if (this.bbox) {
		xpos=math.max(this.bbox.tl.x,0);
		ypos=math.max(this.bbox.tl.y,0);
		}
	this.bbox=new Bbox(xpos,ypos,xpos+w+this.shadow,ypos+h+this.shadow);
	// transfer source image
	var ctx=this.image.getContext('2d');
	ctx.drawImage(this.source,0,0,w,h);
	// frame to highlight preview
	ctx.save();
	ctx.beginPath();
	ctx.rect(0,0,w,h);
	ctx.clip();
	ctx.strokeStyle='#f00';
	ctx.lineWidth=2;
	ctx.globalAlpha=0.8;
	ctx.strokeRect(0,0,w,h);
	ctx.restore();
	// shadow simulation, I can't make the built-in work
	ctx.fillStyle='#000';
	ctx.globalAlpha=0.5;
	ctx.fillRect(w,this.shadow,this.shadow,h); // left shadow
	ctx.fillRect(this.shadow,h,w-this.shadow,this.shadow); // bottom shadow
	};
PuzzlePreview.prototype.maximize = function() {
	this.resize();
	};
PuzzlePreview.prototype.restore = function() {
	this.resize(160);
	};
PuzzlePreview.prototype.toggleVisibility= function() {
	this.hidden=!this.hidden;
	};
