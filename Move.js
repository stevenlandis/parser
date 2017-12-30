class Move {
	constructor(grouper, name, isValidIndex, canDo, Do, undo) {
		this.grouper = grouper;
		this.name = name;
		this.isValidIndex = isValidIndex;
		this.canDo = canDo;
		this.Do = Do;
		this.undo = undo;
	}
}