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
	Named(name, pattern) {
		var n = new Named(name, pattern, this.ID, this);
		var searchRes = this.search(n);
		if (searchRes >= 0) {
			// pr('The node ' + n.string + ' already exists');
			return searchRes;
		}

		this.patterns.push(n);
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
	Except(pattern, not) {
		var n = new Except(pattern, not, this.ID, this);
		var searchRes = this.search(n);
		if (searchRes >= 0) {
			// pr('The node ' + n.string + ' already exists');
			return searchRes;
		}

		this.patterns.push(n);
		return this.ID++;
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
	Ignoreable(pattern) {
		var n = new Ignoreable(pattern, this.ID, this);
		var searchRes = this.search(n);
		if (searchRes >= 0) {
			// pr('The node ' + n.string + ' already exists');
			return searchRes;
		}

		this.patterns.push(n);
		return this.ID++;
	}
	Reserve() {
		this.patterns.push(undefined);
		return this.ID++;
	}
	defineNamed(id, name, pattern) {
		this.patterns[id] = new Named(name, pattern, id, this);
	}
	String(txt) {
		var list = [];
		for (var c of txt) {
			list.push(pl.Literal(c));
		}
		return pl.List(list);
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

			txt += '\n    all parents:';
			for (var i of p.allParents) {
				txt += ' ' + i;
			}

			txt += '\n    children:';
			for (var i of p.children) {
				txt += ' ' + i;
			}

			txt += '\n    all children:';
			for (var i of p.allChildren) {
				txt += ' ' + i;
			}

			txt += '\n    firsts:';
			for (var i of p.firstPatterns) {
				txt += ' ' + i;
			}

			txt += '\n    lasts:';
			for (var i of p.lastPatterns) {
				txt += ' ' + i;
			}

			txt += '\n    first parents:';
			for (var i of p.firstParents) {
				txt += ' ' + i;
			}

			txt += '\n    min size: ' + p.minSize;
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
			if (p.equals(n)) {
				return p.id;
			}
		}
		return -1;
	}
	// group4(txt, content) {
	// 	var upStack = [];
	// 	var downStack = [];
	// 	for (var c of txt) {
	// 		var po = this.getPO(c);
	// 		downStack.unshift(po);
	// 	}
	// 	upStack.push(this.getPO(context));

	// 	while (downStack.length > 0) {
	// 		var downNode = downStack[downStack.length-1];
	// 		var upNode = upStack[upStack.length-1];
			
	// 		if (upNode.parent === undefined) {
	// 			// rewind, rewind
	// 			if (/*upNode has children*/) {
	// 				// upNode.pop
	// 				// upStack.push(poped node);
	// 			} else {
	// 				// upNode has no children
	// 				if (upNode is a literal) {
	// 					downStack.push(upNode);
						
	// 				}
	// 			}
	// 		} else if (/*downNode is eventual first child of upNode*/) {
	// 			downStack.pop();
	// 			upStack.push(downNode);
	// 		} else {
	// 			//need to upgrade upNode
	// 			downStack.push(upNode);
	// 			upStack.pop();
	// 			if (upStack.length === 0) {
	// 				upStack.push(pl.getPO(context));
	// 			}
	// 			downNode = upNode;
	// 			upNode = upStack[upStack.length-1];
	// 			if (/*downNode parent and index match upNode parent and index*/) {

	// 				downNode.nextParent();
	// 				upNode.push(downNode);
	// 				downStack.pop();

	// 			} else {

	// 				while (/*
	// 					!(downNode's parent is defined
	// 					and
	// 					downNode's parent index is zero
	// 					and
	// 					downNode's parent is a possible match of upNode)
	// 				*/) {
	// 					downNode.nextParent();
	// 				}

	// 				if (downNode.parent === undefined) {
	// 					//rewind
	// 				} else {
	// 					var newPO = pl.getPO(downNode.parent);
	// 					upStack.push(newPO);
	// 				}

	// 			}
	// 		}
	// 	}
	// }
	group3(txt, context) {
		pr('Grouping ' + txt);
		var upStack = [];
		var downStack = [];
		for (var c of txt) {
			var po = this.getPO(c);
			downStack.unshift(po);
		}
		upStack.push(this.getPO(context));
		
		var n = 0;
		while (downStack.length > 0 && n < 20) {
			n++;
			//set the context
			var ctx;
			if (upStack.length === 0) {
				ctx = [context];
			} else {
				ctx = upStack[upStack.length-1];
			}
			this.drawGouping(upStack, downStack);
			pr('Context: ' + ctx.string);
			

			var top = downStack.pop();
			pr('Looking at ' + top.string);

			if (top.parent === undefined) {
				top.chooseParent();
			}
			pr('Top Parent: ' + top.parent);
			pi();
			if (ctx.isPossibleMatch(top.parent)) {
				pr('it is a possible match, adding to upStack');
				upStack.push(top);
			} else {
				// the need exists to group the top node in something that can hold the bottom node
				pr('This never shows up in the top, time to pull down');
				downStack.push(top);
				var downPat = upStack.pop();

				ctx = upStack[upStack.length-1];
				pr(ctx.id);
				pr(downPat.parent);
				if (downPat.parent === undefined) {
					if (downPat.parents.length > 0) {
						downPat.chooseParent();
					} else {

					}
				}
				if (ctx.id === downPat.parent) {
					pr('melding ' + downPat.string + ' up to ' + ctx.string);
					ctx.add(downPat);
				} else {
					pr('adding parent above');
					// downStack.push(downPat);
					console.log(downPat);
					var newPO = this.getPO(downPat.parent);
					newPO.add(downPat);
					upStack.push(newPO);
				}
			}
			pd();
		}
	}
	drawGouping(us, ds) {
		var txt = ''
		if (us.length < 5) {
			for (var i = 0; i < us.length; i++) {
				txt += us[i].string + '\n';
			}
		} else {
			txt += '...\n';
			for (var i = us.length-4; i < us.length; i++) {
				txt += us[i].string + '\n';
			}
		}
		txt += '--------------------------------\n';
		if (ds.length < 5) {
			for (var i = ds.length-1; i >= 0; i--) {
				txt += ds[i].string + '\n';
			}
		} else {
			for (var i = ds.length-1; i >= ds.length-4; i--) {
				txt += ds[i].string + '\n';
			}
			txt += '...\n';
		}
		pr(txt);
	}
	group2(txt, context) {
		var upStack = [];
		var downStack = [];
		for (var c of txt) {
			downStack.unshift(c);
		}
		while (downStack.length > 0) {
			var top = downStack.pop();
			if (typeof top === 'string') {
				// handle a literal
				pr('handling ' + top);pi();
				var down = undefined;
				var upCon = context;
				if (upStack.length > 0) {
					upCon = upStack[upStack.length-1].id;
					down = upStack[upStack.length-1].down;
				}
				if (down === undefined) {
					pr('need to make a new upstack');
					var choices = [];
					for (var i of this.patterns) {
						if (i.allParents.has(upCon) && i.isLiteral && i.contains(top)) {
							choices.push(i.id);
						}
					}
					pr('choices: ' + choices);
					var newPO = new PatternObject(choices, this);
					newPO.add(top);
					upStack.push(newPO);
				} else {
					console.log(down);
				}
			} else {
				// handle a pattern object
				pr('handling ' + this.get(top.id));pi();
			}
			pd();
			pr(upStack);
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
		context = pl.patterns[context];
		pr(context.firstPatterns);

		var namedS = [new NamedGrouper(context.id)];
		var patternS = [new PatternGrouper(context.id, this)];
		var pathS = [];

		// make the buffer
		var buff = [];
		for (var c of txt) {
			buff.unshift(c);
		}

		var n = 0;
		while (true && n < 100) {
			var top = buff.pop();
			if (typeof top === 'string') {
				pr('Looking at char ' + top);pi();

				// look at the options on top
				var topPattern = patternS[patternS.length-1];
				if (topPattern.isMatch(top)) {
					pr('its a match! so do something...');
				} else if (topPattern.isPossibleMatch(top)) {
					pr('its a possible match');
					// bring the stack down
					var down = topPattern.down;
					while (down !== undefined && down.length === 1) {
						pr(this.patterns[down[0]].string);
						topPattern.index++;
						topPattern = new PatternGrouper(down[0], this);
						if (topPattern.pattern instanceof Named) {
							var newgrouper = new NamedGrouper(topPattern.id);
							namedS[namedS.length-1].add(newgrouper);
							namedS.push(newgrouper);
						}
						if (topPattern.isMatch(top)) {
							pr('A match has been found!');
							namedS[namedS.length-1].add(top);
							break;
						}
						patternS.push(topPattern);
						down = topPattern.down;
					}
					if (down.length > 1) {
						pr('hit an or, need to bring up the bottom');

					}
				} else {
					pr('not a possible match');
				}
				pd();
			}
			if (n === 100) {
				throw Error('My max call exceeded (increase n or fix the goddam issue');
			}
			n++;
		}

		// for (var c of txt) {
		// 	pr('Looking at "' + c + '"');pi();
		// 	for (var i of context.firstPatterns) {
		// 		i = this.patterns[i];
		// 		if (i instanceof Literal && i.char === c) {
		// 			pr('possible: ' + i.string);
		// 		} else if (i instanceof Range && i.contains(c)) {
		// 			pr('possible: ' + i.string);
		// 		}
		// 	}
		// 	pd();
		// }
	}
}