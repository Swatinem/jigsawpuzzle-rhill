var Puzzle = require('./puzzle');
var file = require('file');


function stop(ev) {
	ev.stopPropagation();
	ev.preventDefault();
}

/*** Resize canvas ***/
var header = document.querySelector('header');
var canvas = document.getElementById('canvas');
var overlay = document.getElementById('overlay');
canvas.height = window.innerHeight - header.offsetHeight;
canvas.width = window.innerWidth;
canvas.backgroundColor = 'white';

/*** URL for the Canvas ***/
var url;

/*** Drag&Drop ***/
var body = document.querySelector('body');
body.addEventListener("dragover", function(ev) {
	stop(ev);
});
body.addEventListener("dragenter", function(ev) {
	var dt = ev.dataTransfer;
	var hasFiles = false;
	for (var i in dt.types) {
		hasFiles = hasFiles || dt.types[i] == "Files";
	}
	if (hasFiles)
		stop(ev);
}, false);
body.addEventListener("drop", function(ev) {
	stop(ev);
	// TODO: use file.is()
	file(ev.dataTransfer.files[0]).toDataURL(function (err, str) {
		gotUrl(str);
	});
}, false);

/*** Upload ***/
var upload = document.querySelector('#upload');
document.querySelector('.upload').addEventListener('click', function () { upload.click(); }, false);
upload.addEventListener('change', function () {
	// TODO: use file.is()
	file(upload.files[0]).toDataURL(function (err, str) {
		gotUrl(str);
	});
}, false);

/*** Paste URL ***/
var paste = document.querySelector('#paste');
paste.addEventListener('change', function () {
	gotUrl(paste.value);
}, false);
paste.addEventListener('keyup', function () {
	gotUrl(paste.value);
}, false);


/*** Preview and enable form ***/
var formElements = document.querySelectorAll('#form input, #form select');
var preview = document.querySelector('#image img');
function gotUrl(aUrl) {
	preview.src = url = aUrl;
	for (var i = 0; i < formElements.length; i++) {
		formElements[i].disabled = false;
	}
}
function resetForm() {
	preview.src = paste.value = url = '';
	for (var i = 0; i < formElements.length; i++) {
		formElements[i].disabled = true;
	}
}
resetForm();


/*** Form handling ***/
document.querySelector('#form').addEventListener('submit', function (ev) {
	stop(ev);
	overlay.style.display = 'none';
	new Puzzle(canvas,{
		view: 'mini',
		numPieces: parseInt(document.querySelector('#puzzlePieces').value) || 100,
		src: url,
		numRotateSteps: 1
	}).on('win', function () {
		overlay.className = 'won';
		overlay.style.display = 'block';
		resetForm();
	});
}, false);
