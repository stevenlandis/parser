class CharRange {
	constructor(ranges) {
		//sort that list based on the first
		//pr(ranges.length-1);
		for (var i = 1; i < ranges.length; i++) {
			for (var j = ranges.length-1; j >= i; j--) {
				if (ranges[j-1][0] > ranges[j][0]) {
					var temp = ranges[j-1];
					ranges[j-1] = ranges[j];
					ranges[j] = temp;
				}
			}
		}
		//pr(ranges[0]);
		for (var i = 0; i < ranges.length-1; i++) {
			if (ranges[i+1][0] <= nextChar(ranges[i][1])) {
				if (ranges[i][1] < ranges[i+1][1]) {
					ranges[i][1] = ranges[i+1][1]
				}
				ranges.splice(i+1, 1);
				i--;
			}
		}

		this.type = 'range';
		this.ranges = ranges;
	}
	contains(char) {
		for (var i = 0; i < this.ranges.length; i++) {
			var r = this.ranges[i];
			if (r[0] <= char && char <= r[1]) {
				return true;
			}
		}
		return false;
	}
}

class StructureList {
	constructor(list) {
		this.list = list;

		this.setRequirements();
		this.setParents();
		this.setPossibleParents();
	}
	setRequirements() {
		for (var i = this.list.length - 1; i >= 0; i--) {
			var s = this.list[i];
			var requirements = new PatternSet();
			var stack = [s.pattern];
			while (stack.length > 0) {
				var pattern = stack.pop();
				for (var j = pattern.length - 1; j >= 0; j--) {
					var node = pattern[j];
					if (node.type === 'structure link' || node.type === 'literal' || node.type === 'range') {
						requirements.add(node);
					} else if (node.type === 'repeat') {
						stack.unshift(node.pattern);
					} else if (node.type === 'or') {
						for (var k = node.arguments.length-1; k >= 0; k--) {
							stack.unshift(node.arguments[k]);
						}
					}
				}
			}
			s.requirements = requirements;
		}
	}
	setParents() {
		for (var i = this.list.length - 1; i >= 0; i--) {
			this.list[i].parents = new PatternSet();
		}

		for (var i = this.list.length - 1; i >= 0; i--) {
			var structure = this.list[i];

			for (var j = structure.requirements.list.length - 1; j >= 0; j--) {
				var req = structure.requirements.list[j];
				if (req.type === 'structure link') {
					var target = this.getStructure(req.to);
					target.parents.add(structure.name);
				}
			}
		}
	}
	setPossibleParents() {
		// has to be called after this.setParents()
		for (var i = this.list.length - 1; i >= 0; i--) {
			var structure = this.list[i];
			//pr("setting possible parents for "+structure.name);pi();
			structure.possibleParents = new PatternSet();
			var stack = structure.parents.list;
			var stack = [];
			for (var j = structure.parents.list.length - 1; j >= 0; j--) {
				stack.push(structure.parents.list[j]);
			}
			//pr("initial stack: ["+stack+"]");
			var k = 0;
			while (stack.length > 0 && k < 100) {
				k++;
				if (k === 100) {
					throw Error("exceeded limit when setting possible parents");
				}
				var parent = this.getStructure(stack.pop());
				//pr("looking to add "+parent.name);
				if (!structure.possibleParents.has(parent.name)) {
					//pr('adding '+parent.name);
					structure.possibleParents.add(parent.name);
					for (var j = parent.parents.list.length-1; j >= 0; j--) {
						stack.push(parent.parents.list[j]);
					}
				}
			}
			//pd();
		}
	}
	getStructure(name) {
		for (var i = this.list.length - 1; i >= 0; i--) {
			if (this.list[i].name === name) {
				return this.list[i];
			}
		}
	}
	parentsStartWith(thing, context) {
		var res = new PatternSet();
		for (var i = this.list.length - 1; i >= 0; i--) {
			if (this.list[i].startsWith(thing) && this.list[i].possibleParents.has(context)) {
				res.add(this.list[i]);
			}
		}
		return res;
	}
	group(text, context) {
		var steps = [];
		var sl = this.list;
		var firstChar = text[0];
		for (var i = 0; i < sl.length; i++) {
			if (sl[i].startsWith(firstChar)) {
				pr('[' + sl[i].name + '] contains char ' + firstChar);
			}
		}
	}
}

// class Link {
// 	constructor(to) {
// 		this.type = 'structure link';
// 		this.to = to;
// 	}
// }

// class Literal {
// 	constructor(char) {
// 		this.type = 'literal';
// 		this.char = char;
// 	}
// }

class PatternSet {
	constructor() {
		this.list = [];
	}
	add(n) {
		for (var i = this.list.length - 1; i >= 0; i--) {
			if (this.list[i].id === n.id) {
				return;
			}
		}
		this.list.push(n);
	}
	has(n) {
		for (var i = this.list.length - 1; i >= 0; i--) {
			if (this.list[i].id === n.id) {
				return true;
			}
		}
		return false;
	}
	remove(n) {
		for (var i = this.list.length - 1; i >= 0; i--) {
			if (this.list[i].id === n.id) {
				this.list.splice(i, 1);
			}
		}
	}
}

