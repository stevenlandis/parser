var tabN = 0;
var tabChar = "   "

function pr(text) {
	if (tabN === 0) {
		console.log(text);
		return;
	}
	text = ""+text;
	var tabText = "";
	for (var i = 0; i < tabN; i++) {
		tabText += tabChar;
	}
	console.log(tabText + text.replace(/\n/g, "\n" + tabText));
}

function pi() {
	tabN++;
}

function pd() {
	if (tabN > 0) {
		tabN--;
	}
}

function assert(a) {
	if (!a) {
		throw Error('Assert Failed');
	}
}

Set.prototype.union = function(b) {
	var res = new Set(this);
	for (var elem of b) {
		res.add(elem);
	}
	return res;
};

Set.prototype.combine = function(setB) {
	for (var elem of setB) {
		this.add(elem);
	}
};