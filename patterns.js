class Pattern {
	constructor(id, pl) {
		this.id = id;
		this.pl = pl;
		this.parents = new Set();
		this.allParents = new Set();
		this.children = new Set();
		this.allChildren = new Set();
		this.firstPatterns = new Set();
		this.firstParents = new Set();
		this.lastPatterns = new Set();

		this.nextPatterns = new Set();
		this.nextLiteralPatterns = new Set();
		this.nextObjects = new ObjectRange();

		this.nextLiteralRange = new CharRange();
		this.nextUpPatterns = [];
		this.nextUpRanges = [];
		this.ups = [];
		this.firstUps = [];
		this.name = '';
	}
	get optional() {
		return this.minSize === 0;
	}
}

class List extends Pattern {
	constructor(list, id, pl) {
		super(id, pl);
		this.list = list;
		for (var i of list) {
			this.children.add(i);
		}
		this.isLiteral = false;
		this.defaultFilled = false;
		this.defaultComplete = false;
		this._endIndex = undefined;
	}
	isFilled(index) {
		if (index < this.list.length) {
			return false;
		}
		return true;
	}
	isComplete(index) {
		return index >= this.endIndex;
	}
	following(index) {
		var res = new Set();

		// loop through all elements following index
		for (var i = index+1; i < this.list.length; i++) {

			// get the pattern at the list index
			var pat = this.pl.get(this.list[i]);

			// add all the first patterns
			res.combine(pat.firstPatterns);
			res.add(pat.id);

			// if the pattern is not optional, end it
			if (pat.minSize !== 0) {
				break;
			}
		}
		return res;
	}
	isEnd(index) {
		// loop through all elements following index
		for (var i = index+1; i < this.list.length; i++) {

			// get the pattern at the list index
			var pat = this.pl.get(this.list[i]);

			// if the pattern is not optional, return false
			if (pat.minSize !== 0) {
				return false;
			}
		}

		// if the loop can finish:
		return true;
	}
	get childs() {
		var res = [];
		for (var i in this.list) {
			res.push([this.list[i], i]);
		}
		return res;
	}
	get string() {
		if (this.name !== '') {
			return this.name;
		}
		var res = '[';
		for (var i in this.list) {
			if (i > 0) {
				res += ', ';
			}
			res += this.pl.patterns[this.list[i]].string;
		}
		return res + ']';
	}
	get first() {
		var res = [];
		var node = undefined;
		for (var i = 0; i < this.list.length; i++) {
			res.push(this.list[i]);
			node = this.pl.get(this.list[i]);
			if (!(node.constructor === Repeat || node.constructor === Ignorable)) {
				break;
			}
		}
		return res;
	}
	get last() {
		var res = [];
		var node = undefined;
		for (var i = this.list.length-1; i >= 0; i--) {
			res.push(this.list[i]);
			node = this.pl.get(this.list[i]);
			if (!(node.constructor === Repeat || node.constructor === Ignorable)) {
				break;
			}
		}
		return res;
	}
	get endIndex() {
		if (this._endIndex === undefined) {
			var found = false;
			for (var i = this.list.length-1; i >= 0; i--) {
				var node = this.pl.get(this.list[i]);
				if (!(node.constructor === Repeat || node.constructor === Ignorable)) {
					this._endIndex = i+1;
					found = true;
					break;
				}
			}
			if (!found) {
				this._endIndex = 0;
			}
		}
		return this._endIndex;
	}
	get firstSolidIndex() {
		for (var i in this.list) {
			var pat = this.pl.get(this.list[i]);
			if (pat.minSize !== 0) {
				return parseInt(i);
			}
		}
		return this.list.length;
	}
	isBelow(id, index) {

		// make sure that the index is valid
		if (index >= this.list.length) {
			return false;
		}

		if (this.list[index] === id) {
			return true;
		}

		// now check to see if ID is in the firsts of list[index]
		var pat = this.pl.get(this.list[index]);
		if (pat.firstPatterns.has(id)) {
			return true;
		}

		return false;
	}
	isDirectlyBelow(id, index) {
		// make sure that the index is valid
		if (index >= this.list.length) {
			return false;
		}

		// if the ID is a direct match, true
		return this.list[index] === id;
	}
	canSkip(index) {
		if (index >= this.list.length) {
			return false;
		}

		return this.pl.get(this.list[index]).minSize === 0;		
	}
	isMatch(index, thing) {
		if (typeof thing !== 'number') {
			return false;
		}
		if (index >= this.list.length) {
			return false;
		}
		return this.list[index] === thing;
	}
	isPossibleMatch(index, thing) {
		if (typeof thing !== 'number') {
			return false;
		}
		if (this.isMatch(index, thing)) {
			return true;
		}
		if (index >= this.list.length) {
			var pat = this.pl.get(this.list[index]);
			return pat.firstPatterns.has(thing);
		}
		return false;
	}
	down(index) {
		if (index >= this.list.length) {
			return [];
		}
		return [this.list[index]];
	}
	get minSize() {
		if (this._minSize === undefined) {
			this._minSize = 0;
			for (var i of this.list) {
				var pat = this.pl.get(i);
				this._minSize += pat.minSize;
			}
		}
		return this._minSize;
	}
	get maxSize() {
		if (this._maxSize === undefined) {
			this._maxSize = 0;
			for (var i of this.list) {
				var size = this.pl.get(i).maxSize;
				if (size === -1) {
					this._maxSize = -1;
					return -1;
				}
				this._maxSize += size;
			}
		}
		return this._maxSize;
	}
	equals(n) {
		if (this.constructor !== n.constructor) {
			return false;
		}
		if (this.list.length !== n.list.length) {
			return false;
		}
		for (var i in this.list) {
			if (this.list[i] !== n.list[i]) {
				return false;
			}
		}
		return true;
	}
}

