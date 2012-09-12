/******************************************************************************

jigsawpuzzle-rhill 0.4 (14-Jun-2009) (c) by Raymond Hill
Source: http://www.raymondhill.net/puzzle-rhill/jigsawpuzzle-rhill.php
License (changed on 2011-12-02 from GPL): MIT license

Copyright (C) 2009-2011 by Raymond Hill

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

**/

/*This makes JSlint happy*/
/*global self gadgets*/

// jigsaw puzzle-rhill

// if no gadgets infrastructure, create a gadgets lookalike
if (!gadgets) {
	var gadgets={
		fake:true,
		window:{
			adjustHeight:function(){}
			},
		util:{
			registerOnLoadHandler:function(h){if(self.addEventListener){self.addEventListener('load',h,false);}else if(self.attachEvent){self.attachEvent('onload',h);}},
			escapeString:function(s){return self.escape(s);},
			unescapeString:function(s){return self.unescape(s);}
			},
		Prefs:function(){
			this.set=function(key,val){
				var date=new Date();
				date.setTime(date.getTime()+(365*24*60*60*1000));
				self.document.cookie=key+"="+val+"; expires="+date.toGMTString()+"; path=/";
				};
			this.getString=function(key){
				key=key+"=";
				var ca=self.document.cookie.split(';');
				for (var i=0; i<ca.length; i++) {
					var c=ca[i];
					c=c.replace(/^\s+/,'');
					if (c.indexOf(key)===0) {
						return c.substring(key.length,c.length);
						}
					}
				return null;
				};
			},
		io:{
			makeRequest:function(url,callback){
				var xmlhttp=new XMLHttpRequest();
				if (!xmlhttp) {return;}
				xmlhttp.open("GET",url,true);
				xmlhttp.setRequestHeader('User-Agent','XMLHTTP/1.0');
				xmlhttp.onreadystatechange=function(){
					if (xmlhttp.readyState!=4) {return;}
					if (xmlhttp.status!=200 && xmlhttp.status!=304) {
						//alert('HTTP error '+xmlhttp.status);
						return;
						}
					callback(xmlhttp);
					};
				if (xmlhttp.readyState==4) {return;}
				xmlhttp.send();
				}
			},
		json:{
			parse:function(s){return JSON.parse(s);},
			stringify:function(o){return JSON.stringify(o);}
			}
		};
	}
// https://developer.mozilla.org/en/DOM/element.addEventListener
gadgets.addEventListener=function(o,e,f){
	if (o.addEventListener){o.addEventListener(e,f,false);}
	else if (o.attachEvent){o.attachEvent(e,f);}
	};
gadgets.removeEventListener=function(o,e,f){
	if (o.removeEventListener){o.removeEventListener(e,f,false);}
	else if (o.detachEvent){o.detachEvent(e,f);}
	};
