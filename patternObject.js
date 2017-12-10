// "data as choice"

class PO {
	constructor(pl, id) {
		this.pl = pl;
		this.id = id;
	}
	chooseParent() {
		if (this.parent !== undefined) {
			this.parents.shift();
		}
		if (this.parents.length === 0) {
			throw Error("No parents to choose from");
		}
		this.parent = this.parents[0];
	}
	get string() {
		return 'PO[' + this.id + '], parents: ' + this.parents + ', complete: ' + this.complete + ', filled: ' + this.filled + ', index: ' + this.i;
	}
}

class LiteralPO extends PO{
	constructor(pl, char) {
		super(pl, char);
		this.char = char;
		this.pattern = char;

		this.filled = true;
		this.complete = true;

		//set parents
		this.parents = [];
		for (var i of this.pl.literals) {
			var n = this.pl.get(i);
			if (n.contains(char)) {
				this.parents.push(n.id);
			}
		}
	}
	isMatch() {
		return false;
	}
	isPossibleMatch() {
		return false;
	}
}

class PatternPO extends PO{
	constructor(pl, pattern) {
		//make a PO with choices that start with pattern
		super(pl, pattern.id);
		this.pattern = pattern;
		this.filled = pattern.defaultFilled;
		this.complete = pattern.defaultComplete;
		this.data = [];
		this.i = 0;
		this.parents = Array.from(this.pattern.firstParents);
	}
	
	isMatch(thing) {
		return this.pattern.isMatch(this.i, thing);
	}
	isPossibleMatch(thing) {
		return this.pattern.isPossibleMatch(this.i, thing);
	}
	add(childPO) {
		this.data.push(childPO);
		this.i++;
		this.filled = this.pattern.isFilled(this.i);
		this.complete = this.pattern.isComplete(this.i);
	}
}
// /*
// Ever subclass needs to implement
// 	this.choices
// 	this.data
// 	this.complete
// 	this.filled

// 	this.lookingFor (can be a get or a property)

// */

// class PO {
// 	constructor(pl) {
// 		this.pl = pl;
// 		this.choice = 0;
// 		this.i = 0;
// 	}
// 	isMatch(pId) {
// 		if (this.lookingFor.indexOf(pId) >= 0) {
// 			return true;
// 		}
// 		return false;
// 	}
// 	get remainingChoices() {
// 		return this.choices.length - this.choice;
// 	}
// 	get mold() {
// 		return this.choices[this.choice];
// 	}
// 	get moldPattern() {
// 		return this.pl.get(this.mold);
// 	}
// }

// class LiteralPO extends PO {
// 	constructor(pl, char) {
// 		super(pl);
// 		this.complete = true;
// 		this.filled = true;
// 		this.data = [char];

// 		this.lookingFor = [];

// 		// initialize choices
// 		this.choices = [];
// 		for (var i of this.pl.literals) {
// 			var n = this.pl.get(i);
// 			if (n.contains(char)) {
// 				this.choices.push(n.id);
// 			}
// 		}
// 	}
// }

// class PatternPO extends PO{
// 	constructor(pl, pattern) {
// 		super(pl);
// 		this.pattern = pattern;
// 		this.choices = Array.from(this.pattern.parents);
// 	}
// 	get lookingFor() {
// 		var moldPat = this.pl.get(this.mold);
// 		if (moldPat.constructor === List) {
// 			if (this.i < moldPat.list.length) {
// 				return moldPat.list[this.i];
// 			}
// 			return [];
// 		} else if (moldPat.constructor === Or) {
// 			if (this.i === 0) {
// 				return moldPat.patterns;
// 			} else {
// 				return [];
// 			}
// 		} else if (moldPat.constructor === Repeat) {
// 			return [moldPat.pattern];
// 		}
// 	}
// }

// class ListPO extends PatternPO {
// 	constructor(pl, pattern) {
// 		super(pl, pattern);
// 		this.pattern = pattern;

// 		// patterns must have at least one node, so they are never initially complete or filled
// 		this.complete = false;
// 		this.filled = false;
// 	}
// }

// class OrPO extends PatternPO {
// 	constructor(pl, pattern) {
// 		super(pl, pattern);

// 		this.complete = false;
// 		this.filled = false;
// 	}
// }

// class RepeatPO extends PatternPO {
// 	constructor(pl, pattern) {
// 		super(pl, pattern);

// 		this.complete = true;
// 		this.filled = false;
// 	}
// }

// class RangePO extends PatternPO {
// 	constructor(pl, pattern) {
// 		super(pl, pattern);

// 		this.complete = true;
// 		this.filled = true;
// 	}
// }