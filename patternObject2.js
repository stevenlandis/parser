class LiteralPO {
	constructor(pl, char) {
		this.pl = pl;
		this.char = char;
		this.filled = true;
		this.complete = true;
		this.parents = [];

		//set parents
		for (var i of this.pl.literals) {
			var n = this.pl.get(i);
			if (n.contains(char)) {
				this.parents.push(n.id);
			}
		}
	}
}

class PO {
	constructor(pl, pattern) {
		//make a PO with choices that start with pattern
		this.pl = pl;
		this.pattern = pattern;
		this.data = [];
		this.choice = 0;
		this.choices = Array.from(pattern.firstPatterns);

		this.init_choice();
	}
	init_choice() {
		this.mold = this.pl.get(this.choices[this.choice]);
		this.moldI = 0;
		this.filled = this.mold.defaultFilled;
		this.complete = this.mold.defaultComplete;

		this.parents = Array.from(this.pattern.firstParents);
	}
}