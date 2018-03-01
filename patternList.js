class PatternList {
	constructor() {
		this.patterns = [];
		this.named = [];
		this.literals = [];
		this.ID = 0;
	}
	init() {
		this.setParents();
		this.setAllParents();
		this.setAllChildren();
		this.setFirstPatterns();
		this.setFirstParents();
		this.setLastPatterns();
		this.setNamed();
		this.setUps();
		this.setNext();
		this.setNextLiterals();
		this.setUpNexts();
	}

	Literal(char) {
		var n = new Literal(char, this.ID, this);
		var searchRes = this.search(n);
		if (searchRes >= 0) {
			// pr('The node ' + n.string + ' already exists');
			return searchRes;
		}

		this.patterns.push(n);
		this.literals.push(n.id);
		return this.ID++;
	}
	Range(ranges) {
		var n = new Range(ranges, this.ID, this);
		var searchRes = this.search(n);
		if (searchRes >= 0) {
			// pr('The node ' + n.string + ' already exists');
			return searchRes;
		}

		this.patterns.push(n);
		this.literals.push(n.id);
		return this.ID++;
	}
	Or(patterns) {
		var n = new Or(patterns, this.ID, this);
		var searchRes = this.search(n);
		if (searchRes >= 0) {
			// pr('The node ' + n.string + ' already exists');
			return searchRes;
		}

		this.patterns.push(n);
		return this.ID++;
	}
	DefOr(id, patterns) {
		var n = new Or(patterns, id, this);
		this.patterns[id] = n;
		return id;
	}
	Repeat(pattern) {
		var n = new Repeat(pattern, this.ID, this);
		var searchRes = this.search(n);
		if (searchRes >= 0) {
			// pr('The node ' + n.string + ' already exists');
			return searchRes;
		}

		this.patterns.push(n);
		return this.ID++;
	}
	DefRepeat(id, pattern) {
		var n = new Repeat(pattern, id, this);
		this.patterns[id] = n;
		return id;
	}
	List(list) {
		var n = new List(list, this.ID, this);
		var searchRes = this.search(n);
		if (searchRes >= 0) {
			// pr('The node ' + n.string + ' already exists');
			return searchRes;
		}

		this.patterns.push(n);
		return this.ID++;
	}
	DefList(id, list) {
		var n = new List(list, id, this);
		this.patterns[id] = n;
		return id;
	}
	Result(context) {
		return new Result(context, this);
	}
	Reserve() {
		this.patterns.push(undefined);
		return this.ID++;
	}

	name(id, name) {
		this.patterns[id].name = name;
	}
	String(txt) {
		var list = [];
		for (var c of txt) {
			list.push(this.Literal(c));
		}
		return this.List(list);
	}

	setNext() {
		for (var pat of this.patterns) {
			var stack = [];
			var pastUps = [];
			for (var i of pat.ups) {
				stack.push(i);
				pastUps.push(i);
			}

			while (stack.length !== 0) {
				var topUp = stack.pop();
				var topPat = this.get(topUp[0]);
				var topIndex = topUp[1];

				var followers = topPat.following(topIndex);
				// add all the following nodes to nextPatterns
				pat.nextPatterns.combine(followers);

				// also add the followers to all the last nodes
				for (var i of pat.lastPatterns) {
					var p2 = this.get(i);
					p2.nextPatterns.combine(followers);
				}

				if (topPat.isEnd(topIndex)) {
					// now look into the other ups
					for (var i of topPat.ups) {
						// do a quick search of pastUps
						var found = false;
						for (var j of pastUps) {
							if (topUp[0] === j[0] && topUp[1] === j[1]) {
								found = true;
								break;
							}
						}
						if (!found) {
							// this is a new up
							stack.push(topUp);
							pastUps.push(topUp);
						}
					}
				}
			}
		}
	}
	setUpNexts() {
		for (var pat of this.patterns) {
			// pr('Setting pattern: ' + pat.string);
			for (var up of pat.ups) {
				// pi();
				// pr('Setting up [' + up + ']');
				var nexts = new Set();
				var stack = [up];
				var past = [up];
				while (stack.length !== 0) {
					// pi();
					var topUp = stack.pop();
					var topPat = this.get(topUp[0]);
					var topIndex = topUp[1];

					// pr('Trying ' + topUp);

					var followers = topPat.following(topIndex);

					nexts.combine(followers);

					if (topPat.isEnd(topIndex)) {
						// pr('end');
						for (var i of topPat.ups) {
							// pr('Looking for ' + i);
							var found = false;
							for (var j of past) {
								if (i[0] === j[0] && i[1] === j[1]) {
									found = true;
									break;
								}
							}
							if (!found) {
								stack.push(i);
								past.push(i);
							}
						}
					}
					// pd();
				}
				if (pat.nextUpPatterns[up[0]] === undefined) {
					pat.nextUpPatterns[up[0]] = [];
				}
				pat.nextUpPatterns[up[0]][up[1]] = nexts;

				// set the literal ranges as well
				if (pat.nextUpRanges[up[0]] === undefined) {
					pat.nextUpRanges[up[0]] = [];
				}
				var newRange = new CharRange();
				for (var id of nexts) {
					var pat2 = this.patterns[id];
					if (pat2.isLiteral) {
						newRange.append(pat2.range);
					}
				}
				pat.nextUpRanges[up[0]][up[1]] = newRange;

				// pd();
			}
		}
	}
	setNextLiterals() {
		for (var p1 of this.patterns) {
			for (var i of p1.nextPatterns) {
				var p2 = this.get(i);
				if (p2.isLiteral) {
					p1.nextLiteralPatterns.add(p2.id);
					p1.nextLiteralRange.append(p2.range);
				}
			}
		}
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
	setUps() {
		for (var pat of this.patterns) {
			for (var i of pat.childs) {
				var newThing = [pat.id, parseInt(i[1])];
				var child = this.patterns[i[0]];
				if (!listHas(child.ups, newThing)) {
					child.ups.push(newThing);

					// see if this is a first up
					if (newThing[1] <= pat.firstSolidIndex) {
						child.firstUps.push(newThing);
					}
				}
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
	setAllChildren() {
		for (var pat of this.patterns) {
			var stack = [];
			for (var child of pat.children) {
				stack.push(child);
			}
			while (stack.length > 0) {
				var p = stack.pop();
				if (!pat.allChildren.has(p)) {
					pat.allChildren.add(p);
					p = this.get(p);
					for (var pat2 of p.children) {
						stack.unshift(pat2);
					}
				}
			}
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
	setFirstParents() {
		//loop through all the patterns
		for (var pat1 of this.patterns) {
			// loop through all the nodes that are first child of pat
			for (var pat2 of pat1.firstPatterns) {
				pat2 = this.get(pat2);
				pat2.firstParents.add(pat1.id);
			}
		}
	}
	setLastPatterns() {
		for (var pat of this.patterns) {
			var stack = pat.last;
			while (stack.length > 0) {
				var tp = stack.pop();
				if (!pat.lastPatterns.has(tp)) {
					pat.lastPatterns.add(tp);
					tp = this.get(tp);
					for (var i of tp.last) {
						stack.unshift(i);
					}
				}
			}
		}
	}
	setNamed() {
		for (var p of this.patterns) {
			if (p instanceof Named) {
				this.named.push(p.id);
			}
		}
	}

	getPO(content) {
		if (typeof content === 'string') {
			return new LiteralPO(this, content);
		}
		if (typeof content === 'number') {
			content = this.get(content);
		}
		return new PatternPO(this, content);
	}
	getResultPO(context) {
		return new ResultPO(this, context);
	}
	disp() {
		var txt = '';
		for (var p of this.patterns) {
			if (txt !== '') {
				txt += '\n\n';
			}
			txt += '' + p.id + ': ' + p.string;

			txt += '\n    parents:';
			for (var i of p.parents) {
				txt += ' ' + i;
			}

			txt += '\n    ups:';
			for (var i of p.ups) {
				txt += ' (' + i[0] + ', ' + i[1] + ')';
			}

			// txt += '\n    all parents:';
			// for (var i of p.allParents) {
			// 	txt += ' ' + i;
			// }

			// txt += '\n    children:';
			// for (var i of p.children) {
			// 	txt += ' ' + i;
			// }

			txt += '\n    all children:';
			for (var i of p.allChildren) {
				txt += ' ' + i;
			}
			
			txt += '\n    firsts:';
			for (var i of p.firstPatterns) {
				txt += ' ' + i;
			}

			txt += '\n    nexts:';
			for (var i of p.nextPatterns) {
				txt += ' ' + i;
			}

			txt += '\n    next literals:';
			for (var i of p.nextLiteralPatterns) {
				txt += ' ' + i;
			}

			// txt += '\n    lasts:';
			// for (var i of p.lastPatterns) {
			// 	txt += ' ' + i;
			// }

			// txt += '\n    first parents:';
			// for (var i of p.firstParents) {
			// 	txt += ' ' + i;
			// }

			if (p.constructor === List) {
				txt += '\n    Last index: ' + p.endIndex;
			}

			txt += '\n    min size: ' + p.minSize;
			txt += '\n    max size: ' + p.maxSize;
			txt += '\n    first solid index: ' + p.firstSolidIndex;
		}
		txt += '\n\n Literals:';
		for (var i of this.literals) {
			txt += ' ' + this.get(i).string;
		}
		pr(txt);
	}
	get(id) {
		return this.patterns[id];
	}
	search(n) {
		for (var p of this.patterns) {
			if (p !== undefined && p.equals(n)) {
				return p.id;
			}
		}
		return -1;
	}
	group(txt, context, debug, maxN) {
		var grouper = new Grouper(this, context);
		grouper.group3(txt, debug, maxN);
		return grouper;
	}
}

// to use when searching for
// v: [patternID, index]
function listHas(list, v) {
	for (var i of list) {
		if (v[0] === i[0] && v[1] === i[1]) {
			return true;
		}
	}
	return false;
}