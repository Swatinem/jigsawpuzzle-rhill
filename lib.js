var libs = {
	Point: 'point',
	Segment: 'segment',
	Bbox: 'bbox',
	Bezier: 'bezier',
	Profile: 'profile'
};
for (var name in libs) {
	var path = './lib/' + libs[name];
	exports[name] = require(path);
}
