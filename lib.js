var libs = {
	Point: 'point',
	Segment: 'segment',
	Bbox: 'bbox',
	Bezier: 'bezier',
	Profile: 'profile',
	ProfileRandomizer: 'profilerandomizer',
	Side: 'side',
	Contour: 'contour',
	Polygon: 'polygon',
	PuzzleTile: 'puzzletile',
	PuzzleSourceTile: 'puzzlesourcetile',
	PuzzleTransientTile: 'puzzletransienttile',
	PuzzleDisplayTile: 'puzzledisplaytile',
	PuzzlePart: 'puzzlepart',
	PuzzlePiece: 'puzzlepiece',
	PuzzlePreview: 'puzzlepreview',
	PuzzleBed: 'puzzlebed'
};
for (var name in libs) {
	var path = './lib/' + libs[name];
	exports[name] = require(path);
}
