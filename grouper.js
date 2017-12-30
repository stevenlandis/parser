class Grouper {
	constructor(pl, context) {
		this.pl = pl;
		this.context = context;
		this.moves = [];
		this.options = [];
		this.finished = false;

		// add the options
		// push up
		this.addMove(
			'Push Up',

			// valid index
			function() {
				return this.index === 0;
			},

			// can do
			function() {
				if (this.grouper.downStack.length === 0) {
					return false;
				}
				var upNode = this.grouper.upNode;
				var downNode = this.grouper.downNode;

				return upNode.isBelow(downNode);
			},

			// do
			function() {
				this.grouper.upStack.push(this.grouper.downStack.pop());
			},

			// undo
			function() {
				this.grouper.downStack.push(this.grouper.upStack.pop());
			}
		);

		// collapse
		this.addMove(
			'Collapse',

			// valid index
			function() {
				return this.index === 0;
			},

			// can do
			function() {
				var grandparent = this.grouper.grandparent;
				var upNode = this.grouper.upNode;

				return upNode.complete && grandparent.isDirectlyBelow(upNode);
			},

			// do
			function() {
				var grandparent = this.grouper.grandparent;
				var upNode = this.grouper.upNode;

				grandparent.add(upNode);

				if (this.grouper.upStack.length === 1) {
					this.grouper.upStack[0] = grandparent;
				} else {
					this.grouper.upStack.pop();
				}
			},

			// undo
			function() {
				var upNode = this.grouper.upNode;
				var pat = upNode.pop();

				this.grouper.upStack.push(pat);
			}
		);

		// upgrade
		this.addMove(
			'Upgrade',

			// valid index
			function() {
				var upNode = this.grouper.upNode;
				return this.index < upNode.parents.length;
			},

			// can do
			function() {
				var upNode = this.grouper.upNode;

				if (!upNode.complete) {
					return false;
				}

				var grandparent = this.grouper.grandparent;
				var parentUpgrade = upNode.parents[this.index];

				if (parentUpgrade[1] !== 0) {
					return false;
				}

				var testPO = this.grouper.pl.getPO(parentUpgrade[0]);

				return grandparent.isBelow(testPO);
			},

			// do
			function() {
				var upNode = this.grouper.upNode;
				var parentUpgrade = upNode.parents[this.index];

				var testPO = this.grouper.pl.getPO(parentUpgrade[0]);
				testPO.add(upNode);

				this.grouper.upStack.pop();
				this.grouper.upStack.push(testPO);
			},

			// undo
			function() {
				var pat = this.grouper.upNode.pop();
				this.grouper.upStack.pop();
				this.grouper.upStack.push(pat);
			}
		);

		// cycle
		this.addMove(
			'Cycle',

			// valid index
			function() {
				if (this.grouper.downStack.length < 1) {
					return false;
				}

				var downNode = this.grouper.downNode;

				if (downNode.constructor !== LiteralPO) {
					return false;
				}

				if (this.index === 0 && downNode.choiceI !== 0) {
					return false;
				}

				return downNode.canChoose(this.index + 1);
			},

			// can do
			function() {
				return true;
			},

			// do
			function() {
				var downNode = this.grouper.downNode;

				downNode.choose(this.index+1);
			},

			// undo
			function() {
				var downNode = this.grouper.downNode;

				downNode.choose(0);
			}
		);

		// skip
		this.addMove(
			'Skip',

			// valid index
			function() {
				return this.index === 0;
			},

			// can do
			function() {
				var upNode = this.grouper.upNode;

				if (upNode.constructor !== PatternPO) {
					return false;
				}

				return upNode.canSkip();
			},

			// do
			function() {
				this.grouper.upNode.skip();
			},

			// undo
			function() {
				this.grouper.upNode.unSkip();
			}
		);
	}
	addMove(name, validIndex, canDo, Do, Undo) {
		this.options.push(new Move(this, name, validIndex, canDo, Do, Undo));
	}
	disp() {
		var us = this.upStack;
		var ds = this.downStack;
		var txt = ''
		if (us.length < 5) {
			for (var i = 0; i < us.length; i++) {
				txt += us[i].string + '\n';
			}
		} else {
			txt += '...\n';
			for (var i = us.length-4; i < us.length; i++) {
				txt += us[i].string + '\n';
			}
		}
		txt += '--------------------------------\n';
		if (ds.length < 5) {
			for (var i = ds.length-1; i >= 0; i--) {
				txt += ds[i].string + '\n';
			}
		} else {
			for (var i = ds.length-1; i >= ds.length-4; i--) {
				txt += ds[i].string + '\n';
			}
			txt += '...';
		}
		txt += '\n\nMoves: ';
		for (var i of this.moves) {
			txt += '[' + i + '] ';
		}
		pr(txt);
	}
	group(txt) {
		var debug = false;

		this.txt = txt;
		this.downStack = [];
		this.upStack = [this.pl.getPO(this.context)];
		for (var c of txt) {
			var po = this.pl.getPO(c);
			this.downStack.unshift(po);
		}

		this.moves = [[0, 0]];
		pr('Grouping "' + this.txt + '"');

		if (debug) {pi();this.disp();pd();}

		var n = 500;
		var i = 0;
		while (this.downStack.length > 0 || this.upStack.length !== 1 || !this.upStack[0].complete) {
			// if (n <= 0) {pr('maximum iterations exceeded');break;}--n;

			var move = this.moves[this.moves.length-1];
			var option = this.options[move[0]];
			option.index = move[1];

			if (option.isValidIndex()) {
				if (option.canDo()) {
					option.Do();
					this.moves.push([0, 0]);
					if (debug) pr(option.name);
				} else {
					// go to the next move
					if (debug) pr('Going to next move');
					++move[1];
				}
			} else {
				// check if move is the last
				if (move[0]+1 === this.options.length) {
					try {
						this.backtrack();
					} catch(err) {
						throw Error('Out of moves after ' + i + ' iterations.');
					}
					if (debug) pr('Undo: ' + option.name);
				} else {
					this.moves[this.moves.length-1] = [move[0]+1, 0];
					if (debug) pr('Going to next option');
				}
			}

			++i;

			if (debug) {pi();this.disp();pd();}
		}
		this.finished = true;
		pr('It\'s done with ' + i + ' iterations and ' + this.moves.length + ' moves.');
		pr(this.string);
		// pr(this.upStack[0]);
	}
	backtrack() {
		this.moves.pop();

		if (this.moves.length === 0) {
			throw Error('Out of moves to undo!');
		}

		var move = this.moves[this.moves.length-1];

		var option = this.options[move[0]];
		option.index = move[1];

		option.undo();

		++move[1];
	}
	group2() {
		this.moves.push([0]);
		pr('Grouping "' + this.txt + '"');
		var n = 200;
		while (this.downStack.length > 0 || this.upStack.length !== 1 || !this.upStack[0].complete) {
			if (n <= 0) {pr('maximum iterations exceeded');break;}--n;
			// pr('-------- Iteration ' + n);

			var downNode = this.downStack[this.downStack.length-1];
			var upNode = this.upStack[this.upStack.length-1];
			var move = this.moves[this.moves.length-1];

			if (this.downStack.length === 0 && this.upStack.length === 1 && !this.upStack[0].complete) {
				// pr('special');
				this.moves.pop();
				this.undo();
				continue;
			}

			switch(move[0]) {
				case 0:
					// pr('Trying to push up');
					if (upNode.isBelow(downNode)) {
						// pr('It can push up');
						this.upStack.push(this.downStack.pop());
						if (this.downStack.length === 0) {
							this.moves.push([1]);
						} else {
							this.moves.push([0]);
						}
					} else {
						// pr('It can\'t push up');
						this.moves.pop();
						this.moves.push([1]);
					}
					break;
				case 1:
					// pr('Trying to collapse up');
					var grandparent;
					if (this.upStack.length === 1) {
						grandparent = pl.getPO(this.context);
					} else {
						grandparent = this.upStack[this.upStack.length - 2];
					}

					if (grandparent.isDirectlyBelow(upNode) && upNode.complete) {
						// pr('Can collapse up');
						grandparent.add(upNode);
						if (this.upStack.length === 1) {
							this.upStack[0] = grandparent;
						} else {
							this.upStack.pop();
						}
						if (this.downStack.length === 0) {
							this.moves.push([1]);
						} else {
							this.moves.push([0]);
						}
					} else {
						// pr('can\'t collapse up');
						this.moves.pop();
						this.moves.push([2, 0]);
					}
					break;
				case 2:
					// pr('Trying to upgrade');

					if (move[1] >= upNode.parents.length) {
						// pr('no more possible upgrades, need to backtrack');
						// undo the last move
						this.moves.pop();
						// this.undo();
						this.moves.push([3]);

						break;
					}

					var grandparent;
					if (this.upStack.length == 1) {
						grandparent = pl.getPO(this.context);
					} else {
						grandparent = this.upStack[this.upStack.length - 2];
					}
					// pr('Grandparent: ' + grandparent.string);

					var parentUpgrade = upNode.parents[move[1]];
					if (parentUpgrade[1] === 0) {
						var testPO = this.pl.getPO(parentUpgrade[0]);
						// pr('upgrade: ' + testPO.string);
						if (grandparent.isBelow(testPO)) {
							// pr('this upgrade works');
							// testPO.add(upNode);
							this.upStack.pop();
							this.upStack.push(testPO);
							this.upStack.push(upNode);
							
							if (this.downStack.length === 0) {
								this.moves.push([1]);
							} else {
								this.moves.push([0]);
							}
						} else {
							// pr('this upgrade does not work');
							move[1]++;
						}
					} else {
						// pr('Upgrade is invalid because not zero indexed');
						move[1]++;
					}
					break;
				case 3:
					// trying to cycle
					// not hooked up yet
					pr('cycling');
					if (downNode.constructor !== LiteralPO || !downNode.canCycle) {
						pr('can\'t cycle');
						pr('choosing ' + move[1] + ' which is ' + downNode.canChoose(move[1]));
						this.moves.pop();
						this.undo();

						break;
					}

					// can cycle 
					downNode.chooseChoice();
					this.moves.push([0]);

					break;
				default:
					throw Error('Unknown move type: ' + move[0]);
			}

			pi();this.disp();pd();
		}
		pr('it\'s done');
		pr(this.string);
		this.finished = true;
	}
	get string() {
		var res = '';
		for (var i of this.upStack) {
			res += '[' + i.result;
		}
		for (var i of this.upStack) {
			res += ']';
		}
		return res;
	}
	undo() {
		var downNode = this.downStack[this.downStack.length-1];
		if (this.moves.length === 0) {
			if (downNode.constructor === LiteralPO && downNode.canCycle) {
				downNode.chooseChoice();
				for (var i = 0; i < this.downStack.length-1; i++) {
					var pat = this.downStack[i];

					if (pat.constructor === LiteralPO) {
						// pr('Resetting ' + pat.string);
						pat.resetChoice();
					}
				}
				this.moves.push([0]);
				return;
			} else {
				throw Error('Out of moves to undo');
			}
		}

		
		var upNode = this.upStack[this.upStack.length-1];
		var move = this.moves[this.moves.length-1];

		// pr('Undoing ' + move);
		switch(move[0]) {
			case 0:
				// undo a push up
				if (this.upStack.length < 1) {
					throw Error('There has to be at least one PO in upstack');
				}
				this.downStack.push(this.upStack.pop());
				this.moves.pop();
				this.moves.push([1]);
				break;
			case 1:
				// undo a collapse
				var pat = upNode.pop();
				this.upStack.push(pat);

				this.moves.pop();
				this.moves.push([2, 0]);
				break;
			case 2:
				// undo an upgrade
				var pat = this.upStack.pop();
				this.upStack.pop();
				this.upStack.push(pat);
				// this.upStack.pop();
				// this.upStack.push(pat);
				upNode = this.upStack[this.upStack.length-1];

				move[1]++;

				// if (move[1] >= upNode.parents.length && downNode.constructor === LiteralPO && downNode.canCycle) {
				// 	// pr('SUPER UPGRADE');
				// 	downNode.chooseChoice();
				// 	for (var i = 0; i < this.downStack.length-1; i++) {
				// 		var pat = this.downStack[i];

				// 		if (pat.constructor === LiteralPO) {
				// 			// pr('Resetting ' + pat.string);
				// 			pat.resetChoice();
				// 		}
				// 	}
				// 	this.moves.pop();
				// 	this.moves.push([0]);
				// }
				break;
			case 3:
				// undo a choose
				downNode.unChooseChoice();
				this.moves.pop();
				this.undo();

				break;
			default:
				throw Error('Unknown undo move type: ' + move[0]);
		}
	}
	get upNode() {
		return this.upStack[this.upStack.length-1];
	}
	get downNode() {
		return this.downStack[this.downStack.length-1];
	}
	get grandparent() {
		if (this.upStack.length < 2) {
			return this.pl.getPO(this.context);
		} else {
			return this.upStack[this.upStack.length-2];
		}
	}
}

/*
The problem is, dealing with zero character patterns like optionals an repeats
*/