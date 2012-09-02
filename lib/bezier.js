module.exports = Bezier;


// Bezier object
function Bezier(a) {
	Array.call(this);
	if (a instanceof Array) {
		this[0]=a[0]; // cx1
		this[1]=a[1]; // cy1
		this[2]=a[2]; // cx2
		this[3]=a[3]; // cy2
		this[4]=a[4]; // x
		this[5]=a[5]; // y
		}
	}
Bezier.prototype=[];
