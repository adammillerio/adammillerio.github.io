BoardTile = function(x, y, r, c, type, board) {
	this.sprite = game.add.sprite(x, y, "BoardTile_invisible"); 
	
	this.r = r;
	this.c = c;

	this.board = board;

	//this.sprite = game.add.sprite(x, y, "BoardTile_" + type);

	this.type = type;

	this.visible = false;
	//this.visible = true;

	this.highlighted = false;
	this.highlight = game.add.sprite(x, y, "BoardTile_highlight");

	this.create();
}

BoardTile.prototype.create = function() {
	this.highlight.visible = false;
}

BoardTile.prototype.update = function() {
}

BoardTile.prototype.setType = function(type) {
	if(this.visible == true) {
		this.sprite.loadTexture("BoardTile_" + type);
	}

	this.type = type;
}

BoardTile.prototype.getType = function(type) {
	return this.type;
}

BoardTile.prototype.setVisibility = function(visibility) {
	if(visibility) {
		if(!this.visible) {
			this.visible = true;

			this.sprite.loadTexture("BoardTile_" + this.type);
		}
	}
	else {
		if(this.visible) {
			this.visible = false;

			this.sprite.loadTexture("BoardTile_invisible");
		}
	}
}

BoardTile.prototype.setHighlighted = function(highlighted) {
	if(highlighted) {
		if(!this.highlighted) {
			this.highlighted = true;

			this.highlight.visible = true;
		}
	}
	else {
		if(this.highlighted) {
			this.highlighted = false;

			this.highlight.visible = false;
		}
	}
}
