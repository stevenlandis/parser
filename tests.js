var tests = {};

tests.below = function() {
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
}

tests.backtrackList = function() {
	var pl = new PatternList();
		var a = pl.Literal('a');
		var word = pl.List([a, pl.Repeat(a)]);
		var list = pl.List([word, word, word]);
	pl.init();
	// pl.disp();

	var grouper = new Grouper(pl, list);

	var g = pl.group('aaaaaaaaaa', list, false);

	tests.dispInfo(g);
}

tests.mathPrecedence = function() {
	var pl = new PatternList();
		var wsc = pl.Or([
			pl.Literal(' '),
			pl.Literal('\n'),
			pl.Literal('\t')
		]);
		var rws = pl.Repeat(wsc);
		pl.name(rws, 'rws');
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
		pl.name(number, 'number');

		var paren = pl.Reserve();

		var node = pl.Or([number, paren]);

		var exponent = pl.List([
			node,
			rws,
			pl.Literal('^'),
			rws,
			node,
			pl.Repeat(pl.List([
				rws,
				pl.Literal('^'),
				rws,
				node
			]))
		]);
		pl.name(exponent, 'exponent');

		var multNode = pl.Or([node, exponent]);
		var mult = pl.List([
			multNode,
			pl.Literal('*'),
			multNode,
			pl.Repeat(pl.List([
				pl.Literal('*'),
				multNode
			]))
		]);
		pl.name(mult, 'multiplication');

		var addNode = pl.Or([multNode, mult]);
		var add = pl.List([
			addNode,
			pl.Literal('+'),
			addNode,
			pl.Repeat(pl.List([
				pl.Literal('+'),
				addNode
			]))
		]);
		pl.name(add, 'add');

		var expression = pl.Or([
			number,
			exponent,
			mult,
			add,
			paren
		]);

		pl.DefList(paren, [
			pl.Literal('('),
			expression,
			pl.Literal(')')
		]);
		pl.name(paren, 'parenthases');
	pl.init();
	// pl.disp();

	var g = pl.group('1+2*3^4*5+6', expression);
	tests.dispInfo(g);
}

tests.addition = function() {
	var pl = new PatternList();
		var ws = pl.Literal(' ');
		var rws = pl.Repeat(ws);

		var numeral = pl.Range([['0', '9']]);
		var number = pl.List([
			numeral,
			pl.Repeat(numeral)
		]);

		var add = pl.List([
			number,
			rws,
			pl.Literal('+'),
			rws,
			number,
			pl.Repeat(pl.List([
				rws,
				pl.Literal('+'),
				rws,
				number
			]))
		]);

	pl.init();
	// pl.disp();

	pl.group('1 + 1 + 1', add);
}

tests.endParens = function() {
	var pl = new PatternList();
		var letter = pl.Range([['A', 'Z'], ['a', 'z']]);
		var word = pl.Reserve();
		pl.DefList(word, [
			letter,
			pl.Repeat(letter)
		]);
		pl.name(word, 'word');

		var thing = pl.Reserve();
		pl.DefList(thing, [
			pl.Or([thing, word]),
			pl.Literal(')')
		]);
		pl.name(thing, 'thing');
	pl.init();
	// pl.disp();

	pl.group('stuff)))))))))', thing);
}

tests.startParens = function() {
	var pl = new PatternList();
		var letter = pl.Range([['A', 'Z'], ['a', 'z']]);
		var word = pl.Reserve();
		pl.DefList(word, [
			letter,
			pl.Repeat(letter)
		]);
		pl.name(word, 'word');

		var thing = pl.Reserve();
		pl.DefList(thing, [
			pl.Literal('('),
			pl.Or([thing, word])
		]);
		pl.name(thing, 'thing');
	pl.init();
	// pl.disp();

	var g = pl.group('(((((stuff', thing);
	tests.dispInfo(g);
}

tests.parens = function() {
	var pl = new PatternList();
		var letter = pl.Range([['A', 'Z'], ['a', 'z']]);
		var word = pl.Reserve();
		pl.DefList(word, [
			letter,
			pl.Repeat(letter)
		]);
		pl.name(word, 'word');

		var thing = pl.Reserve();
		pl.DefList(thing, [
			pl.Literal('('),
			pl.Or([thing, word]),
			pl.Literal(')')
		]);
		pl.name(thing, 'thing');
	pl.init();
	// pl.disp();

	var g = pl.group('(((((s)))))', thing);
	tests.dispInfo(g);
}

