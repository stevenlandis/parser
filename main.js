var pl = new PatternList();

// var l1 = pl.Literal('a');
// var l2 = pl.Literal('b');
// var l3 = pl.Literal('c');

// pl.List([
// 	pl.Repeat(l2),
// 	pl.Repeat(l1),
// 	pl.Repeat(l3)
// ]);

// var letter = pl.Range([['a','z'],['A','Z']]);

// var word = pl.Named('word', pl.List([letter,pl.Repeat(letter)]));

// var VAR = pl.String('var');
// var FOR = pl.String('for');

// var keyWords = pl.Named('keyWords', pl.Or([VAR,FOR]));

// var identifier = pl.Except(word, keyWords);

// var numeral = pl.Range([['0','9']]);
// var number = pl.Named('number', pl.List([numeral, pl.Repeat(numeral)]));

// var wsc = pl.Or([pl.Literal(' '), pl.Literal('\t'), pl.Literal('\n')]);

// var rws = pl.Repeat(wsc);
// var ws = pl.Named('whitespace', pl.List([wsc, rws]));

// var init = pl.Named('init', pl.List([
// 	VAR,
// 	ws,
// 	identifier,
// 	ws,
// 	pl.Literal('='),
// 	ws,
// 	number,
// 	pl.Literal(';')
// ]));

// var assignment = pl.Named('assignment', pl.List([
// 	identifier,
// 	ws,
// 	pl.Literal('='),
// 	ws,
// 	number,
// 	pl.Literal(';')
// ]));

// var expression = pl.Named('expression', pl.Or([
// 	init, assignment
// ]));

var letter = pl.Range([['a','z'],['A','Z']]);

var word = pl.List([letter,pl.Repeat(letter)]);

var VAR = pl.String('var');
var FOR = pl.String('for');

var keyWords = pl.Or([VAR,FOR]);

var identifier = word;

var numeral = pl.Range([['0','9']]);
var number = pl.List([numeral, pl.Repeat(numeral)]);

var wsc = pl.Or([pl.Literal(' '), pl.Literal('\t'), pl.Literal('\n')]);

var rws = pl.Repeat(wsc);
var ws = pl.List([wsc, rws]);

var init = pl.List([
	VAR,
	ws,
	identifier,
	rws,
	pl.Literal('='),
	pl.Literal('='),
	rws,
	number,
	pl.Literal(';')
]);

var assignment = pl.List([
	identifier,
	ws,
	pl.Literal('='),
	pl.Literal('='),
	ws,
	number,
	pl.Literal(';')
]);

var expression = pl.Or([
	init, assignment
]);

// var container = pl.Reserve();

// pl.defineNamed(container, 'container', pl.List([
// 	pl.Literal('('),
// 	pl.Or([word, container]),
// 	pl.Literal(')')
// ]));

// var thing = pl.Reserve();

// pl.defineNamed(thing, 'thing', pl.Or([word,pl.List([thing, pl.Literal(')')])]));

// var wsc = pl.Or([pl.Literal(' '), pl.Literal('\t'), pl.Literal('\n')]);

// var rws = pl.Repeat(wsc)

// var ws = pl.Named('whitespace', pl.List([wsc, rws]));

// var ows = pl.Named('optional whitespace', rws);

// var spaceList = pl.Named('space list', pl.List([
// 	word,
// 	ws,
// 	word,
// 	pl.Repeat(pl.List([ws, word]))
// ]));


pl.init();
// pl.disp();

var grouper = new Grouper(pl, 'var i == 12345;', expression);

// push up
grouper.addMove(
	// valid index
	function() {
		return this.index === 0;
	},

	// can do
	function() {
		if (this.grouper.downStack.length === 0) {
			return false;
		}
		var upNode = this.grouper.upNode;
		var downNode = this.grouper.downNode;

		return upNode.isBelow(downNode);
	},

	// do
	function() {
		pr('Pushing Up');
		this.grouper.upStack.push(this.grouper.downStack.pop());
	},

	// undo
	function() {
		pr('Undo: Pushing Up');
		this.grouper.downStack.push(this.grouper.upStack.pop());
	}
);

// collapse
grouper.addMove(
	// valid index
	function() {
		return this.index === 0;
	},

	// can do
	function() {
		var grandparent = this.grouper.grandparent;
		var upNode = this.grouper.upNode;

		return upNode.complete && grandparent.isDirectlyBelow(upNode);
	},

	// do
	function() {
		pr('Collapsing');
		var grandparent = this.grouper.grandparent;
		var upNode = this.grouper.upNode;

		grandparent.add(upNode);

		if (this.grouper.upStack.length === 1) {
			this.grouper.upStack[0] = grandparent;
		} else {
			this.grouper.upStack.pop();
		}
	},

	// undo
	function() {
		pr('Undo: Collapse');
		var upNode = this.grouper.upNode;
		var pat = upNode.pop();

		this.grouper.upStack.push(pat);
	}
);

// upgrade
grouper.addMove(
	// valid index
	function() {
		var upNode = this.grouper.upNode;
		return this.index < upNode.parents.length;
	},

	// can do
	function() {
		var upNode = this.grouper.upNode;

		if (!upNode.complete) {
			return false;
		}

		var grandparent = this.grouper.grandparent;
		var parentUpgrade = upNode.parents[this.index];

		if (parentUpgrade[1] !== 0) {
			return false;
		}

		var testPO = this.grouper.pl.getPO(parentUpgrade[0]);

		return grandparent.isBelow(testPO);
	},

	// do
	function() {
		pr('Upgrading');
		var upNode = this.grouper.upNode;
		var parentUpgrade = upNode.parents[this.index];

		var testPO = this.grouper.pl.getPO(parentUpgrade[0]);
		testPO.add(upNode);

		this.grouper.upStack.pop();
		this.grouper.upStack.push(testPO);
	},

	// undo
	function() {
		pr('Undo: Upgrade');
		var pat = this.grouper.upNode.pop();
		this.grouper.upStack.pop();
		this.grouper.upStack.push(pat);
	}
);

// cycle
grouper.addMove(
	// valid index
	function() {
		var downNode = this.grouper.downNode;

		if (downNode.constructor !== LiteralPO) {
			return false;
		}

		if (this.index === 0 && downNode.choiceI !== 0) {
			return false;
		}

		return downNode.canChoose(this.index + 1);
	},

	// can do
	function() {
		return true;
	},

	// do
	function() {
		pr('Cycling');
		var downNode = this.grouper.downNode;

		downNode.choose(this.index+1);
	},

	// undo
	function() {
		pr('Undo: Cycling');
		var downNode = this.grouper.downNode;

		downNode.choose(0);
	}
);

// skip
grouper.addMove(
	// valid index
	function() {
		return this.index === 0;
	},

	// can do
	function() {
		var upNode = this.grouper.upNode;

		if (upNode.constructor !== PatternPO) {
			return false;
		}

		return upNode.canSkip();
	},

	// do
	function() {
		this.grouper.upNode.skip();
	},

	// undo
	function() {
		this.grouper.upNode.unSkip();
	}
);

grouper.group2();

// pl.group2('Hi there', 19);