// I'm adding Base64 functionality to the gadgets object
// From: http://www.webtoolkit.info/javascript-base64.html
// Small bug fix required in _utf8_decode (more like a typo)
// Converted to the URL-friendly form: + => -, / => _, no
// padding (decode will auto-pad to a multiple of 4).
// Extended to support binary encoding/decoding of array of
// 10-bit values: encode10bit. Other changes, to reduce burden
// of main loops, including assuming that the input is what it
// is supposed to be, etc. In other word, result is a non-
// standard Base64 suited for this app only, and except for
//  _utf8_* functions, differ from original code.
gadgets.Base64={
	// private property
	_keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_=",
	// public methods for encoding
	// input = a string
	// 765432 107654 321076 543210
	// 543210 543210 543210 543210
	encodeString : function (input) {
		input=this._utf8_encode(input);
		var k=this._keyStr;
		var output=[];
		var i1,i2,i3;
		var n=Math.floor(input.length/3)*3;
		for (var i=0; i<n; i+=3) {
			i1=input.charCodeAt(i);
			i2=input.charCodeAt(i+1);
			i3=input.charCodeAt(i+2);
			output.splice(output.length,0,k.charAt(i1>>2),k.charAt((i1&3)<<4|i2>>4),k.charAt((i2&15)<<2|i3>>6),k.charAt(i3&63));
			}
		// leftover
		var m=input.length-n;
		if (m) {
			i1=input.charCodeAt(n);
			output.splice(output.length,0,k.charAt(i1>>2)); // this part is needed for sure
			var o2=(i1&3)<<4;
			if (m>1) { // 2 values
				i2=input.charCodeAt(n+1);
				output.splice(output.length,0,k.charAt(o2|i2>>4),k.charAt((i2&15)<<2));
				}
			else { // 1 value
				output.splice(output.length,0,k.charAt(o2));
				}
			}
		return output.join('');
		},
	// public method for decoding
	decodeString : function (input) {
		var indexOf=this._indexOf;
		var output=[];
		var i1, i2, i3, i4;
		var n=input.length&0xfffffffc;
		for (var i=0; i<n; i+=4) {
			i1=indexOf(input.charCodeAt(i));
			i2=indexOf(input.charCodeAt(i+1));
			i3=indexOf(input.charCodeAt(i+2));
			i4=indexOf(input.charCodeAt(i+3));
			output.splice(output.length,0,String.fromCharCode(i1<<2|i2>>4),String.fromCharCode((i2&15)<<4|i3>>2),String.fromCharCode((i3&3)<<6|i4));
			}
		// leftover
		var m=input.length-n;
		if (m) {
			i1=indexOf(input.charCodeAt(n)); // at least one value
			i2=indexOf(input.charCodeAt(n+1));
			output.splice(output.length,0,String.fromCharCode(i1<<2|i2>>4));
			if (m===3) { // 2 values
				i3=indexOf(input.charCodeAt(n+2));
				output.splice(output.length,0,String.fromCharCode((i2&15)<<4|i3>>2));
				}
			}
		return this._utf8_decode(output.join(''));
		},
	// input = an array of 10-bit values: 3 10-bit values = 5 base64 characters
	// 987654 321098 765432 109876 543210
	// 543210 543210 543210 543210 543210
	// I added this 10-bit encoding to represent the maximum allowable number
	// of puzzle pieces with the least number of bits.
	// Using an array than converting to a string, I read somewhere this
	// is more efficient than using string concatenation
	encode10bit : function (input) {
		var k=this._keyStr;
		var output=[];
		var i1,i2,i3;
		var n=Math.floor(input.length/3)*3;
		for (var i=0; i<n; i+=3) {
			i1=input[i];
			i2=input[i+1];
			i3=input[i+2];
			output.splice(output.length,0,k.charAt(i1>>4),k.charAt((i1&15)<<2|i2>>8),k.charAt(i2>>2&63),k.charAt((i2&3)<<4|i3>>6),k.charAt(i3&63));
			}
		// leftover
		var m=input.length-n;
		if (m) {
			i1=input[n];
			output.splice(output.length,0,k.charAt(i1>>4)); // this part is needed for sure
			if (m>1) { // 2 values
				i2=input[n+1];
				output.splice(output.length,0,k.charAt((i1&15)<<2|i2>>8),k.charAt(i2>>2&63),k.charAt((i2&3)<<4));
				}
			else { // 1 value
				output.splice(output.length,0,k.charAt((i1&15)<<2));
				}
			}
		return output.join('');
		},
	decode10bit : function (input) {
		var indexOf=this._indexOf;
		var output=[];
		var i1, i2, i3, i4, i5;
		var n=Math.floor(input.length/5)*5;
		for (var i=0; i<n; i+=5) {
			i1=indexOf(input.charCodeAt(i));
			i2=indexOf(input.charCodeAt(i+1));
			i3=indexOf(input.charCodeAt(i+2));
			i4=indexOf(input.charCodeAt(i+3));
			i5=indexOf(input.charCodeAt(i+4));
			output.splice(output.length,0,i1<<4|i2>>2,(i2&3)<<8|i3<<2|i4>>4,(i4&15)<<6|i5);
			}
		// leftover
		var m=input.length-n;
		if (m) {
			i1=indexOf(input.charCodeAt(n));
			i2=indexOf(input.charCodeAt(n+1));
			output.splice(output.length,0,i1<<4|i2>>2); // at least one value
			if (m===4) { // 2 values
				i3=indexOf(input.charCodeAt(n+2));
				i4=indexOf(input.charCodeAt(n+3));
				output.splice(output.length,0,(i2&3)<<8|i3<<2|i4>>4);
				}
			}
		return output;
		},
	// the passed argument is assumed to be valid. Quite unsure if
	// this is faster than String.indexOf() (there would be no
	// doubt if it was compiled language, but this is JS..)
	_indexOf : function (c) {
		if (c==45) {return 62;} // [-] = 62
		if (c<58) {return c+4;} // [0-9] = 52-61
		if (c<91) {return c-65;} // [A-Z] = 0-25
		if (c==95) {return 63;} // [_] = 63
		return c-71; // [a-z] = 26-51
		},
	// private method for UTF-8 encoding
	_utf8_encode : function (string) {
		string = string.replace(/\r\n/g,"\n");
		var utftext = "";
		for (var n = 0; n < string.length; n++) {
			var c = string.charCodeAt(n);
			if (c < 128) {
				utftext += String.fromCharCode(c);
				}
			else if((c > 127) && (c < 2048)) {
				utftext += String.fromCharCode((c >> 6) | 192);
				utftext += String.fromCharCode((c & 63) | 128);
				}
			else {
				utftext += String.fromCharCode((c >> 12) | 224);
				utftext += String.fromCharCode(((c >> 6) & 63) | 128);
				utftext += String.fromCharCode((c & 63) | 128);
				}
			}
		return utftext;
		},
	// private method for UTF-8 decoding
	_utf8_decode : function (utftext) {
		var string = "";
		var i = 0;
		var c = 0;
		var c1 = 0;
		var c2 = 0;
		while ( i < utftext.length ) {
			c = utftext.charCodeAt(i);
			if (c < 128) {
				string += String.fromCharCode(c);
				i++;
				}
			else if((c > 191) && (c < 224)) {
				c1 = utftext.charCodeAt(i+1);
				string += String.fromCharCode(((c & 31) << 6) | (c1 & 63));
				i += 2;
				}
			else {
				c1 = utftext.charCodeAt(i+1);
				c2 = utftext.charCodeAt(i+2);
				string += String.fromCharCode(((c & 15) << 12) | ((c1 & 63) << 6) | (c2 & 63));
				i += 3;
				}
			}
		return string;
		}
	};

