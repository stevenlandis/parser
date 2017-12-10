class NamedGrouper {
	constructor(id) {
		this.id = id;
		this.res = [];
	}
	add(G) {
		this.res.push(G);
	}
}

class PatternObject {
	constructor(choices, pl) {
		this.id = choices[0];
		this.index = 0;
		this.res = [];
		this.choices = [];
		this.choiceIndex = 0;
		this.pl = pl;
		this.setPattern();
	}
	setPattern() {
		this.pattern = pl.get(this.id);
		this.filled = false;
		this.complete = false;
		if (this.pattern instanceof Ignoreable || this.pattern instanceof Repeat) {
			this.complete = true;
		}
	}
	right() {
		this.index++;
	}
	nextChoice() {
		// returns true or false for success or failure
		this.choiceIndex++;
		if (this.choiceIndex === this.choices.length) {
			return false;
		}
		this.res = [];
		this.index = 0;
		this.id = this.choices[this.choiceIndex];
		return true;
	}
	get down() {
		return this.pattern.down(this.index);
	}
	add(po) {
		this.res.push(po);
		this.index++;
	}
}

class PatternGrouper {
	constructor(id, pl) {
		this.id = id;
		this.index = 0;
		this.pl = pl;
		this.pattern = pl.patterns[id];
	}
	isMatch(po) {
		if (typeof po === 'string') {
			if (this.pattern.isLiteral && this.pattern.contains(po)) {
				return true;
			}
			return false;
		} else {
			return po.pattern.id === this.pattern.id;
		}
	}
	isPossibleMatch(po) {
		if (typeof po === 'string') {
			for (var i of this.pattern.firstPatterns) {
				i = this.pl.patterns[i];
				if (i.isLiteral && i.contains(po)) {
					return true;
				}
			}
		} else {
			for (var i in this.pattern.firstPatterns) {
				i = this.pl.patterns[i];
				if (i.id === po.id) {
					return true;
				}
			}
		}
		return false;
	}
	isLiteral() {
		return this.pattern instanceof Literal || this.pattern instanceof Range;
	}
	get down() {
		return this.pattern.down(this.index);
	}
}

class CreateStep {
	constructor(options, choice) {
		this.options = options;
		this.choice = choice;
	}
}

class RightStep {}

class BackStep {}

class UpStep {}