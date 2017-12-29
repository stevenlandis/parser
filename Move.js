class Move {
	constructor(grouper, isValidIndex, canDo, Do, undo) {
		this.grouper = grouper;
		this.isValidIndex = isValidIndex;
		this.canDo = canDo;
		this.Do = Do;
		this.undo = undo;
	}
}