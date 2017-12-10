class ListStruct {
	constructor(patternList) {
		this.type = "list";
		this.source = patternList;
	}
	get mold() {
		return new ListMold(this);
	}
}

class ListMold {
	constructor(listStruct) {
		this.source = listStruct;
		this.index = 0;
		this.contents = [];
	}
}

class OrStruct {

	//choices is an array of ListStructs
	constructor(choices) {
		this.type = "or";
		this.choices = choices;
	}
	get mold() {
		return new OrMold(this);
	}
}

class OrMold {
	constructor(orStruct) {
		this.source = orStruct;
		this.choice = 0;
		this.molds = [];
		for (var i = 0; i < this.choices.length; i++) {
			this.molds.push(this.source.choices[i].mold);
		}
	}
}

class RepeatStruct {
	constructor(pattern) {
		this.source = pattern;
		this.type = "repeat";
	}
	get mold() {
		return new RepeatMold(this);
	}
}

class RepeatMold {
	constructor(repeatStruct) {
		this.source = repeatStruct;
		this.index = 0;
	}
}