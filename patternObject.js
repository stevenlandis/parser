class PO {
	constructor(pl, id) {
		this.pl = pl;
		this.id = id;
	}
	chooseParent() {
		if (this.parent !== undefined) {
			++this.parentI;
		}
		if (this.parents.length === this.parentI) {
			this.parent = undefined;
			return;
		}
		this.parent = this.parents[this.parentI];
	}
	get string() {
		var txt = '';

		txt += 'PO[' + this.id + '], parents: ';
		// for (var i in this.parents) {
		// 	i = parseInt(i)
		// 	if (i === this.parentI) {
		// 		txt += '[[' + this.parents[i] + ']] ';
		// 	} else {
		// 		txt += '(' + this.parents[i] + ') ';
		// 	}
		// }

		txt += ', complete: ' + this.complete;
		txt += ', filled: ' + this.filled;
		txt += ', index: ' + this.i;
		txt += ', literal: ' + (this.constructor === LiteralPO);
		if (this.constructor === LiteralPO) {
			txt += ', choice: ' + this.choiceI;
		}
		return txt;
	}
	get string2() {
		var txt = '';

		txt += 'PO[' + this.id + ']';
		txt += ': "' + this.result + '"';

		return txt;
	}
	preceeds(poB) {
		if (poB.constructor === LiteralPO) {
			// search all the literals
			// O(logn)
			return this.pattern.nextLiteralRange.has(poB.char);
		} else {
			// search everything else
			return this.pattern.nextPatterns.has(poB.pattern.id);
		}
	}
	preceedsUp(up, poB) {
		if (poB.constructor === LiteralPO) {
			return this.pattern.nextUpRanges[up[0]][up[1]].has(poB.char);
		} else {
			return this.pattern.nextUpPatterns[up[0]][up[1]].has(poB.pattern.id);
		}
	}
}


class LiteralPO extends PO{
	constructor(pl, char) {
		// leave the id blank for now
		super(pl, undefined);

		this.char = char;
		this.result = char;
		this.source = char;

		this.filled = true;
		this.complete = true;

		this.choices = [];
		this.choiceI = 0;
		for (var i of this.pl.literals) {
			var n = this.pl.get(i);
			if (n.contains(char)) {
				this.choices.push(n.id);
			}
		}
		if (this.choices.length === 0) {
			throw Error("'" + char + "'" + ' is an impossible char');
		}
		this.choose(0);
		// this.chooseChoice();
	}
	get canCycle() {
		return this.choiceI < this.choices.length;
	}
	resetChoice() {
		if (this.choiceI !== 0) {
			this.choiceI = 0;
			this.chooseChoice();
		} 
	}
	choose(n) {
		// assumes that n is a valid choice
		this.choiceI = n;
		this.id = this.choices[n];

		this.i = 0;
		this.pattern = this.pl.get(this.id);
		this.parents = [];
		this.parentI = 0;
		for (var i of this.pattern.ups) {
			this.parents.push(i);
		}
		this.chooseParent();
	}
	canChoose(n) {
		// pr(n + ' < ' + this.choices.length);
		return n < this.choices.length;
	}
	chooseChoice() {
		if (this.choiceI < this.choices.length) {

			// tis a swell and proper choice
			this.id = this.choices[this.choiceI];
			this.choiceI++;

			this.i = 0;
			this.pattern = this.pl.get(this.id);
			this.parents = [];
			this.parentI = 0;
			for (var i of this.pattern.ups) {
				this.parents.push(i);
			}
			this.chooseParent();
		} else {

			// it's out of chances
			this.id = undefined;
			this.pattern = undefined;
			this.parents = [];
		}
	}
	unChooseChoice() {
		if (this.choiceI <= 0) {
			throw error('Can\'t unchoose choice of choiceI: ' + this.choiceI);
		}

		this.choiceI -= 1;
		this.id = this.choices[this.choiceI-1];

		this.i = 0;
		this.pattern = this.pl.get(this.id);
		this.parents = [];
		this.parentI = 0;
		for (var i of this.pattern.ups) {
			this.parents.push(i);
		}
		this.chooseParent();
	}
	isMatch() {
		return false;
	}
	isPossibleMatch() {
		return false;
	}
	isBelow() {
		return false;
	}
	isDirectlyBelow() {
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
		this.parents = [];
		this.parentI = 0;
		for (var i of this.pattern.firstUps) {
		// for (var i of this.pattern.ups) {
			this.parents.push(i);
		}
		// this.parents = Array.from(this.pattern.firstParents);
		this.chooseParent();
	}
	get result() {
		var res = '';
		for (var i of this.data) {
			res += i.result;
		}
		if (this.pattern.name === '') {
			return res;
		}
		return '[' + res + ']';
	}
	get source() {
		var res = '';
		for (var i of this.data) {
			res += i.source;
		}
		return res;
	}
	isBelow(po) {
		if (this.isDirectlyBelow(po)) {
			return true;
		}
		return this.pattern.isBelow(po.id, this.i);
	}
	isDirectlyBelow(po) {
		// var ID = po.parent[0];
		// var index = po.parent[1];

		// if (this.pattern.id === ID && this.i === index) {
		// 	return true;
		// }
		return this.pattern.isDirectlyBelow(po.id, this.i);
	}
	canSkip() {
		return this.pattern.canSkip(this.i);
	}
	skip() {
		this.i++;
		this.filled = this.pattern.isFilled(this.i);
		this.complete = this.pattern.isComplete(this.i, this);
	}
	unSkip() {
		this.i--;
		this.filled = this.pattern.isFilled(this.i);
		this.complete = this.pattern.isComplete(this.i, this);
	}
	add(childPO) {
		this.data.push(childPO);
		this.i++;
		this.filled = this.pattern.isFilled(this.i);
		this.complete = this.pattern.isComplete(this.i, this);
	}
	pop() {
		var res = this.data.pop();
		this.i--;
		this.filled = this.pattern.isFilled(this.i);
		this.complete = this.pattern.isComplete(this.i, this);
		return res;
	}
}