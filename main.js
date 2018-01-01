var pl = new PatternList();

// var l1 = pl.Literal('a');
// var l2 = pl.Literal('b');
// var l3 = pl.Literal('c');

// pl.List([
// 	pl.Repeat(l2),
// 	pl.Repeat(l1),
// 	pl.Repeat(l3)
// ]);

// var letter = pl.Range([['a','z'],['A','Z']]);

// var word = pl.Named('word', pl.List([letter,pl.Repeat(letter)]));

// var VAR = pl.String('var');
// var FOR = pl.String('for');

// var keyWords = pl.Named('keyWords', pl.Or([VAR,FOR]));

// var identifier = pl.Except(word, keyWords);

// var numeral = pl.Range([['0','9']]);
// var number = pl.Named('number', pl.List([numeral, pl.Repeat(numeral)]));

// var wsc = pl.Or([pl.Literal(' '), pl.Literal('\t'), pl.Literal('\n')]);

// var rws = pl.Repeat(wsc);
// var ws = pl.Named('whitespace', pl.List([wsc, rws]));

// var init = pl.Named('init', pl.List([
// 	VAR,
// 	ws,
// 	identifier,
// 	ws,
// 	pl.Literal('='),
// 	ws,
// 	number,
// 	pl.Literal(';')
// ]));

// var assignment = pl.Named('assignment', pl.List([
// 	identifier,
// 	ws,
// 	pl.Literal('='),
// 	ws,
// 	number,
// 	pl.Literal(';')
// ]));

// var expression = pl.Named('expression', pl.Or([
// 	init, assignment
// ]));

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

// var container = pl.Reserve();

// pl.defineNamed(container, 'container', pl.List([
// 	pl.Literal('('),
// 	pl.Or([word, container]),
// 	pl.Literal(')')
// ]));

// var thing = pl.Reserve();

// pl.defineNamed(thing, 'thing', pl.Or([word,pl.List([thing, pl.Literal(')')])]));

// var wsc = pl.Or([pl.Literal(' '), pl.Literal('\t'), pl.Literal('\n')]);

// var rws = pl.Repeat(wsc)

// var ws = pl.Named('whitespace', pl.List([wsc, rws]));

// var ows = pl.Named('optional whitespace', rws);

// var spaceList = pl.Named('space list', pl.List([
// 	word,
// 	ws,
// 	word,
// 	pl.Repeat(pl.List([ws, word]))
// ]));


pl.init();
// pl.disp();

// var grouper = new Grouper(pl, expression);

// pl.group('var jollyworth == 583;', expression);