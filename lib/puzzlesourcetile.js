module.exports = PuzzleSourceTile;
var PuzzleTile = require('./puzzletile');


/**
  Source tile descriptor
 */
function PuzzleSourceTile(img) {
	PuzzleTile.call(this);
	this.sImage = img;
	}
PuzzleSourceTile.prototype = new PuzzleTile();
PuzzleSourceTile.prototype.getSourceImage = function() {
	return this.sImage;
	};