class Or extends Pattern {
	constructor(patterns, id, pl) {
		super(id, pl);
		this.patterns = patterns;
		for (var i in patterns) {
			this.children.add(patterns[i]);
		}
		this.isLiteral = false;

		this.defaultFilled = false;
		this.defaultComplete = false;

		this.firstSolidIndex = 0;
	}
	isFilled(index) {
		if (index === 0) {
			return false;
		}
		return true;
	}
	isComplete(index) {
		return this.isFilled(index);
	}
	following(index) {
		// the or pattern has no internal following patterns
		// so return empty set
		return new Set();
	}
	isEnd(index) {
		// the or pattern only holds one pattern, so always true
		return true;
	}
	isBelow(id, index) {
		if (this.isDirectlyBelow(id, index)) {
			return true;
		}

		// make sure that the index is valid
		if (index !== 0) {
			return false;
		}

		// if the ID is a direct match, true
		for (var i of this.patterns) {
			if (i === id) {
				return true;
			}
		}

		// now check to see if ID is in the firsts of list[index]
		for (var i of this.patterns) {
			var fps = this.pl.get(i).firstPatterns;
			if (fps.has(id)) {
				return true;
			}
		}

		return false;
	}
	isDirectlyBelow(id, index) {

		// make sure that the index is valid
		if (index !== 0) {
			return false;
		}

		// if the ID is a direct match, true
		for (var i of this.patterns) {
			if (i === id) {
				return true;
			}
		}

		return false;
	}
	canSkip(index) {
		if (index !== 0) {
			return false;
		}

		return this.minSize === 0;
	}
	get childs() {
		var res = [];
		for (var i of this.patterns) {
			res.push([i, 0]);
		}
		return res;
	}
	get string() {
		if (this.name !== '') {
			return this.name;
		}
		var res = '{';
		for (var i in this.patterns) {
			if (i > 0) {
				res += ' or ';
			}
			res += this.pl.patterns[this.patterns[i]].string;
		}
		return res + '}';
	}
	get first() {
		var res = [];
		for (var i of this.patterns) {
			res.push(i);
		}
		return res;
	}
	get last() {
		return this.first;
	}
	down(index) {
		if (index === 0) {
			return this.patterns;
		}
		return undefined;
	}
	isMatch(index, thing) {
		if (typeof thing !== 'number') {
			return false;
		}
		if (index === 0) {
			for (var i of this.patterns) {
				if (thing === i) {
					return true;
				}
			}
		}
		return false;
	}
	isPossibleMatch(index, thing) {
		if (typeof thing !== 'number') {
			return false;
		}
		if (index === 0) {
			return this.firstPatterns.has(thing);
		}
		return false;
	}
	get minSize() {
		if (this._minSize === undefined) {
			this._minSize = this.pl.get(this.patterns[0]).minSize;
			for (var i = 1; i < this.patterns.length; i++) {
				this._minSize = Math.min(this._minSize, this.pl.get(this.patterns[i]).minSize);
			}
		}
		return this._minSize;
	}
	get maxSize() {
		if (this._maxSize === undefined) {
			this._maxSize = 0;
			for (var i of this.patterns) {
				var size = this.pl.get(i).maxSize;
				if (size === -1) {
					this._maxSize = -1;
					return -1;
				}
				this._maxSize = Math.max(this._maxSize, size);
			}
		}
		return this._maxSize;
	}
	equals(n) {
		if (this.constructor !== n.constructor) {
			return false;
		}
		if (this.patterns.length !== n.patterns.length) {
			return false
		}
		for (var i in this.patterns) {
			if (this.patterns[i] !== n.patterns[i]) {
				return false;
			}
		}
		return true;
	}
}

