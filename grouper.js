class Grouper {
	constructor(pl, context) {
		this.pl = pl;
		this.context = context;
		this.moves = [];
		this.options = [];
		this.finished = false;
		this.info = '';
	}
	disp() {
		var us = this.upStack;
		var ds = this.downStack;
		var txt = ''
		if (us.length < 5) {
			for (var i = 0; i < us.length; i++) {
				txt += us[i].string2 + '\n';
			}
		} else {
			txt += '...\n';
			for (var i = us.length-4; i < us.length; i++) {
				txt += us[i].string2 + '\n';
			}
		}
		txt += '--------------------------------\n';
		if (ds.length < 5) {
			for (var i = ds.length-1; i >= 0; i--) {
				txt += ds[i].string2 + '\n';
			}
		} else {
			for (var i = ds.length-1; i >= ds.length-4; i--) {
				txt += ds[i].string2 + '\n';
			}
			txt += '...';
		}
		txt += '\n\nMoves: ';
		if (this.moves.length <= 10) {
			for (var i of this.moves) {
				txt += '[' + i + '] ';
			}
		} else {
			txt += '...'
			for (var i = this.moves.length-10; i < this.moves.length; i++) {
				txt += '[' + this.moves[i] + ']';
			}
		}
		pr(txt);
	}
	group3(txt, debug, maxN) {
		this.txt = txt;
		this.downStack = [];
		this.upStack = [this.pl.getPO(this.context)];
		for (var c of txt) {
			var po = this.pl.getPO(c);
			this.downStack.unshift(po);
		}

		this.moves = [[0, 0]];

		var limitMoves = (maxN !== undefined);
		var i = 0;
		var nMoves = 0
		var t0 = performance.now();

		var newMove = true;

		if (debug) {pi();this.disp();pd()};
		while (this.downStack.length > 0 || this.upStack.length !== 1 || !this.upStack[0].complete) {
			if (limitMoves && i === maxN) {pr('maximum iterations exceeded');break;}++i;

			var move = this.move;
			var option = moves[move[0]];
			// pr('Trying ' + option.name + ' (' + move[1] + ')');


			var validMove = true;
			if (newMove) {
				// pr('testing new move');
				validMove = option.validMove(this);
				if (debug && !validMove) {
					pr(i + ': ' + option.name + ' [invalid move]: ' + option.info);
				}
				newMove = false;
			}

			var validIndex = true;
			if (validMove) {
				validIndex = option.validIndex(this);
				if (debug && !validIndex) {
					pr(i + ': ' + option.name + ' [invalid index] ' + option.info);
				}
			}

			if (validMove && validIndex) {
				if (option.canDo(this)) {
					option.Do(this);
					if (debug) pr(i + ': ' + 'Doing ' + option.name);
					nMoves++;
					this.moves.push([0, 0]);
					newMove = true;
					if (debug) {pi();this.disp();pd()};
				} else {
					if (debug) pr(i + ': ' + option.name + '('  + move[1] + ') [can\'t do]: ' + option.info);
					++move[1];
					newMove = true;
				}
			} else {
				if (move[0]+1 === moves.length) {
					// backtrack
					this.moves.pop();
					if (this.moves.length === 0) {
						var time = Math.ceil(1000*(performance.now() - t0))/1000;
						this.info = "Didn't finish with " + i + ' iterations in ' + time + ' ms.';
						return;
					}
					move = this.move;
					option = moves[move[0]];
					option.undo(this);
					++move[1];
					if (debug) pr(i + ': ' + 'undoing ' + option.name);
					if (debug) {pi();this.disp();pd()};
				} else {
					this.moves[this.moves.length-1] = [move[0]+1, 0];
					newMove = true;
				}
			}
		}
		this.finished = true;
		var time = Math.ceil(1000*(performance.now() - t0))/1000;
		this.info = 'Grouped with ' + i + ' iterations and ' + this.moves.length + ' moves in ' + time + ' ms.';
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
	get move() {
		return this.moves[this.moves.length-1];
	}
	get lastMove() {
		return this.moves[this.moves.length-2];
	}
}

/*
The problem is, dealing with zero character patterns like optionals an repeats
*/