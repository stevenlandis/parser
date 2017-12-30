(function() {

	var pl = new PatternList();

	pl.String('stuff');

	pl.init();
	// pl.disp();

	var poU = pl.getPO('u');
	var poS = pl.getPO('s');
	var poStuff = pl.getPO(4);

	// console.log(poU);
	// pr(poStuff.string);

	assert(!poStuff.isBelow(poU));
	assert(poStuff.isBelow(poS));

})();

(function() {
	var pl = new PatternList();
		var a = pl.Literal('a');
		var word = pl.List([a, pl.Repeat(a)]);
		var list = pl.List([word, word, word]);
	pl.init();
	// pl.disp();

	var grouper = new Grouper(pl, list);

	grouper.group('aaaaaaaaaaaa');
})();

(function() {
	var pl = new PatternList();
		var wsc = pl.Or([
			pl.Literal(' '),
			pl.Literal('\n'),
			pl.Literal('\t')
		]);
		var rws = pl.Repeat(wsc);
		var ws = pl.List([wsc, rws]);
		var numeral = pl.Range([['0', '9']]);
		var integer = pl.List([numeral, pl.Repeat(numeral)]);
		var decimal = pl.List([
			integer,
			rws,
			pl.Literal('.'),
			rws,
			integer
		]);
		var negInt = pl.List([
			pl.Literal('-'),
			integer
		]);
		var exponent = pl.List([
			pl.Or([integer, decimal]),
			rws,
			pl.Or([pl.Literal('e'), pl.Literal('E')]),
			rws,
			pl.Or([integer, negInt])
		]);
		var posNum = pl.Or([integer, decimal, exponent]);
		var negNum = pl.List([
			pl.Literal('-'),
			posNum
		]);
		var number = pl.Or([posNum, negNum]);
	pl.init();
	// pl.disp();

	var grouper = new Grouper(pl, number);

	grouper.group('-100.123 e -42');
})();

var track = 5;

switch(track) {
	case 0:
		var pl = new PatternList();
		var letter = pl.Range([['a','z'],['A','Z']]);

		var word = pl.List([letter,pl.Repeat(letter)]);

		var VAR = pl.String('var');
		var FOR = pl.String('for');

		var keyWords = pl.Or([VAR,FOR]);

		var identifier = word;

		var numeral = pl.Range([['0','9']]);
		var number = pl.List([numeral, pl.Repeat(numeral)]);

		var wsc = pl.Or([pl.Literal(' '), pl.Literal('\t'), pl.Literal('\n')]);

		var rws = pl.Repeat(wsc);
		var ws = pl.List([wsc, rws]);

		var init = pl.List([
			VAR,
			ws,
			identifier,
			ws,
			pl.Literal('='),
			pl.Literal('='),
			ws,
			number,
			pl.Literal(';')
		]);

		var assignment = pl.List([
			identifier,
			ws,
			pl.Literal('='),
			pl.Literal('='),
			ws,
			number,
			pl.Literal(';')
		]);

		var expression = pl.Or([
			init, assignment
		]);

		pl.init();

		var grouper = new Grouper(pl, 'var  i      ==  12345;', expression);
		grouper.group();
		break;
	case 1:
		var pl = new PatternList();
		var letter = pl.Range([['a','z'],['A','Z']]);

		var word = pl.List([
			letter, letter, pl.Repeat(letter)
		]);

		var list = pl.List([word, word]);

		pl.init();
		pl.disp();

		var g = new Grouper(pl, 'aaaaaaaaa', list);
		g.group();
		break;
	case 2:
		var pl = new PatternList();
		var letter = pl.Range([['a','z'],['A','Z']]);

		var word = pl.List([
			letter, letter, letter, pl.Repeat(letter)
		]);

		var list = pl.List([word, word, word]);

		pl.init();
		pl.disp();

		var g = new Grouper(pl, 'aaaaaaaaaaaaa', list);
		g.group();
		break;
	case 3:
		var pl = new PatternList();
		var letter = pl.Range([['a','z'],['A','Z']]);

		var word = pl.List([letter,pl.Repeat(letter)]);

		var VAR = pl.String('var');
		var FOR = pl.String('for');

		var keyWords = pl.Or([VAR,FOR]);

		var identifier = word;

		var numeral = pl.Range([['0','9']]);
		var number = pl.List([numeral, pl.Repeat(numeral)]);

		var wsc = pl.Or([pl.Literal(' '), pl.Literal('\t'), pl.Literal('\n')]);

		var rws = pl.Repeat(wsc);
		var ws = pl.List([wsc, rws]);

		var init = pl.List([
			VAR,
			ws,
			identifier,
			rws,
			pl.Literal('='),
			rws,
			number,
			pl.Literal(';')
		]);

		var assignment = pl.List([
			identifier,
			ws,
			pl.Literal('='),
			ws,
			number,
			pl.Literal(';')
		]);

		var expression = pl.Or([
			init, assignment
		]);

		pl.init();
		// pl.disp();

		var grouper = new Grouper(pl, 'var  i = 12345;', expression);
		grouper.group();
		break;
	default:
		// throw Error('Undefined track');
}