class Repeat extends Pattern {
	constructor(pattern, id, pl) {
		super(id, pl);
		this.pattern = pattern;
		this.children.add(pattern);
		this.isLiteral = false;
		this.minSize = 0;
		this.maxSize = -1;

		this.defaultFilled = false;
		this.defaultComplete = true;

		this.childs = [[this.pattern, 0]];

		this.firstSolidIndex = 0;
	}
	isFilled(index) {
		return false;
	}
	isComplete(index) {
		return true;
	}
	following(index) {
		// the possible followers are the firsts of pattern
		var pat = this.pl.get(this.pattern);

		var res = new Set(pat.firstPatterns);
		res.add(pat.id);

		return res;
	}
	isEnd(index) {
		// as the following patterns are all optional, true
		return true;
	}
	isBelow(id, index) {
		// all indexes are valid
		// if the ID is a direct match, true
		if (this.pattern === id) {
			return true;
		}

		var pat = this.pl.get(this.pattern);
		if (pat.firstPatterns.has(id)) {
			return true;
		}

		return false;
	}
	isDirectlyBelow(id, index) {
		return this.pattern === id;
	}
	canSkip(index) {
		return false;
	}
	get string() {
		if (this.name !== '') {
			return this.name;
		}
		return 'Repeat ' + this.pl.patterns[this.pattern].string + '';
	}
	get first() {
		return [this.pattern];
	}
	get last() {
		return [this.pattern];
	}
	setMinSize() {
		this.minSize = 0;
	}
	equals(n) {
		if (this.constructor !== n.constructor) {
			return false;
		}
		return this.pattern === n.pattern;
	}
}

class Literal extends Pattern {
	constructor(char, id, pl) {
		super(id, pl);
		this.char = char;
		this.range = new CharRange([[char, char]]);
		this.isLiteral = true;
		this.minSize = 1;
		this.maxSize = 1;

		this.defaultFilled = false;
		this.defaultComplete = false;

		this.childs = [];

		this.firstSolidIndex = 0;
	}
	contains(char) {
		return this.char === char;
	}
	following(index) {
		// nothing
		return new Set();
	}
	isEnd(index) {
		return true;
	}
	isFilled(index) {
		if (index === 0) {
			return false;
		}
		return true;
	}
	isComplete(index) {
		return this.isFilled(index);
	}
	isBelow() {
		return false;
	}
	isDirectlyBelow() {
		return false;
	}
	canSkip() {
		return false;
	}
	get string() {
		var c = this.char;
		if (c === '\t') {
			c = '\\t';
		} else if (c === '\n') {
			c = '\\n';
		}
		return "'" + c + "'";
	}
	get first() {
		return [];
	}
	get last() {
		return [];
	}
	isMatch(index, thing) {
		if (index === 0) {
			return this.char === thing;
		}
		return false;
	}
	isPossibleMatch(index, thing) {
		if (index === 0) {
			return this.char === thing;
		}
		return false;
	}
	down(index) {
		if (index == 0) {
			return [];
		}
		return undefined;
	}
	setMinSize() {
		this.minSize = 1;
	}
	equals(n) {
		if (this.constructor !== n.constructor) {
			return false;
		}
		return this.char === n.char;
	}
}

class Range extends Pattern {
	constructor(ranges, id, pl) {
		super(id, pl);

		this.range = new CharRange(ranges);

		this.isLiteral = true;
		this.minSize = 1;
		this.maxSize = 1;

		this.defaultFilled = false;
		this.defaultComplete = false;

		this.childs = [];

		this.firstSolidIndex = 0;
	}
	isFilled(index) {
		if (index === 0) {
			return false;
		}
		return true;
	}
	isComplete(index) {
		return this.isFilled(index);
	}
	contains(char) {
		return this.range.has(char);
	}
	following(index) {
		// nothing
		return new Set();
	}
	isEnd(index) {
		return true;
	}
	isBelow() {
		return false;
	}
	isDirectlyBelow() {
		return false;
	}
	canSkip() {
		return false;
	}
	get string() {
		return this.range.str;
	}
	get first() {
		return [];
	}
	get last() {
		return [];
	}
	isMatch(index, thing) {
		if (typeof thing === 'string' && index === 0) {
			return this.contains(thing);
		}
		return false;
	}
	isPossibleMatch(index, thing) {
		if (typeof thing === 'string' && index === 0) {
			return this.contains(thing);
		}
		return false;
	}
	down(index) {
		if (index == 0) {
			return [];
		}
		return undefined;
	}
	setMinSize() {
		this.minSize = this.pl.get(pattern).minSize;
	}
	equals(n) {
		if (this.constructor !== n.constructor) {
			return false;
		}
		return CharRange.equals(this.range, n.range);
	}
}