tests.javascript = function() {
	var pl = new PatternList();
	var letter = pl.Range([['a','z'],['A','Z']]);

	var word = pl.List([letter,pl.Repeat(letter)]);

	var VAR = pl.String('var');
	var FOR = pl.String('for');

	var keyWords = pl.Or([VAR,FOR]);

	var identifier = pl.List([
		word,
		pl.Repeat(pl.List([
			pl.Literal('.'),
			word
		]))
	]);
	pl.name(identifier, 'identifier');

	var numeral = pl.Range([['0','9']]);
	var number = pl.List([numeral, pl.Repeat(numeral)]);
	pl.name(number, 'number');

	var wsc = pl.Or([pl.Literal(' '), pl.Literal('\t'), pl.Literal('\n')]);

	var rws = pl.Repeat(wsc);
	var ws = pl.List([wsc, rws]);
	pl.name(ws, 'ws');

	var init = pl.List([
		VAR,
		ws,
		identifier,
		rws,
		pl.Literal('='),
		rws,
		number
	]);

	var assignment = pl.List([
		identifier,
		rws,
		pl.Literal('='),
		rws,
		number
	]);

	var increment = pl.List([
		identifier,
		pl.Literal('+'),
		pl.Literal('+')
	]);

	var comparison = pl.List([
		pl.Or([
			number,
			identifier
		]),
		rws,
		pl.Or([
			pl.Literal('<'),
			pl.Literal('>')
		]),
		rws,
		pl.Or([
			number,
			identifier
		])
	]);

	var func = pl.List([
		identifier,
		rws,
		pl.Literal('('),
		pl.Literal(')')
	]);

	var expression = pl.Or([
		init,
		assignment,
		increment,
		comparison,
		func
	]);

	var forLoop = pl.Reserve();

	var content = pl.Or([
		forLoop,
		pl.List([
			expression,
			rws,
			pl.Literal(';')
		])
	]);

	var contentList = pl.List([
		content,
		pl.Repeat(pl.List([
			rws,
			content
		]))
	]);

	pl.name(expression, 'expression');

	pl.DefList(forLoop, [
		FOR,
		rws,
		pl.Literal('('),
		rws,
		expression,
		rws,
		pl.Literal(';'),
		rws,
		expression,
		rws,
		pl.Literal(';'),
		rws,
		expression,
		rws,
		pl.Literal(')'),
		rws,
		pl.Literal('{'),
		rws,
		contentList,
		rws,
		pl.Literal('}')
	]);
	pl.name(forLoop, 'for loop');

	pl.init();
	// pl.disp();

	var g = pl.group('for (var i = 0; i < 10;i++) {\n\tk++;\n}\ntiberious++;', contentList);
	tests.dispInfo(g);

	// pr(pl);
	g = pl.group('for (var i = 0; i < 10; i++) {\n\tvar j = 2;\n\tvar k = 5;\n\tk = 17;\n\tk++;\n\tk++;\n\tk++;\n\tk++;\n\tk++;\n\tk++;\n\tk++;\n\tk++;\n\tk++;\n\tk++;\n\tk++;\n}', contentList);
	tests.dispInfo(g);
}

tests.twoBacktrackList = function() {
	var pl = new PatternList();
	var letter = pl.Range([['a','z'],['A','Z']]);

	var word = pl.List([
		letter, letter, pl.Repeat(letter)
	]);
	pl.name(word, 'word');

	var list = pl.List([word, word]);

	pl.init();
	// pl.disp();

	var g = pl.group('aaaaaaaaa', list);
	tests.dispInfo(g);
}

tests.threeBacktrackList = function() {
	var pl = new PatternList();
	var letter = pl.Range([['a','z'],['A','Z']]);

	var word = pl.List([
		letter, letter, letter, pl.Repeat(letter)
	]);

	var list = pl.List([word, word, word, word, word, word, word]);

	pl.init();
	// pl.disp();

	var g = pl.group('aaaaaaaaaaaaaaaaaaaaaaaaaaaaa', list);
	tests.dispInfo(g);
}

tests.simpleJavascript = function() {
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

	var g = pl.group('var  i = 12345;', expression);
	tests.dispInfo(g);
}

tests.ignorable = function() {
	var pl = new PatternList();

	var list = pl.List([
		pl.Ignorable(pl.Literal('a')),
		pl.Ignorable(pl.Literal('b')),
		pl.Ignorable(pl.Literal('c')),
		pl.Ignorable(pl.Literal('d')),
		pl.Ignorable(pl.Literal('e'))
	]);

	pl.init();

	// pl.disp();
	var g = pl.group('abcde', list);
	tests.dispInfo(g);
	g = pl.group('bcde', list);
	tests.dispInfo(g);
	g = pl.group('acde', list);
	tests.dispInfo(g);
	g = pl.group('abde', list);
	tests.dispInfo(g);
	g = pl.group('abce', list);
	tests.dispInfo(g);
	g = pl.group('abcd', list);
	tests.dispInfo(g);
	// Test warning:
	// g = pl.group('ba', list);
	// tests.dispInfo(g);
};

tests.except = function() {
	var pl = new PatternList();

	var letter = pl.Range([['a', 'z']]);
	var reserved = pl.Or([
		pl.String('var'),
		pl.String('fore')
	]);

	var word = pl.Except(
		pl.List([letter, pl.Repeat(letter)]),
		reserved
	);

	pl.init();
	// pl.disp();

	var g;
	g = pl.group('fore', word);
	tests.dispInfo(g);
	g = pl.group('var', word);
	tests.dispInfo(g);
	g = pl.group('foree', word);
	tests.dispInfo(g);
	g = pl.group('va', word);
	tests.dispInfo(g);
};

tests.dispInfo = function(g) {
	pr('Grouping "' + g.txt + '"');

	pi();
		if (g.finished) {
			pr(g.info);
			pr(g.string);
		} else {
			pw('Failed to group:');
			pr(g.info);
		}
	pd();
};



tests.do = function() {
	tests.below();
	tests.backtrackList();
	tests.mathPrecedence();
	tests.addition();
	tests.endParens();
	tests.startParens();
	tests.parens();
	tests.javascript();
	tests.twoBacktrackList();
	tests.threeBacktrackList();
	tests.simpleJavascript();
	tests.ignorable();
	tests.except();
}