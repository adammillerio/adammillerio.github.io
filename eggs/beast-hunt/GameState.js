var GameState = function(game) {
	this.board = undefined;
}

GameState.prototype.preload = function() {
}

GameState.prototype.create = function() {
	// Draw the grid
	this.board = new Board(6, 5, 3);
}

GameState.prototype.update = function() {
	this.board.update();
}
