// 0
var pushUp = {};
pushUp.name = 'push up';
pushUp.validMove = function(grouper) {
	// make sure a downNode exists
	if (grouper.downStack.length === 0) {
		this.info = 'downStack has no elements to push up';
		return false;
	}

	// make sure downNode can push up
	var upNode = grouper.upNode;
	var downNode = grouper.downNode;
	if (!upNode.isBelow(downNode)) {
		this.info = 'downNode (' + downNode.result + ') cannot go into upNode (' + upNode.result + ')';
		return false;
	}
	return true;
};
pushUp.validIndex = function(grouper) {
	// only works on first
	if (grouper.move[1] !== 0) {
		this.info = 'Index ' + grouper.move[1] + ' is not 0';
		return false;
	}
	return true;
};
pushUp.canDo = function(grouper) {
	return true;
};
pushUp.Do = function(grouper) {
	// push downstack into upstack
	grouper.upStack.push(grouper.downStack.pop());
};
pushUp.undo = function(grouper) {
	grouper.downStack.push(grouper.upStack.pop());
}

// 1
var collapse = {};
collapse.name = 'collapse';
collapse.validMove = function(grouper) {
	// make sure it doesn't follow a cycle
	if (grouper.moves.length >= 2 && (
			grouper.lastMove[0] === 3 ||
			grouper.lastMove[0] === 4
		)
	) {
		this.info = 'cannot follow a ' + moves[grouper.lastMove[0]].name;
		return false;
	}

	// need at least two nodes in upStack
	if (grouper.upStack.length < 2) {
		this.info = 'upstack does not have at least two POs';
		return false;
	}

	// make sure collapse can happen
	var upNode = grouper.upNode;
	var grandparent = grouper.grandparent;

	// make sure upNode is complete
	if (!upNode.complete) {
		this.info = 'upnode is not complete';
		return false;
	}

	// make sure upnode can fit
	if (!grandparent.isDirectlyBelow(upNode)) {
		this.info = 'upnode cannot fit into grandparent';
		return false;
	}

	return true;
};
collapse.validIndex = function(grouper) {
	// only on first
	if (grouper.move[1] !== 0) {
		this.info = 'must be first index';
		return false;
	}
	return true;
};
collapse.canDo = function(grouper) {
	return true;
};
collapse.Do = function(grouper) {
	var grandparent = grouper.grandparent;
	var upNode = grouper.upNode;

	// collapse and remove upNode
	grandparent.add(upNode);
	grouper.upStack.pop();
};
collapse.undo = function(grouper) {
	var upNode = grouper.upNode;
	var pat = upNode.pop();

	grouper.upStack.push(pat);
};

