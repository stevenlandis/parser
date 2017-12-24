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
		this.moves = [[0]];
		this.finished = false;
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
	group() {
		pr('Grouping "' + this.txt + '"');
		var n = 200;
		while (this.downStack.length > 0 || this.upStack.length !== 1 || !this.upStack[0].complete) {
			// if (n <= 0) {pr('maximum iterations exceeded');break;}--n;
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
						this.undo();

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

				if (move[1] >= upNode.parents.length && downNode.constructor === LiteralPO && downNode.canCycle) {
					// pr('SUPER UPGRADE');
					downNode.chooseChoice();
					for (var i = 0; i < this.downStack.length-1; i++) {
						var pat = this.downStack[i];

						if (pat.constructor === LiteralPO) {
							// pr('Resetting ' + pat.string);
							pat.resetChoice();
						}
					}
					this.moves.pop();
					this.moves.push([0]);
				}
				break;
			default:
				throw Error('Unknown undo move type: ' + move[0]);
		}
	}
}

/*
The problem is, dealing with zero character patterns like optionals an repeats
*/