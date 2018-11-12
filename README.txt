This is a program I built to make it easy to create powerful hierarchical recursive parsers.

A language is made up of a list of patterns. These patterns can either accept or reject a string.

An example of a pattern is String("stuff") which accepts the string "stuff" and rejects everything else.

----------
 Patterns
----------
Literal
	This pattern accepts a single character
	eg: Literal('a')

Range
	This pattern accepts a single character from a range of characters.
	It uses the binary search algorithm to efficiently search through large sets of ranges.

	eg: Range([['a','z'], ['A', 'Z']])
		- accepts all lower and upper case letters

Or
	This pattern accepts any one of a set of patterns.

	eg: Or([String("stuff"), String("things")])
		- accepts either "stuff" or "things"
		- example of how patterns can be defined heirarchically

Repeat
	This pattern accepts its child pattern repeated 0 or more times.

	eg: Repeat(Literal('a'))
		- accepts "", "a", "aa", ...

Ignorable
	This pattern accepts the empty string or its child pattern

	eg: Ignorable(String("stuff"))
		- accepts "" or "stuff"

Except
	This pattern accepts all strings that are one pattern and not another pattern.
	I'm pretty sure this goes beyond context free parsing because it uses the inverse of a language.

	eg: Except(word, String("for"))
		- accepts all words (defined elsewhere) that are not "for"

List
	This pattern accepts a list of patterns one after the other.

	eg: List([String("stuff"), String("and"), String("things")])
		- accepts "stuffandthings" and parses it as ["stuff"]["and"]["things"]

	note: The String pattern is a wrapper for a List of Literals
		String("ab") --> List([Literal("a"), Literal("b")])

----------
 Examples
----------
Define a letter
	var letter = Range([['a', 'z'], ['A', 'Z']])

Define a space
	var space = Literal(" ")

Define a word: at least one letter
	var word = List([
		letter,
		Repeat(letter)
	])

Define a sentence:
	var sentence = List([
		word,
		Repeat(List([
			space,
			word
		])),
		Literal(".")
	])

Define a sentence surrounded with nested parenthases
	var nestedSentence = List([
		Literal("("),
		Or([
			sentence,
			nestedSentence
		])
		Literal(")")
	])

Then, calling group('((((This is a sentence.))))', nestedSentence) will return the parse tree.

------------
 Next Steps
------------
If you want to see some more examples written in javascript (not the pseudocode above), look in tests.js to see a bunch of example pattern lists. These tests also show some more advanced features of the parser such as backtracking and challenging recursive languages.

-------------------
 File Descriptions
-------------------
CharRange.js: class that stores ranges of chars

grouper.js: defines the class that does the parsing

index.html: the empty website for testing the parser. I used chrome's developer console as a log and there is no content on the site. I might migrate this over to Node.js and just use the console.

main.js: the top level program, just runs the tests for now

Move.js: class that defines fundamental operations to parse a language

ObjectRange.js: class that stores a set of patterns and combines all literal patterns into a single CharRange

patternList.js: the main class that stores a list of patterns

patternObject.js: superclass of all patterns

patterns.js: where all the patterns (List, Repeat, Or, ...) are defined

printing.js: helper functions to print debug text heirarcrically with tabs. A more powerful replacement/wrapper for console.log

readRules.js: a test program to define a language for patterns. A way to load patterns from a separate file instead of defining them using javascript.
	rules.txt and test.txt are files used by readRules.js

tests.js: all the test patterns