class StructureMold {
	constructor(structure) {
		this.structure = structure;
		this.type = this.structure.type;
		this.result = [];
		if (this.type === 'structure') {
			this.index = 0;
			this.pattern = this.structure.pattern;
		} else if (this.type === 'literal') {
			//do nothing
		} else if (this.type === 'range') {
			//do nothing
		} else if (this.type === 'repeat') {
			this.index = 0;
			this.pattern = this.structure.pattern;
		} else if (this.type === 'or') {
			//now stuff gets crazy
			this.indexes = [];
			this.arguments = this.structure.arguments;
			for (var i = 0; i < this.arguments.length; i++) {
				this.indexes.push(0);
			}
		} else if (this.type === 'structure link') {
			var name = this.structure.to;
			for (var i = 0; i < structures.length; i++) {
				if (structures[i].name === name) {
					this.index = 0;
					this.pattern = structures[i].pattern;
					this.type = 'structure';
					break;
				}
			}
		}
		this.status = 'new';
	}
	insert(char) {
		if (this.type === 'structure') {
			if ( !(this.pattern[this.index] instanceof StructureMold) ) {
				this.pattern[this.index] = new StructureMold(this.pattern[this.index]);
			}
			this.pattern[this.index].insert(char);
			while (this.pattern[this.index].status === 'one overflow') {
				if (this.pattern[this.index].type === 'structure') {
					this.result.push(this.patter[this.index].result);
				} else {
					this.result = this.result.concat(this.pattern[this.index].result);
				}
				this.index++;
				this.pattern[this.index].insert(char);
			}
		}
	}
}

class Structure {
	constructor(name, pattern) {
		this.name = name;
		this.pattern = pattern;
		this.type = 'structure';
	}
	// getMold() {
	// 	return new StructureMold(this);
	// }
	startsWith(thing) {
		if (typeof thing === 'string') {
			if (this.pattern[0].type === 'Literal') {
				return thing === this.pattern[0].char;
			}
			if (this.pattern[0].type === 'range') {
				return this.pattern[0].contains(thing);
			}
			return false;
		}
		return thing.guide === this.pattern[0];
	}
}

// class Or {
// 	constructor(args) {
// 		this.type = 'or';
// 		this.arguments = args;
// 	}
// }

// class Repeat {
// 	constructor(pattern) {
// 		this.type = 'repeat';
// 		this.pattern = pattern;
// 	}
// }

function nodeEquals(a, b) {
	if (a.type !== b.type) {
		return false;
	}
	if (a.type === "literal") {
		return a.char === b.char;
	}
	if (a.type === "structure link") {
		return a.to === b.to;
	}
	if (a.type === "range") {
		if (a.ranges.length !== b.ranges.length) {
			return false;
		}
		for (var i = a.ranges.length - 1; i >= 0; i--) {
			if (a.ranges[i][0] !== b.ranges[i][0] || a.ranges[i][1] !== b.ranges[i][1]) {
				return false;
			}
		}
		return true;
	}
}

function equals(a, b) {
	if (typeof a === "string" && typeof b === 'string') {
		return a === b;
	}
	return nodeEquals(a, b);
}

// function isRequirementOf(thing, structure) {
// 	if (typeof thing === 'string') {
// 		var letter = thing;
// 		for (var k = 0; k < structure.requirements.list.length; k++) {
// 			var rec = structure.requirements.list[k];
// 			if (rec.type === "range") {
// 				if (rec.contains(letter)) {
// 					return true;
// 				}
// 			} else if (rec.type === 'literal') {
// 				if (rec.char === letter) {
// 					return true;
// 				}
// 			}
// 		}
// 	}
// 	return false;
// }

// function getRequirementList(thing, structures) {
// 	var res = [];
// 	if (typeof thing === 'string') {
// 		for (var i = 0; i < structures.length; i++) {
// 			if (isRequirementOf(thing, structures[i])) {
// 				res.push(structures[i]);
// 			}
// 		}
// 	}
// 	return res;
// }

// function deepLinkStructures(structureList) {
// 	for (var i = 0; i < structureList.length; i++) {
// 		//pr("Structure: "+structureList[i].name);pi();
// 		var stack = [structureList[i].pattern];
// 		while (stack.length !== 0) {
// 			var pattern = stack.pop();
// 			for (var j = 0; j < pattern.length; j++) {
// 				//pr("Looking at "+pattern[j].type);
// 				var type = pattern[j].type;
// 				//pi();
// 				if (type === 'structure link') {
// 					var name = pattern[j].to;
// 					//pr("looking for structure named "+name);
// 					for (var k = 0; k < structureList.length; k++) {
// 						if (name === structureList[k].name) {
// 							pattern[j] = structureList[k];
// 						}
// 					}
// 				} else if (type === 'repeat') {
// 					stack.push(pattern[j].pattern);
// 				} else if (type === 'or') {
// 					for (var k = 0; k < pattern[j].arguments.length; k++) {
// 						stack.push(pattern[j].arguments[k]);
// 					}
// 				}
// 				//pd();
// 			}
// 		}
// 		//pd();
// 	}
// }