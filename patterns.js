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
		this.ups = [];
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
	get childs() {
		var res = [];
		for (var i in this.list) {
			res.push([this.list[i], i]);
		}
		return res;
	}
	get string() {
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
			if (!(node.constructor === Repeat || node.constructor === Ignoreable)) {
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
			if (!(node.constructor === Repeat || node.constructor === Ignoreable)) {
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
				if (!(node.constructor === Repeat || node.constructor === Ignoreable)) {
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
	get childs() {
		var res = [];
		for (var i of this.patterns) {
			res.push([i, 0]);
		}
		return res;
	}
	get string() {
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
				this._minSize = Math.min(this._minSize, pl.get(this.patterns[i]).minSize);
			}
		}
		return this._minSize;
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

		this.defaultFilled = false;
		this.defaultComplete = true;

		this.childs = [[this.pattern, 0]];
	}
	isFilled(index) {
		return false;
	}
	isComplete(index) {
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
	get string() {
		return 'Repeat ' + this.pl.patterns[this.pattern].string + '';
	}
	get first() {
		return [this.pattern];
	}
	get last() {
		return [this.pattern];
	}
	isMatch(index, thing) {
		if (typeof thing !== 'number') {
			return false;
		}
		if (index === 0) {
			return this.pattern === thing;
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
	down(index) {
		if (index === 0) {
			return [undefined, this.pattern];
		}
		return undefined;
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
		this.isLiteral = true;
		this.minSize = 1;

		this.defaultFilled = false;
		this.defaultComplete = false;

		this.childs = [];
	}
	contains(char) {
		return this.char === char;
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

		//sort that list based on the first char
		for (var i = 1; i < ranges.length; i++) {
			for (var j = ranges.length-1; j >= i; j--) {
				if (ranges[j-1][0] > ranges[j][0]) {
					var temp = ranges[j-1];
					ranges[j-1] = ranges[j];
					ranges[j] = temp;
				}
			}
		}
		for (var i = 0; i < ranges.length-1; i++) {
			if (ranges[i+1][0] <= Range.nextChar(ranges[i][1])) {
				if (ranges[i][1] < ranges[i+1][1]) {
					ranges[i][1] = ranges[i+1][1]
				}
				ranges.splice(i+1, 1);
				i--;
			}
		}
		this.ranges = ranges;
		this.isLiteral = true;
		this.minSize = 1;

		this.defaultFilled = false;
		this.defaultComplete = false;

		this.childs = [];
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
		for (var r of this.ranges) {
			if (r[0] <= char && char <= r[1]) {
				return true;
			}
		}
		return false;
	}
	isBelow() {
		return false;
	}
	isDirectlyBelow() {
		return false;
	}
	get string() {
		var res = '';
		for (var r of this.ranges) {
			res += '<' + r + '>';
		}
		return res;
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
		return Range.rangeEquals(this.ranges, n.ranges);
	}
}
Range.nextChar = function(c) {
	return String.fromCharCode(c.charCodeAt(0)+1);
}
Range.rangeEquals = function(r1, r2) {
	if (r1.length !== r2.length) {
		return false;
	}
	for (var i in r1) {
		if (r1[i][0] !== r2[i][0] || r1[i][1] !== r2[i][1]) {
			return false;
		}
	}
	return true;
}






class Named extends Pattern {
	constructor(name, pattern, id, pl) {
		super(id, pl);
		this.name = name;
		this.pattern = pattern;
		this.children.add(pattern);
		this.isLiteral = false;

		this.defaultFilled = false;
		this.defaultComplete = false;
	}
	get string() {
		return '"' + this.name + '"';
	}
	get first() {
		return [this.pattern];
	}
	get last() {
		return [this.pattern];
	}
	down(index) {
		if (index === 0) {
			return [this.pattern];
		}
		return undefined;
	}
	isMatch(index, thing) {
		if (typeof thing !== 'number') {
			return false;
		}
		if (index === 0) {
			return thing === this.pattern;
		}
		return false;
	}
	isPossibleMatch(index, thing) {
		if (typeof thing !== 'number') {
			return false;
		}
		if (index === 0) {
			return this.allChildren.has(thing);
		}
		return false;
	}
	get minSize() {
		if (this._minSize === undefined) {
			this._minSize = this.pl.get(this.pattern).minSize;
		}
		return this._minSize;
	}
	equals(n) {
		if (this.constructor !== n.constructor) {
			return false;
		}
		return this.name === n.name && this.pattern === n.pattern;
	}
}

class Ignoreable extends Pattern {
	constructor(pattern, id, pl) {
		super(id, pl);
		this.pattern = pattern;
		this.children.add(pattern);
		this.isLiteral = false;
		this.minSize = 0;

		this.defaultFilled = false;
		this.defaultComplete = true;
	}
	get string() {
		return '[Ignore? ' + pl.get(this.id).string + ']';
	}
	get first() {
		return [this.pattern];
	}
	get last() {
		return [this.pattern];
	}
	down(index) {
		if (index === 0) {
			return [this.pattern];
		}
		return undefined;
	}
	isMatch(index, thing) {
		if (typeof thing !== 'number') {
			return false;
		}
		if (index === 0) {
			return this.pattern === thing;
		}
		return false;
	}
	isPossibleMatch(index, thing) {
		if (typeof thing !== 'number') {
			return false;
		}
		if (index === 0) {
			return this.allChildren.has(thing);
		}
		return false;
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
	}
	get string() {
		return '[' + this.pl.patterns[this.pattern].string + ' except ' + this.pl.patterns[this.not].string + ']';
	}
	get first() {
		return [this.pattern];
	}
	get last() {
		return [this.pattern];
	}
	down(index) {
		if (index === 0) {
			return [this.pattern];
		}
		return undefined;
	}
	isMatch(index, thing) {
		if (typeof thing !== 'number') {
			return false;
		}
		if (index === 0) {
			return this.pattern === thing;
		}
		return false;
	}
	isPossibleMatch(index, thing) {
		if (typeof thing !== 'number') {
			return false;
		}
		if (index === 0) {
			return this.allChildren.has(thing);
		}
		return false;
	}
	get minSize() {
		if (this._minSize === undefined) {
			this._minSize = this.pl.get(this.pattern).minSize;
		}
		return this._minSize;
	}
	equals(n) {
		if (this.constructor !== n.constructor) {
			return false;
		}
		return this.pattern === n.pattern && this.not === n.not;
	}
}