// helper functions
function stdout(s,clear){var consoleObj=self.document.getElementById('console');if(consoleObj){if(clear){consoleObj.innerHTML="";}consoleObj.innerHTML+=s+"<br>";}}
function stderr(s) {if (self.debug_on){stdout(s);}}


/**
 * Puzzle object
 *
 * Initialization logic:
 * There must always be a View specified: 'Full' or 'Mini'.
 * If no View specified, default to 'Full'
 * If Options
 *   If Options.puzzleKey
 *     Use Options.puzzleKey
 *   Else if Options.puzzleSrc
 *     Use Option
 *   Else
 *     Prefs(View)
 * Else If Prefs(View)
 *   Use Prefs(View)
 * Else
 *   Use Default
 */
function Puzzle(canvas, puzzleOptions) {
	// this is me initializing
	var me=this;
	// Methods
	this.confine = function(v,l,h,d) {
		return v!==undefined?Math.max(Math.min(v,h),l):d;
		};
	this.create = function(puzzleOptions) {
		// use default options if none specified
		var defaultOptions={
			view:'full',
			cut:'classic',
			screenSize:'h768',
			src:'http://www.raymondhill.net/puzzle-rhill/images/full-IMG_1731.jpg',
			numPieces:{full:25,mini:10},
			complexity:1,
			numRotateSteps:{full:24,mini:1},
			showPreview:false};
		// validate configurable parameters
		this.config={};
		this.config.view=(puzzleOptions&&puzzleOptions.view)?puzzleOptions.view:defaultOptions.view;
		this.config.cookieName='jigsawpuzzle_rhill_'+this.config.view;
		// if no options specified, load persisted state
		if (!puzzleOptions) {
			puzzleOptions=this.restoreKey(this.config.cookieName);
			}
		else if (puzzleOptions.key) {
			puzzleOptions=this.parseKey(puzzleOptions.key);
			}
		else if (!puzzleOptions.src&&!puzzleOptions.bedWidth) {
			puzzleOptions=this.restoreKey(this.config.cookieName);
			}
		this.config.cut=(puzzleOptions.cut!==undefined&&Profile.prototype.stock[puzzleOptions.cut]!==undefined)?puzzleOptions.cut:defaultOptions.cut;
		this.config.showEdges=false;
		this.config.showComposite=false;
		this.config.showPreview=(puzzleOptions.showPreview!==undefined)?puzzleOptions.showPreview:false;
		this.config.numPieces=this.confine(puzzleOptions.numPieces,4,999,defaultOptions.numPieces[this.config.view]);
		this.config.complexity=this.confine(puzzleOptions.complexity,0,9,defaultOptions.complexity);
		this.config.numRotateSteps=this.confine(puzzleOptions.numRotateSteps,1,90,defaultOptions.numRotateSteps[this.config.view]);
		this.config.screenSize=puzzleOptions.screenSize?puzzleOptions.screenSize:defaultOptions.screenSize;
		this.config.bedWidth=puzzleOptions.bedWidth?puzzleOptions.bedWidth:{h600:600,h768:768,h1024:1024,h1050:1260,h1200:1440,h1600:1920}[this.config.screenSize];
		this.config.bedHeight=puzzleOptions.bedHeight?puzzleOptions.bedHeight:{h600:450,h768:576,h1024:768,h1050:945,h1200:1080,h1600:1440}[this.config.screenSize];
		this.config.bedMargin=Math.round(this.config.bedHeight*0.05);
		this.config.src=puzzleOptions.src&&puzzleOptions.src.length>0?puzzleOptions.src:defaultOptions.src;
		if (puzzleOptions.clusters) {this.config.clusters=puzzleOptions.clusters;}
		this.minPieceSize=40;
		this.minImageSize=this.minPieceSize*2;
		// resize canvas according to calculated width/height
		if (!this.canvas) {throw "Puzzle.create(): No canvas";}
		// final step: load image to be used
		this.imageSource=new Image();
		this.imageSource.onload=function(){
			me.init(me.config);
			this.onload=null;
			};
		this.imageSource.src=this.config.src;
		// clear internal state
		this.pieces={};
		this.drawingStack=[];
		this.composites={};
		};
	// mix pieces
	this.shuffle = function() {
		var round=Math.round;
		var random=Math.random;
		// precalculate horizontal/vertical domain/offset
		var cw=this.canvas.width;
		var ch=this.canvas.height;
		var hf=cw-this.partWidth;
		var vf=ch-this.partHeight;
		var ph2=this.partWidth>>1;
		var pv2=this.partHeight>>1;
		var part;
		for (var ipart=0; ipart<this.drawingStack.length; ipart++) {
			part=this.drawingStack[ipart];
			if (!part.piece) {continue;}
			// composite pieces do not have standard size
			if (!part.composite) {
				part.setDisplayPos(round(random()*hf)+ph2,round(random()*vf)+pv2);
				}
			else {
				var partBbox=part.getDisplayBboxConst();
				var partWidth=partBbox.width();
				var partHeight=partBbox.height();
				part.setDisplayPos(round(random()*(cw-partWidth)+(partWidth/2)),
				                   round(random()*(ch-partHeight)+(partHeight/2)));
				}
			// rotation only for non-composite pieces
			part.setAngleStep(part.composite?0:round(random()*this.config.numRotateSteps),this.config.numRotateSteps);
			}
		};
	this.draw = function(clip) {
		var ctx=me.canvas.getContext('2d');
		ctx.save();
		// comment out to verify minimal redrawing
		//ctx.clearRect(0,0,me.canvas.width,me.canvas.height);
		// draw only what intersect with clip region
		ctx.fillStyle = me.canvas.backgroundColor;
		if (clip) {
			ctx.beginPath();
			clip.toCanvasPath(ctx);
			ctx.clip();
			ctx.fill();
			}
		else {
			ctx.fillRect(0,0,me.canvas.width,me.canvas.height);
			}
		// puzzle parts
		ctx.globalCompositeOperation = "source-over";
		// store locally often used properties for efficiency
		var imoved=me.imoved;
		var showedges=me.config.showEdges;
		var showComposite=me.config.showComposite;
		var stack=me.drawingStack;
		// stack drawn from bottom to top
		var nparts=stack.length;
		var part;
		for (var ipart=0; ipart<nparts; ipart++) {
			part=stack[ipart];
			if ((!clip || part.doesIntersect(clip)) && (!part.piece || ipart==imoved || ((!showComposite || part.composite) && (!showedges || part.isEdge())))) {
				part.draw(ctx);
				}
			}
		ctx.restore();
		};
	// merge two puzzle pieces
	this.mergePieces = function(id,others) {
		var parts=[];
		var nOthers=others.length;
		var otherId;
		for (var iOther=0; iOther<nOthers; iOther++) {
			otherId=others[iOther];
			parts.push(this.pieces[otherId]);
			delete this.pieces[otherId];
			}
		this.pieces[id].merge(parts);
		this.composites[id]=this.pieces[id];
		};
	this.init = function() {
		this.canvas.style.cursor="wait";
		var round=Math.round;
		var ceil=Math.ceil;
		var sqrt=Math.sqrt;
		var domax=Math.max;
		var domin=Math.min;
		var opts=this.config;
		var iw=this.imageSource.width;
		var ih=this.imageSource.height;
		var cw=this.canvas.width;
		var ch=this.canvas.height;
		var imgRatio=iw/ih;
		var cnvRatio=cw/ch;
		// if image size < minImageSize, zoom in
		if (iw<this.minImageSize || ih<this.minImageSize) {
			if (imgRatio>=1) {
				iw=this.minImageSize;
				ih=round(iw/imgRatio);
				}
			else {
				ih=this.minImageSize;
				iw=round(ih*imgRatio);
				}
			}
		else if (iw>(cw-opts.bedMargin*2) || ih>(ch-opts.bedMargin*2)) {
			if (iw>(cw-opts.bedMargin*2)) {
				iw=cw-opts.bedMargin*2;
				ih=round(iw/imgRatio);
				}
			if (ih>(ch-opts.bedMargin*2)) {
				ih=ch-opts.bedMargin*2;
				iw=round(ih*imgRatio);
				}
			}
		// 2010-06-20: Forgot that we might have to size *up* to fill as much as possible the bed
/*		else if (iw<(cw-opts.bedMargin*2) && ih<(ch-opts.bedMargin*2)) {
			if (imgRatio<cnvRatio) {
				iw=cw-opts.bedMargin*2;
				ih=round(iw/imgRatio);
				}
			else {
				ih=ch-opts.bedMargin*2;
				iw=round(ih*imgRatio);
				}
			}
*/		if (iw<this.minImageSize || ih<this.minImageSize || iw>(cw-opts.bedMargin*2) || ih>(ch-opts.bedMargin*2)) {
			stdout("Because of its size, this image can't be used as a puzzle");
			return;
			}
		stdout("Original image size (w &times; h): "+this.imageSource.width+"px &times; "+this.imageSource.height+"px");
		if (iw!=this.imageSource.width || ih!=this.imageSource.height) {
			stdout("Resized to "+iw+"px &times; "+ih+"px");
			}
		// following will be used to generate puzzle pieces
		var numCols=domin(domax(ceil(sqrt(opts.numPieces)*sqrt(imgRatio)),2),round(iw/this.minPieceSize));
		var numRows=domin(domax(ceil(sqrt(opts.numPieces)/sqrt(imgRatio)),2),round(ih/this.minPieceSize));
		stdout("Actual number of pieces: "+numCols*numRows+" ("+numCols+" &times; "+numRows+" pieces)");
		this.partWidth=round(iw/numCols); // rounded to avoid fractional pixels
		this.partHeight=round(ih/numRows); // rounded to avoid fractional pixels
		// create the image that will be used as a basis for the puzzle
		this.imageObj=document.createElement('canvas');
		this.imageObj.width=iw;
		this.imageObj.height=ih;
		var ctx=this.imageObj.getContext('2d');
		ctx.drawImage(this.imageSource,0,0,this.imageSource.width,this.imageSource.height,0,0,iw,ih);
		// empty drawing stack
		this.drawingStack=[];
		this.pieces={};
		this.composites={};
		// generate pieces
		this.cut({width:iw,height:ih,numRows:numRows,numCols:numCols});
		// parse clusters and merge puzzle pieces as required
		var partid;
		if (this.config.clusters) {
			var clusters=this.config.clusters;
			var nClusters=clusters.length;
			var cluster;
			for (var iCluster=0; iCluster<nClusters; iCluster++) {
				cluster=clusters[iCluster];
				partid=cluster.shift();
				this.mergePieces(partid,cluster);
				}
			delete this.config.clusters;
			}
		// add what's left to the drawing stack
		for (partid in this.pieces) {
			if (!this.pieces.hasOwnProperty(partid)) {continue;}
			this.drawingStack.push(this.pieces[partid]);
			}
		// create preview tile
		this.previewTile=new PuzzlePreview(this.imageObj);
		this.previewTile.setDisplayPos((cw-iw)>>1,(ch-ih)>>1);
		this.previewTile.hidden=!opts.showPreview;
		this.drawingStack.push(this.previewTile);
		// shuffle and show
		this.shuffle();
		this.draw();
		};
	this.cut = function(parms) {
		var rand=Math.random;
		var min=Math.min;
		var max=Math.max;
		var imgWidth=parms.width;
		var imgHeight=parms.height;
		var numRows=parms.numRows;
		var numCols=parms.numCols;
		var partWidth=imgWidth/numCols;
		var partHeight=imgHeight/numRows;
		var partWidthVar=partWidth*max(min(this.config.complexity,9),0)*0.48/9;
		var partHeightVar=partHeight*max(min(this.config.complexity,9),0)*0.48/9;
		var randomX=function(iPart){return Math.round(partWidth*(iPart+1)+partWidthVar*2*rand()-partWidthVar);};
		var randomY=function(iPart){return Math.round(partHeight*(iPart+1)+partHeightVar*2*rand()-partHeightVar);};
		var vid=1; // unique id identifying every vertex
		var pid=1; // unique id identifying every puzzle piece
		var sides=[];
		var top=0; var right=1; var bottom=2;
		var edgeTop; var edgeRight; var edgeBottom; var edgeLeft; var piece;
		var profileStraight=new Profile(Profile.prototype.stock.straight);
		var profileRandomizer=new ProfileRandomizer(Profile.prototype.stock[this.config.cut],true);
		for (var iRow=0; iRow<numRows; iRow++) {
			sides[iRow]=[];
			for (var iCol=0; iCol<numCols; iCol++) {
				edgeTop=new Side(iRow===0?{ptA:iCol===0?{x:0,y:0,id:vid++}:sides[iRow][iCol-1][top].endPointConst(),ptB:{x:iCol==numCols-1?imgWidth:randomX(iCol),y:0,id:vid++},profileNormalized:profileStraight}:sides[iRow-1][iCol][bottom].complement());
				edgeRight=new Side({ptA:edgeTop.endPointConst(),ptB:{x:iCol==(numCols-1)?imgWidth:randomX(iCol),y:(iRow==numRows-1)?imgHeight:randomY(iRow),id:vid++},profileNormalized:iCol==(numCols-1)?profileStraight:profileRandomizer.randomize()});
				edgeBottom=new Side({ptA:edgeRight.endPointConst(),ptB:(iCol===0)?{x:0,y:iRow==numRows-1?imgHeight:randomY(iRow),id:vid++}:sides[iRow][iCol-1][bottom].startPointConst(),profileNormalized:iRow==numRows-1?profileStraight:profileRandomizer.randomize()});
				edgeLeft=new Side(iCol===0?{ptA:edgeBottom.endPointConst(),ptB:edgeTop.startPointConst(),profileNormalized:profileStraight}:sides[iRow][iCol-1][right].complement());
				sides[iRow][iCol]=[edgeTop,edgeRight,edgeBottom,edgeLeft];
				piece=new PuzzlePiece(pid++,sides[iRow][iCol],this.imageObj);
				piece.edge=(iRow===0)||(iCol===0)||(iRow==numRows-1)||(iCol==numCols-1);
				this.pieces[piece.id]=piece;
				}
			}
		};
	this.partUnderPoint = function(p) {
		var stack=this.drawingStack;
		var iPart=stack.length;
		var part;
		while (--iPart>=0) {
			part=stack[iPart];
			if (part.pointIn(p) && !part.hidden && (!part.piece || !this.config.showEdges || part.isEdge())) {
			    break;
				}
			}
		return iPart;
		};
	this.sendBack = function(ipart) {
		if (ipart>=0) {
			var movedPart=this.drawingStack[ipart];
			this.drawingStack.splice(ipart,1);
			this.drawingStack.unshift(movedPart);
			}
		return 0;
		};
	this.sendTop = function(ipart) {
		if (ipart>=0 && ipart<this.drawingStack.length-2) {
			var movedPart=this.drawingStack[ipart];
			this.drawingStack.splice(ipart,1);
			// insert below the preview part: todo: need to revisit for more solid programming
			ipart=this.drawingStack.length-1;
			this.drawingStack.splice(ipart,0,movedPart);
			}
		return ipart;
		};
	// normalize event position
	// based on Quirksmode.org's Peter-Paul Koch
	// http://www.quirksmode.org/js/events_properties.html#position
	// I think this doesn't work for IE..
	this.normalizeEventPos = function(e) {
		if (!e) {e=self.event;}
		var pos=new Point();
		if (e.pageX || e.pageY) {
			pos.x=e.pageX;
			pos.y=e.pageY;
			}
		else if (e.clientX || e.clientY) {
			pos.x=e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft;
			pos.y=e.clientY+document.body.scrollTop+document.documentElement.scrollTop;
			}
		pos.x-=me.canvas.offsetLeft;
		pos.y-=me.canvas.offsetTop;
		return pos;
		};
	// whether the puzzle is all solved
	this.isSolved = function() {
		return me.drawingStack.length<=2;
		};
	this.partidToIndex = function(id) {
		var n=this.drawingStack.length;
		var part;
		for (var i=0; i<n; i++) {
			part=this.drawingStack[i];
			if (part.piece && part.id==id) {
				return i;
				}
			}
		return -1;
		};
	// mark puzzle as changed
	this.markAsDirty = function() {
		this.dirty=true;
		this.puzzleKeyOut.value='';
		this.puzzlePermalink.value='';
		// bleh... gadgets prevent my unload handler from being called...
		if (!gadgets.fake) {
			this.persist();
			}
		};
	// generate a key representative of the current state of the puzzle
	this.generateKey = function(noProgress) {
		var opts=this.config;
		var attributes={};
		attributes.src=opts.src;
		attributes.cut=opts.cut;
		attributes.screenSize=opts.screenSize;
		attributes.numPieces=opts.numPieces;
		attributes.complexity=opts.complexity;
		attributes.numRotateSteps=opts.numRotateSteps;
		var key=gadgets.Base64.encodeString(gadgets.json.stringify(attributes));
		// encode puzzle progress
		if (!noProgress && this.composites) {
			var separator='++';
			for (var pid in this.composites) {
				if (!this.composites.hasOwnProperty(pid)) {continue;}
				key+=separator+gadgets.Base64.encode10bit(this.composites[pid].composite);
				separator='+';
				}
			}
		return key;
		};
	// persist puzzle state
	this.persist = function() {
		if (!this.dirty) {return;}
		var key=this.generateKey();	
		var prefs=new gadgets.Prefs();
		prefs.set(this.config.cookieName,key);
		delete this.dirty;
		};
	// parse puzzle key
	this.parseKey = function(key) {
		var r={};
		if (!key || !key.length) {return r;}
		// split attributes-clusters
		var streamParts=key.split('++');
		// parse attributes and create puzzle
		if (streamParts.length>0) {
			r=gadgets.json.parse(gadgets.Base64.decodeString(streamParts[0]));
			// parse clusters
			if (streamParts.length>1) {
				r.clusters=[];
				var clusters=streamParts[1].split('+');
				for (var iCluster=0; iCluster<clusters.length; iCluster++) {
					r.clusters.push(gadgets.Base64.decode10bit(clusters[iCluster]));
					}
				}
			}
		return r;
		};
	// restore puzzle state
	this.restoreKey = function(keyName) {
		var prefs=new gadgets.Prefs();
		return this.parseKey(prefs.getString(keyName));
		};
	// check whether a piece snaps onto another one
	this.snapPiece = function(iTarget) {
		var stack=this.drawingStack;
		var nParts=stack.length;
		var target=stack[iTarget];
		var targetBbox=target.getDisplayBbox();
		targetBbox.inflate(5);
		for (var iPart=0; iPart<nParts; iPart++) {
			// skip self
			if (iPart==iTarget) {continue;}
			// consider only puzzle piece (leaving other puzzle parts)
			var part=stack[iPart];
			if (!part.piece) {continue;}
			// angle must be same
			if (part.getAngleStep()!=target.getAngleStep()) {continue;}
			// coarse test
			if (!targetBbox.doesIntersect(part.getDisplayBboxConst())) {continue;}
			// test if it's a match
			if (!part.snapPiece(target)) {continue;}
			// pieces fit together
			this['puzzleSnap'+(Math.round(Math.random())+1)].play();
			// remember which pieces are clustered together, for persistence
			if (!this.composites) {this.composites={};}
			this.composites[part.id]=part;
			delete this.composites[target.id];
			// get rid of merged piece
			this.drawingStack.splice(iTarget,1);
			// is the puzzle solved?
			if (this.isSolved()) {
				if (this.config.numPieces>=200) {
					this.puzzleClap3.play();
					}
				else if (this.config.numPieces>=100) {
					this.puzzleClap2.play();
					}
				else if (this.config.numPieces>=30) {
					this.puzzleClap1.play();
					}
				this.drawingStack.pop(); // remove preview, no longer needed
				}
			this.draw();
			// mark puzzle as modified
			this.markAsDirty();
			return true;
			}
		return false;
		};
	// synchronize interface with current options
	this.syncUI = function() {
		function findOptionIndex(o,entry){
			var entries=o.options;
			for (var i=0; i<entries.length; i++) {
				if (entry==entries[i].value) {return i;}
				}
			return -1;
			}
		var opts=this.config;
		this.puzzleShowEdges.value=opts.showEdges?"Show all pieces":"Show edge pieces only";
		this.puzzleShowPreview.value=opts.showPreview?"Hide preview":"Show preview";
		this.puzzleCut.selectedIndex=findOptionIndex(this.puzzleCut,opts.cut);
		//this.puzzleScreenSize.selectedIndex=findOptionIndex(this.puzzleScreenSize,opts.screenSize);
		this.puzzleComplexity.selectedIndex=findOptionIndex(this.puzzleComplexity,opts.complexity);
		this.puzzleRotate.selectedIndex=findOptionIndex(this.puzzleRotate,opts.numRotateSteps);
		this.puzzlePieces.value=opts.numPieces;
		//this.puzzleURL.value=opts.src;
		};
	// mouse wheel handling: http://adomas.org/javascript-mouse-wheel/
	self.onmousewheel = function(e) {
		if (me.imoved<0 || me.config.numRotateSteps<=1) {return true;}
		var d=0;
		if(!e){e=self.e;}
		if(e.wheelDelta){d=e.wheelDelta;if(self.opera){d=-d;}}else if(e.detail){d=e.detail;}
		if (d) {
			var moved=me.drawingStack[me.imoved];
			if (moved.piece) {
				var drawBbox=moved.getDisplayBbox();
				moved.setAngleStep(moved.getAngleStep()+(d>0?1:-1));
				drawBbox.union(moved.getDisplayBboxConst());
				me.draw(drawBbox);
				}
			}
		if (e.preventDefault) {e.preventDefault();}
		e.returnValue=false;
		return false;
		};
	/** DOMMouseScroll is for mozilla. */
	gadgets.addEventListener(self,'DOMMouseScroll',self.onmousewheel);
	// persist and cleanup
	this.unload = function() {
		this.persist();
		// remove interface hooks
		//for (var iHook=0; iHook<this.interfaceHooks.length; iHook++) {
		//	delete this[this.interfaceHooks[iHook].id][this.interfaceHooks[iHook].name];
		//	}
		// remove event handlers
		if (this.canvas) {
			this.canvas.onclick=null;
			this.canvas.onmousemove=null;
			}
		self.onkeypress=null;
		gadgets.removeEventListener(self,'DOMMouseScroll',self.onmousewheel);
		self.onmousewheel=null;
		gadgets.removeEventListener(self,'unload',function(){me.unload();});
		// dissociate ourself from canvas object
		delete this.canvas.puzzle;
		// get rid of internal objects
		delete this.canvas;
		};
	//
	// Ctor code
	//
	// integrate canvas tag into html page
	this.canvas = canvas;
	if (!this.canvas || !this.canvas.getContext) {return;}
	this.canvas.puzzle=me;

	// default drawing stack
	this.imoved=-1; // the (drawing stack) index of the part being moved
	this.movedAnchor=new Point(); // the distance of the mouse position relative to the top-left corner of the piece being moved
	this.drawingStack=[];
	// cache references of important DOM elements
	var elems=document.querySelectorAll('[id^="puzzle"]');
	for (var iElem=0; iElem<elems.length; iElem++) {
		var e=elems[iElem];
		this[e.id]=e;
		}
	// interface hooks
	this.puzzleShowEdges['toggleEdges']=function(){
		me.config.showEdges=!me.config.showEdges;
		me.syncUI();
		me.draw();
		};
	this.puzzleShowPreview['togglePreview']=function(){
		me.config.showPreview=!me.config.showPreview;
		if (me.previewTile) {me.previewTile.hidden=!me.config.showPreview;}
		me.syncUI();
		me.draw();
		};
	/*this.puzzleCreate['createPuzzle']=function(){
		var prefs={
			cut:me.puzzleCut.options[me.puzzleCut.selectedIndex].value,
			screenSize:me.puzzleScreenSize.options[me.puzzleScreenSize.selectedIndex].value,
			complexity:me.puzzleComplexity.options[me.puzzleComplexity.selectedIndex].value,
			numRotateSteps:me.puzzleRotate.options[me.puzzleRotate.selectedIndex].value,
			numPieces:me.puzzlePieces.value,
			src:me.puzzleURL.value
			};
		me.create(prefs);
		self.puzzleGadgetTabs.setSelectedTab(0);
		// mark puzzle as modified
		me.markAsDirty();
		me.draw();
		};
	this.puzzleGenerateKey['generatePuzzleKey']=function(){
		me.puzzleKeyOut.value=me.generateKey();
		};
	this.puzzleGeneratePermalink['generatePuzzlePermalink']=function(){
		var loc=self.location;
		var url=(!self.gadgets.fake?'http://www.raymondhill.net/puzzle-rhill/jigsawpuzzle-rhill.php':loc.protocol+'//'+loc.host+loc.pathname)+'?puzzleKey='+me.generateKey();
		me.puzzlePermalink.value=url;
		};
	this.puzzleKeyInCreate['createPuzzleFromKey']=function(){
		var input=me.puzzleKeyIn.value;
		if (input.length>0) {
			var config={key:input};
			me.create(config);
			self.puzzleGadgetTabs.setSelectedTab(0);
			me.syncUI();
			me.markAsDirty();
			}
		};
	// request presets from server
	this.presetClickHandler=function() {
		var parms={
			view:'full',
			src:this.src.replace('thumbnail-','full-'),
			cut:'classic',
			screenSize:me.puzzlePreferredSize.value,
			numPieces:me.puzzlePreferredNumPieces.value,
			complexity:1,
			rotate:24,
			showPreview:false
			};
		var prefs=new self.gadgets.Prefs();
		prefs.set("jigsawpuzzle_rhill_prefs",'{"size":"'+me.puzzlePreferredSize.value+'","numPieces":'+me.puzzlePreferredNumPieces.value+'}');
		me.create(parms);
		self.puzzleGadgetTabs.setSelectedTab(0);
		me.markAsDirty();
		me.draw();
		};
	// assign a click handler for presets
	var imgs=this.puzzleTabPresets.getElementsByTagName('img');
	for (var iImg=0; iImg<imgs.length; iImg++) {
		imgs[iImg].onclick=me.presetClickHandler;
		}*/
	// final steps: create the puzzle
	this.create(puzzleOptions);
	this.syncUI();
	//
	// event handlers
	//
	gadgets.addEventListener(self,'unload',function(){me.unload();});
	this.canvas.onmousedown = function (e) {
		if (me.imoved >= 0)
			return; // ignore if we are already moving a piece

		var pos=me.normalizeEventPos(e);
		var ipart=me.partUnderPoint(pos);
		if (ipart>=0) {
			// bring on top
			me.imoved=me.sendTop(ipart);
			var moved=me.drawingStack[me.imoved];
			var dPos=moved.getDisplayPos();
			me.movedAnchor.x=pos.x-dPos.x;
			me.movedAnchor.y=pos.y-dPos.y;
			me.draw(moved.getDisplayBbox());
			this.style.cursor="-moz-grabbing";
		}
	};
	this.canvas.onmouseup = function (e) {
		var imoved=me.imoved;
		me.imoved=-1;
		if (imoved>= 0) {
			// is this a piece of puzzle?
			if (me.drawingStack[imoved].piece) {
				if (!me.snapPiece(imoved)) {
					me.config.showComposite=false; // for convenience
				}
			}
			me.draw();
			this.style.cursor="-moz-grab";
		}
	};
	this.canvas.onmousemove = function(e) {
		var pos=me.normalizeEventPos(e);
		if (me.imoved<0) {
			this.style.cursor=me.partUnderPoint(pos)>=0?"-moz-grab":"auto";
			}
		else {
			var moved=me.drawingStack[me.imoved];
			var drawBbox=moved.getDisplayBbox();
			moved.setDisplayPos(pos.x-me.movedAnchor.x,pos.y-me.movedAnchor.y);
			drawBbox.union(moved.getDisplayBboxConst());
			me.draw(drawBbox);
			}
		};
	self.onkeypress = function(e) {
		if (!e) {e=self.window.event;}
		var code=e.keyCode?e.keyCode:(e.which?e.which:0);
		// prefilter according to key code
		switch (code) {
			// rotate moved piece left
			case 37: // left arrow
			case 65: // 'A'
			case 97: // 'a'
			// rotate moved piece right
			case 39: // right arrow
			case 68: // 'D'
			case 100: // 'd'
			// send moved piece to the top of drawing stack
			case 38: // up arrow
			case 87: // 'W'
			case 119: // 'w'
			// send moved piece to the bottom of drawing stack
			case 40: // down arrow
			case 83: // 'S'
			case 115: // 's'
				if (me.imoved<0) {return true;}
				var moved=me.drawingStack[me.imoved];
				if (!moved.piece) {return true;}
				break;
			// toggle show composite pieces only
			case 32: // space
			// toggle edge pieces visibility
			case 69: // 'E'
			case 101: // 'e'
			// toggle preview tile visibility
			case 81: // 'Q'
			case 113: // 'q'
				break;
			default:
				return true;
			}
		// process
		var drawBbox;
		switch (code) {
			// rotate moved piece left
			case 37: // left arrow
			case 65: // 'A'
			case 97: // 'a'
				if (me.config.numRotateSteps <= 1) {return true;}
				drawBbox=moved.getDisplayBbox();
				moved.setAngleStep(moved.getAngleStep()-1);
				break;
			// rotate moved piece right
			case 39: // right arrow
			case 68: // 'D'
			case 100: // 'd'
				if (me.config.numRotateSteps <= 1) {return true;}
				drawBbox=moved.getDisplayBbox();
				moved.setAngleStep(moved.getAngleStep()+1);
				break;
			// send moved piece to the top of drawing stack
			case 38: // up arrow
			case 87: // 'W'
			case 119: // 'w'
				drawBbox=moved.getDisplayBbox();
				me.imoved=me.sendTop(me.imoved);
				break;
			// send moved piece to the bottom of drawing stack
			case 40: // down arrow
			case 83: // 'S'
			case 115: // 's'
				drawBbox=moved.getDisplayBbox();
				me.imoved=me.sendBack(me.imoved);
				break;
			// toggle show composite pieces only
			case 32: // space
				me.config.showComposite=!me.config.showComposite;
				me.draw();
				break;
			// toggle edge pieces visibility
			case 69: // 'E'
			case 101: // 'e'
				me.puzzleShowEdges.toggleEdges();
				break;
			// toggle preview tile visibility
			case 81: // 'Q'
			case 113: // 'q'
				me.puzzleShowPreview.togglePreview();
				break;
			default:
				return true;
			}
		if (drawBbox) {
			drawBbox.union(moved.getDisplayBboxConst());
			me.draw(drawBbox);
			}
		return false;
		};
	}
