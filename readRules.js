function readRules(file) {
	var pl = new PatternList();

	var letter = pl.Range([['a', 'z'], ['A', 'Z']]);
	pl.name(letter, 'letter');

	var numeral = pl.Range([['0', '9']]);
	pl.name(numeral, 'numeral');

	var idChar = pl.Or([letter, numeral]);

	var identifier = pl.List([idChar, pl.Repeat(idChar)]);
	pl.name(identifier, 'identifier');

	var normalChar = pl.Range([[' ', '~']]);
	var escapeChars = pl.Or([
		pl.String('\\n'),
		pl.String('\\t')
	]);
	var char = pl.Or([normalChar, escapeChars]);

	var literal = pl.List([
		pl.Literal("'"),
		char,
		pl.Literal("'")
	]);

	var wsc = pl.Or([pl.Literal(' '), pl.Literal('\t'), pl.Literal('\n')]);

	var rws = pl.Repeat(wsc);
	var ws = pl.List([wsc, rws]);

	var charRange = pl.List([
		pl.Literal('['),
		rws,
		literal,
		rws,
		pl.Literal(','),
		rws,
		literal,
		rws,
		pl.Literal(']')
	]);
	pl.name(charRange, 'charRange');

	var rangearg = pl.List([
		charRange,
		pl.Repeat(pl.List([
			rws,
			pl.Literal(','),
			rws,
			charRange
		]))
	]);
	pl.name(rangearg, 'range arguments');

	var range = pl.List([
		pl.String('range'),
		rws,
		pl.Literal('{'),
		rws,
		rangearg,
		rws,
		pl.Literal('}')
	]);
	pl.name(range, 'range');

	var pattern = pl.Reserve();

	var listarg =  pl.List([
		pattern,
		pl.Repeat(pl.List([
			rws,
			pl.Literal(','),
			rws,
			pattern
		]))
	]);

	var list = pl.List([
		pl.String('list'),
		rws,
		pl.Literal('{'),
		rws,
		listarg,
		rws,
		pl.Literal('}')
	]);

	var repeat = pl.List([
		pl.String('repeat'),
		rws,
		pl.Literal('{'),
		rws,
		pattern,
		rws,
		pl.Literal('}')
	]);

	var literalPat = pl.List([
		pl.Literal("'"),
		normalChar,
		pl.Repeat(normalChar),
		pl.Literal("'")
	]);

	var orPat = pl.List([
		pl.String('or'),
		rws,
		pl.Literal('{'),
		rws,
		listarg,
		rws,
		pl.Literal('}')
	]);

	pl.DefOr(pattern, [
		identifier,
		range,
		list,
		repeat,
		literalPat,
		orPat
	]);	
	pl.name(pattern, 'pattern');

	var definition = pl.List([
		identifier,
		rws,
		pl.Literal('{'),
		rws,
		pattern,
		rws,
		pl.Literal('}')
	]);
	pl.name(definition, 'definition');

	var doc = pl.List([
		rws,
		pl.Repeat(pl.List([
			definition,
			rws
		]))
	]);

	pl.init();
	// pl.disp();
	// console.log(pl);
	var g = pl.group(testTxt, doc, false);
	pr(g.info);
	pr(g.string);
	pr(g);

}

readRules();