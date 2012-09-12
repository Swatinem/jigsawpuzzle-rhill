module.exports = ProfileRandomizer;
var Profile = require('./profile');

// Profile randomizer object
function ProfileRandomizer(profileNormalized,allowComplement,wobbleFactor) {
	this.normalized=new Profile(profileNormalized);
	this.allowComplement=allowComplement;
	this.wobbleFactor=wobbleFactor!==undefined?wobbleFactor:0;
	}
ProfileRandomizer.prototype.randomize = function() {
	// 50% of returning complement
	var r;
	if (this.allowComplement && Math.random() >= 0.5) {
		r=this.normalized.complement();
		}
	else {
		r=new Profile(this.normalized);
		}
	// here, optionally wobbling points/control points around their normalized position
	return r;
	};
