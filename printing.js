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