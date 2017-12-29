class Grouper {
	constructor(pl, txt, context) {
		this.pl = pl;
		this.txt = txt;
		this.context = context;
		this.upStack = [pl.getPO(context)];
		this.downStack = [];
		for (var c of txt) {
			var po = pl.getPO(c);
			this.downStack.unshift(po);
		}
		this.moves = [];
		this.options = [];
		this.finished = false;
	}
	addMove(validIndex, canDo, Do, Undo) {
		this.options.push(new Move(this, validIndex, canDo, Do, Undo));
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
	group2() {
		this.moves.push([0, 0]);
		pr('Grouping "' + this.txt + '"');

		// pi();this.disp();pd();

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
				} else {
					// go to the next move
					// pr('Going to next move');
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
				} else {
					this.moves[this.moves.length-1] = [move[0]+1, 0];
					// pr('Going to next option');
				}
			}

			++i;

			// pi();this.disp();pd();
		}
		this.finished = true;
		pr('It\s done with ' + i + ' iterations.');
		pr(this.string);
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
	group() {
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
			return pl.getPO(this.context);
		} else {
			return this.upStack[this.upStack.length-2];
		}
	}
}

/*
The problem is, dealing with zero character patterns like optionals an repeats
*/