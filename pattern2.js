class Pattern {
	constructor(id, pl) {
		this.id = id;
		this.pl = pl;
		this.parents = new Set();
		this.allParents = new Set();
		this.children = new Set();
		this.firstPatterns = new Set();
	}
}

class Named extends Pattern {
	constructor(name, pattern, id, pl) {
		super(id, pl);
		this.name = name;
		this.pattern = pattern;
		this.children.add(pattern);
	}
	get string() {
		return '"' + this.name + '"';
	}
	get first() {
		return [this.pattern];
	}
}

class Or extends Pattern {
	constructor(patterns, id, pl) {
		super(id, pl);
		this.patterns = patterns;
		for (var i in patterns) {
			this.children.add(patterns[i]);
		}
	}
	get string() {
		var res = '[';
		for (var i in this.patterns) {
			if (i > 0) {
				res += ' or ';
			}
			res += this.pl.patterns[this.patterns[i]].string;
		}
		return res + ']';
	}
	get first() {
		var res = [];
		for (var i of this.patterns) {
			res.push(i);
		}
		return res;
	}
}

class Repeat extends Pattern {
	constructor(pattern, id, pl) {
		super(id, pl);
		this.pattern = pattern;
		this.children.add(pattern);
	}
	get string() {
		return '[Repeat ' + this.pl.patterns[this.pattern].string + ']';
	}
	get first() {
		return [this.pattern];
	}
}

class Except extends Pattern {
	constructor(pattern, not, id, pl) {
		super(id, pl);
		this.pattern = pattern;
		this.not = not;

		this.children.add(pattern);
		//don't add the not
	}
	get string() {
		return '[' + this.pl.patterns[this.pattern].string + ' except ' + this.pl.patterns[this.not].string + ']';
	}
	get first() {
		return [this.pattern];
	}
}

class Literal extends Pattern {
	constructor(char, id, pl) {
		super(id, pl);
		this.char = char;
	}
	get string() {
		var c = this.char;
		if (c === '\t') {
			c = '\\t';
		} else if (c === '\n') {
			c = '\\n';
		}
		return '"' + c + '"';
	}
	get first() {
		return [];
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
			if (ranges[i+1][0] <= nextChar(ranges[i][1])) {
				if (ranges[i][1] < ranges[i+1][1]) {
					ranges[i][1] = ranges[i+1][1]
				}
				ranges.splice(i+1, 1);
				i--;
			}
		}
		this.ranges = ranges;
	}
	contains(char) {
		for (var r of this.ranges) {
			if (r[0] <= char && char <= r[1]) {
				return true;
			}
		}
		return false;
	}
	get string() {
		var res = '';
		for (var r of this.ranges) {
			res += '[' + r + ']';
		}
		return res;
	}
	get first() {
		return [];
	}
}

class List extends Pattern {
	constructor(list, id, pl) {
		super(id, pl);
		this.list = list;
		for (var i of list) {
			this.children.add(i);
		}
	}
	get string() {
		var res = '[List: ';
		for (var i in this.list) {
			if (i > 0) {
				res += ', ';
			}
			res += this.pl.patterns[this.list[i]].string;
		}
		return res + ']';
	}
	get first() {
		return [this.list[0]];
	}
}

class PatternList {
	constructor() {
		this.patterns = [];
		this.names = [];
		this.ID = 0;
	}
	Literal(char) {
		this.patterns.push(new Literal(char, this.ID, this));
		return this.ID++;
	}
	Range(ranges) {
		this.patterns.push(new Range(ranges, this.ID, this));
		return this.ID++;
	}
	Named(name, pattern) {
		this.patterns.push(new Named(name, pattern, this.ID, this));
		return this.ID++;
	}
	Or(patterns) {
		this.patterns.push(new Or(patterns, this.ID, this));
		return this.ID++;
	}
	Repeat(pattern) {
		this.patterns.push(new Repeat(pattern, this.ID, this));
		return this.ID++;
	}
	Except(pattern, not) {
		this.patterns.push(new Except(patter, not, this.ID, this));
		return this.ID++;
	}
	List(list) {
		this.patterns.push(new List(list, this.ID, this));
		return this.ID++;
	}
	Reserve() {
		this.patterns.push(undefined);
		return this.ID++;
	}
	defineNamed(id, name, pattern) {
		this.patterns[id] = new Named(name, pattern, id, this);
	}

	setParents() {
		// loop through all the patterns
		for (var pat of this.patterns) {

			// loop through all the children and add pat as a parent
			for (var child of pat.children) {
				this.patterns[child].parents.add(pat.id);
			}
		}
	}
	setAllParents() {
		// requires that setParents() has already been called

		// loop through all patterns
		for (var pat of this.patterns) {
			// pr('Looking at ' + pat.id);
			var stack = [];
			for (var parent of pat.parents) {
				stack.push(parent);
			}
			// pr('Initial stack: ' + stack);pi();
			while (stack.length > 0) {
				// I'm running out of names here!
				var p = stack.pop();
				// pr('Looking at ' + p);
				if (!pat.allParents.has(p)) {
					// pr('This is a new parent, adding');
					pat.allParents.add(p);
					p = this.patterns[p];
					for (var pat2 of p.parents) {
						stack.unshift(pat2);
					}
				} else {
					// pr('not a new parent');
				}
			}
			// pd();
		}
	}
	setFirstPatterns() {

		// loop through all the patterns
		for (var pat of this.patterns) {
			// pr('Looking at ' + pat.string);
			var stack = pat.first;
			while (stack.length > 0) {
				// pr(stack);
				var tp = stack.pop();
				if (!pat.firstPatterns.has(tp)) {
					pat.firstPatterns.add(tp);
					tp = this.patterns[tp];
					for (var i of tp.first) {
						stack.unshift(i);
					}
				}
			}
		}
	}
	disp() {
		for (var p of this.patterns) {
			var txt = '' + p.id + ': ' + p.string;
			if (false) {
				pr(txt);pi();
				for (var i of p.firstPatterns) {
					pr(this.patterns[i].string);
				}
				pd();
			} else if (false) {
				txt += ', Parents:';
				for (var i of p.parents) {
					txt += ' ' + this.patterns[i].string;
				}
			} else {
				pr(txt);
			}
		}
	}
	group(txt, context) {
		// find id of the context
		for (var i of this.patterns) {
			if (i instanceof Named && i.name === context) {
				context = i.id;
				break;
			}
		}
		if (typeof context === 'string') {
			throw Error('"' + context + '" is an invalid context name');
		}

		for (var c of txt) {
			pr('Looking at "' + c + '"');pi();
			for (var i of this.patterns) {
				for (var j of i.first) {
					j = this.patterns[j];
					if (j instanceof Literal && j.allParents.has(context) && j.char === c) {
						pr('possible: ' + i.string);
					} else if (j instanceof Range && j.contains(c) && j.allParents.has(context)) {
						pr('possible: ' + i.string);
					}
				}
			}
			pd();
		}
	}
}