// 2
var upgrade = {};
upgrade.name = 'upgrade';
upgrade.validMove = function(grouper) {
	var upNode = grouper.upNode;

	if (grouper.moves.length >= 2 && (
			grouper.lastMove[0] === 3 ||
			grouper.lastMove[0] === 4
		)
	) {
		this.info = 'cannot follow a ' + moves[grouper.lastMove[0]].name;
		return false;
	}

	// make sure this node can be upgraded
	if (!upNode.complete) {
		this.info = 'upnode is incomplete';
		return false;
	}

	// make sure there is a node above upnode for context
	if (grouper.upStack.length < 2) {
		this.info = 'no node above for context';
		return false;
	}

	// make sure the preceeding moves are valid
	if (grouper.moves.length >= 2) {
		var lastMove = grouper.lastMove[0];
		if (lastMove === 3 || lastMove === 4) {
			this.info = 'move preceeded by invalid move';
			return false;
		}
	}

	return true;
};
upgrade.validIndex = function(grouper) {
	// looping through upNode.parents.length
	var maxIndex = grouper.upNode.parents.length;
	var index = grouper.move[1];

	if (index >= maxIndex) {
		this.info = 'out of upgrades';
		return false;
	}

	return true;
};
upgrade.canDo = function(grouper) {
	// already know:
	// at least 2 upstack nodes
	// upNode is complete

	var upNode = grouper.upNode;
	var index = grouper.move[1];
	var grandparent = grouper.grandparent;
	var parentUpgrade = upNode.parents[index];

	var testPO = grouper.pl.getPO(parentUpgrade[0]);

	// make sure the upgraded node is first in the new node
	if (parentUpgrade[1] > testPO.pattern.firstSolidIndex) {
		this.info = 'upgrade is not a first upgrade';
		return false;
	}

	// make sure the downNode can fit into the new node
	if (grouper.downStack.length >= 1) {
		var po1 = upNode;
		var up = upNode.parents[index];
		var po2 = grouper.downNode;

		if (!po1.preceedsUp(up, po2)) {
			this.info = 'the following node (' + po2.result + ') will not fit into the upgrade [' + up + ']';
			return false;
		}
	}

	if (!grandparent.isBelow(testPO)) {
		this.info = 'upgrade will not fit into grandparent';
		return false;
	}

	return true;
};
upgrade.Do = function(grouper) {
	var upNode = grouper.upNode;
	var index = grouper.move[1];
	var parentUpgrade = upNode.parents[index];

	var testPO = grouper.pl.getPO(parentUpgrade[0]);
	for (var i = 0; i < parentUpgrade[1]; i++) {
		testPO.skip();
	}
	testPO.add(upNode);

	grouper.upStack.pop();
	grouper.upStack.push(testPO);
};
upgrade.undo = function(grouper) {
	var pat = grouper.upNode.pop();
	grouper.upStack.pop();
	grouper.upStack.push(pat);
};

// 3
var cycle = {};
cycle.name = 'cycle';
cycle.validMove = function(grouper) {
	// make sure there is a node to cycle
	if (grouper.downStack.length === 0) {
		this.info = 'no nodes in downstack';
		return false;
	}

	// make sure the previous move isn't a skip
	if (grouper.moves.length >= 2 && grouper.lastMove[0] === 4) {
		this.info = 'cannot follow a skip';
		return false;
	}

	// make sure the previous move isn't a cycle
	// by making sure the downNode hasn't been cycled
	var downNode = grouper.downNode;
	if (downNode.constructor !== LiteralPO) {
		this.info = 'cannot cycle a non-literal node';
		return false;
	}
	if (downNode.choiceI !== 0) {
		this.info = 'node has already been cycled';
		return false;
	}

	return true;
};
cycle.validIndex = function(grouper) {
	// we know that:
	// downNode is a literal
	var index = grouper.move[1];
	var maxIndex = grouper.downNode.choices.length;

	if (index + 1 >= maxIndex) {
		this.info = 'out of choices to cycle';
		return false;
	}
	return true;
};
cycle.canDo = function(grouper) {
	return true;
};
cycle.Do = function(grouper) {
	var index = grouper.move[1];
	grouper.downNode.choose(index + 1);
}
cycle.undo = function(grouper) {
	grouper.downNode.choose(0);
}

// 4
var skip = {};
skip.name = 'skip';
skip.validMove = function(grouper) {
	var upNode = grouper.upNode;

	if (upNode.constructor !== PatternPO) {
		this.info = 'cannot skip a literal';
		return false;
	}

	// check special list case
	if (grouper.downStack.length > 0 && upNode.pattern.constructor === List) {
		var list = upNode.pattern.list;
		var i = upNode.i;

		if (i < list.length) {
			var po = grouper.pl.getPO(list[i]);

			if (!po.preceeds(grouper.downNode)) {
				this.info = 'the next node will not follow skipped node';
				return false;
			}
		}
	}

	if (!upNode.canSkip()) {
		this.info = 'upNode does not allow skipping';
		return false;
	}

	return true;
};
skip.validIndex = function(grouper) {
	// only works on first
	if (grouper.move[1] !== 0) {
		this.info = 'Index ' + grouper.move[1] + ' is not 0';
		return false;
	}
	return true;
}
skip.canDo = function(grouper) {
	return true;
}
skip.Do = function(grouper) {
	return grouper.upNode.skip();
}
skip.undo = function(grouper) {
	grouper.upNode.unSkip();
}


var moves = [pushUp, collapse, upgrade, cycle, skip];
