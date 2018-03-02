/*
Object Ranges

Objects fall into two categories:
1. Literals and Literal Ranges
2. Pattern Objects

Object ranges are sets that hold lots of Literals and Pattern Objects

Functions:

constructor(patterns, range) -> nothing
	patterns: Set or undefined
	range: CharRange or undefined or [[char1, char2], [char3, char4], ...]

add(object) -> nothing
	object: int or char [char1, char2] or CharRange

has(object) -> boolean
	object: int or char
*/

class ObjectRange {
	constructor(patterns, range) {
		// set this.range
		if (range === undefined) {
			this.range = new CharRange();
		}
		else if (range.constructor === CharRange) {
			this.range = range.copy();
		}
		else if (range.constructor === Array) {
			this.range = new CharRange(range);
		}

		// set this.patterns
		if (patterns === undefined) {
			this.patterns = new Set();
		}
		else if (patterns.constructor === Set) {
			this.patterns = new Set(patterns);
		}
	}
	add(object) {
		if (typeof object === 'object') {
			if (object.constructor === CharRange) {
				this.range.append(object);
			}
			else if (object.constructor === Array && object.length === 2
			) {
				this.range.add(object);
			}
		} else {
			if (typeof object === 'number') {
				this.patterns.add(object);
			}
			else if (typeof object === 'string') {
				this.range.add([object, object]);
			}
		}
	}
	has(object) {
		if (
			typeof object === 'string' && this.range.has(object) ||
			typeof object === 'number' && this.patterns.has(object)
		) {
			return true;
		}
		return false;
	}
}