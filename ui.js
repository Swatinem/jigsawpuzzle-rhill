var emitter = require('emitter');

function stop(ev) {
	ev.stopPropagation();
	ev.preventDefault();
}

function UI() {
	emitter.call(this);

	var body = document.getElementsByTagName('body')[0];
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
	var self = this;
	body.addEventListener("drop", function(ev) {
		function tryFile() {
			if (!files[i])
				return;
			var file = files[i++];
			var reader = new FileReader();
			reader.onloadend = function(ev) {
				var content = ev.target.result;
				self.emit('file', content);
			}
			try {
				if (!~file.type.indexOf('image'))
					return tryFile();
				reader.readAsDataURL(file);
			} catch(e) {}
		}
		var dt = ev.dataTransfer;
		var files = dt.files;
		var i = 0;
		stop(ev);
		tryFile();
	}, false);
}
UI.prototype = Object.create(emitter.prototype);
module.exports = UI;
