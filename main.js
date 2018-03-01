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
	pl.Literal('='),
	rws,
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
// pl.disp();

// var grouper = new Grouper(pl, expression);

// var g = pl.group('var jollyworth == 583;', expression);
// pr(g.string);
// pr(g.info);