class Ignorable extends Pattern {
	constructor(pattern, id, pl) {
		super(id, pl);
		this.pattern = pattern;
		this.children.add(pattern);
		this.isLiteral = false;
		this.minSize = 0;

		this.childs = [[this.pattern, 0]];

		this.defaultFilled = false;
		this.defaultComplete = true;
		this.firstSolidIndex = 0;
	}
	isFilled(index) {
		if (index === 0) {
			return false;
		}
		return true;
	}
	isComplete(index) {
		return true;
	}
	following(index) {
		// the or pattern has no internal following patterns
		// so return empty set
		return new Set();
	}
	isEnd(index) {
		// the or pattern only holds one pattern, so always true
		return true;
	}
	isBelow(id, index) {
		// make sure that the index is valid
		if (index !== 0) {
			return false;
		}

		// all indexes are valid
		// if the ID is a direct match, true
		if (this.pattern === id) {
			return true;
		}

		var pat = this.pl.get(this.pattern);
		if (pat.firstPatterns.has(id)) {
			return true;
		}

		return false;
	}
	isDirectlyBelow(id, index) {
		// make sure that the index is valid
		if (index !== 0) {
			return false;
		}

		return this.pattern === id;
	}
	canSkip(index) {
		if (index !== 0) {
			return false;
		}

		return this.minSize === 0;
	}

	get string() {
		return 'Ignore ' + this.pl.get(this.pattern).string + '';
	}
	get first() {
		return [this.pattern];
	}
	get last() {
		return [this.pattern];
	}
	setMinSize() {
		this.minSize = 0;
	}
	get maxSize() {
		if (this._maxSize === undefined) {
			this._maxSize = this.pl.get(this.pattern).maxSize;
		}
		return this._maxSize;
	}
	equals(n) {
		if (this.constructor !== n.constructor) {
			return false;
		}
		return this.pattern === n.pattern;
	}
}

class Except extends Pattern {
	constructor(pattern, not, id, pl) {
		super(id, pl);
		this.pattern = pattern;
		this.not = not;

		this.children.add(pattern);
		//don't add the not

		this.isLiteral = false;

		this.defaultFilled = false;
		this.defaultComplete = false;

		this.childs = [[this.pattern, 0]];

		this.firstSolidIndex = 0;
	}
	isFilled(index) {
		if (index === 0) {
			return false;
		}
		return true;
	}
	isComplete(index, po) {
		// make sure there is something
		if (index === 0) {
			return false;
		}

		// make sure that thing is not the not
		var text = po.source;
		var g = this.pl.group(text, this.not);

		// return if g has finished (it matches not)
		return !g.finished;
	}
	following(index) {
		// no internal following patterns
		return new Set();
	}
	isEnd(index) {
		// Except only holds one pattern, so always the end
		return true;
	}
	isBelow(id, index) {
		if (this.isDirectlyBelow(id, index)) {
			return true;
		}

		// make sure the index is valid
		if (index !== 0) {
			return false;
		}

		var pat = this.pl.get(this.pattern);
		if (pat.firstPatterns.has(id)) {
			return true;
		}

		return false;
	}
	isDirectlyBelow(id, index) {
		return this.pattern === id;
	}
	canSkip(index) {
		return index === 0 && this.minSize === 0;
	}

	get string() {
		return 'Except' + this.pl.get(this.pattern).string + ' and not ' + this.pl.get(this.not).string;
	}
	get first() {
		return [this.pattern];
	}
	get last() {
		return [this.pattern];
	}
	get minSize() {
		if (this._minSize === undefined) {
			this._minSize = this.pl.get(this.pattern).minSize;
		}
		return this._minSize;
	}
	get maxSize() {
		if (this._maxSize === undefined) {
			this._maxSize = this.pl.get(this.pattern).maxSize;
		}
		return this._maxSize;
	}
	equals(n) {
		if (this.constructor !== n.constructor) {
			return false;
		}
		return this.pattern === n.pattern &&
			this.not === n.not;
	}
}