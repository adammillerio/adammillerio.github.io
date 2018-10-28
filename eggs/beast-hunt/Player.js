Player = function(board) {
	this.board = board;
	
	// Set position
	this.r = 0;
	this.c = 0;

	this.sprite = game.add.sprite(this.r, this.c, "Player_normal");

	this.status = "alive";

	this.steps = 0;
	
	this.isShooting = false;

	this.create();
}

Player.prototype.create = function() {
	// Randomly pick a valid starting position
	var playerR;
	var playerC;
	var positionValid = true;

	do {
		playerR = Math.floor(Math.random() * (this.board.height));
		playerC = Math.floor(Math.random() * (this.board.width));
		positionValid = true;

		var curTileType = this.board.tiles[playerR][playerC].getType();

		if(curTileType == "beast" || curTileType == "pit" || curTileType == "slide") {
			positionValid = false;
		}
	} while(positionValid == false);

	this.r = playerR;
	this.c = playerC;

	this.board.tiles[this.r][this.c].setVisibility(true);

	this.move(this.r, this.c);
	this.steps--; // Initial movement doesn't count as a step
}

Player.prototype.update = function() {
}

/*
	Player movement

	Note that slide logic is not done here since it requires knowledge of direction.
	You can find it in the initial input handing on the Board.
*/
Player.prototype.move = function(r, c) {
	var nextTile = this.board.tiles[r][c];
	
	if(nextTile.getType() == "beast") {
		this.status = "death_beast";
	}

	// They lose if they fall in the pit
	if(nextTile.getType() == "pit") {
		this.status = "death_pit";
	}

	// Actually move the player
	var x = nextTile.sprite.x + (nextTile.sprite.width / 4);
	var y = nextTile.sprite.y + (nextTile.sprite.height / 4);

	this.sprite.x = x;
	this.sprite.y = y;

	if(nextTile.visible == false) {
		nextTile.setVisibility(true);
	}

	this.r = r;
	this.c = c;

	// Increment the step counter (hard limit at 9999)
	if(this.steps < 9999) {
		this.steps++;
	}
}
