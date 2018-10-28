/*
	Board class to keep track of all of the tile logic.

	Difficulty can be:
		Easy (1): 1 pit, 1 slide
		Medium (2): 2 pits, 2 slides
		Hard (3): 3 pits, 3 slides
*/

Board = function(width, height, difficulty) {
	this.width = width;
	this.height = height;

	this.tiles = new Array();
	this.player = undefined;

	// Local input objects
	this.upKey = game.input.keyboard.addKey(upKey);
	this.downKey = game.input.keyboard.addKey(downKey);
	this.leftKey = game.input.keyboard.addKey(leftKey);
	this.rightKey = game.input.keyboard.addKey(rightKey);
	this.shootKey = game.input.keyboard.addKey(shootKey);

	// UI elements
	this.stepsText = undefined;
	this.timeText = undefined;
	this.statusText = undefined;

	// Time data
	this.timerMinutes = 0;
	this.timerSeconds = 0;

	// Game over
	this.gameOver = false;

	// Debug illuminate key
	this.illuminateKey = game.input.keyboard.addKey(Phaser.Keyboard.TILDE);
	this.illuminated = false;

	this.create(difficulty);
}

Board.prototype.create = function(difficulty) {
	/*
		Board generation happens here.

		There is really no algorithmic way of doing this, unfortunately.
	*/
	// Generate the initial blank board
	var boardX = 0;
	var boardY = 0;
	var tileWidth = game.cache.getImage("BoardTile_normal").width;
	var tileHeight = game.cache.getImage("BoardTile_normal").height;

	for(var r = 0; r < this.height; ++r) {
		var currentTiles = new Array();

		for(var c = 0; c < this.width; ++c) {
			currentTiles.push(new BoardTile(boardX, boardY, r, c, "normal", this));
			boardX += tileWidth;
		}

		this.tiles.push(currentTiles);

		boardX = 0;
		boardY += tileHeight;
	}

	// Place the beast somewhere on the map
	var beastR = Math.floor(Math.random() * (this.height));
	var beastC = Math.floor(Math.random() * (this.width));

	this.tiles[beastR][beastC].setType("beast");

	// Place slides on the map, generates amount based on difficulty
	var slides = new Array();
	for(var a = 1; a <= difficulty; ++a) {
		// Keep generating until a valid slide position is found
		var slideR = 0;
		var slideC = 0;

		var slideValid = true;

		do {
			slideR = Math.floor(Math.random() * (this.height));
			slideC = Math.floor(Math.random() * (this.width));

			slideValid = true;

			// Regenerate if its the same as the beast position
			if(slideR == beastR && slideC == beastC) {
				slideValid = false;
			}

			// Regenerate if its the same as any of the slide positions
			for(var b = 0; b < slides.length; ++b) {
				if(slideR == slides[b][0] && slideC == slides[b][1]) {
					slideValid = false;
				}
			}
		} while (slideValid == false);

		// Create the slide and add it to the list of slides
		this.tiles[slideR][slideC].setType("slide");
		slides.push([slideR, slideC]);
	}

	/*
		Place a warning on any space that is two steps from the beast

		Here is a diagram of where warnings should be placed, slides notwithstanding:

		  2
		 A1B
		87B34
		 D5C
		  6

		The numbers denote the order in which points are tested during this generation.
			1 = beast1R and beast1C
		There isn't really a sophisticated way to do this, so repeated code is going to happen.
		However, I may rework it to make it more algorithmic later
	*/

	// Point 1
	var beast1R = beastR - 1;
	var beast1C = beastC;

	// Initial wraparound check
	if(beast1R < 0) {
		beast1R = this.height - 1;
	}

	// Check the point is a slide, and continue to subtract until it is not
	while(this.tiles[beast1R][beast1C].getType() == "slide") {
		beast1R -= 1;

		// Check for wraparound again
		if(beast1R < 0) {
			beast1R = this.height - 1;
		}
	}

	// Finally set the tile if it is a normal tile
	if(this.tiles[beast1R][beast1C].getType() == "normal") {
		this.tiles[beast1R][beast1C].setType("beastwarning");
	}
	// End Point 1

	// Point A
	var beastAR = beast1R;
	var beastAC = beast1C - 1;

	if(beastAC < 0) {
		beastAC = this.width - 1;
	}

	while(this.tiles[beastAR][beastAC].getType() == "slide") {
		beastAC -= 1;

		if(beastAC < 0) {
			beastAC = this.width - 1;
		}
	}

	if(this.tiles[beastAR][beastAC].getType() == "normal") {
		this.tiles[beastAR][beastAC].setType("beastwarning");
	}
	// End Point A

	// Point B
	var beastBR = beast1R;
	var beastBC = beast1C + 1;

	if(beastBC >= this.width) {
		beastBC = 0;
	}

	while(this.tiles[beastBR][beastBC].getType() == "side") {
		beastBC += 1;

		if(beastBC >= this.width) {
			beastBC = 0;
		}
	}

	if(this.tiles[beastBR][beastBC].getType() == "normal") {
		this.tiles[beastBR][beastBC].setType("beastwarning");
	}
	// End Point B

	// Point 2
	var beast2R = beast1R - 1;
	var beast2C = beast1C;

	if(beast2R < 0) {
		beast2R = this.height - 1;
	}

	while(this.tiles[beast2R][beast2C].getType() == "slide") {
		beast2R -= 1;

		if(beast2R < 0) {
			beast2R = this.height - 1;
		}
	}

	if(this.tiles[beast2R][beast2C].getType() == "normal") {
		this.tiles[beast2R][beast2C].setType("beastwarning");
	}
	// End Point 2

	// Point 3
	var beast3R = beastR;
	var beast3C = beastC + 1;

	if(beast3C >= this.width) {
		beast3C = 0;
	}

	while(this.tiles[beast3R][beast3C].getType() == "slide") {
		beast3C += 1;

		if(beast3C >= this.width) {
			beast3C = 0;
		}
	}

	if(this.tiles[beast3R][beast3C].getType() == "normal") {
		this.tiles[beast3R][beast3C].setType("beastwarning");
	}
	// End Point 3

	// Point C
	var beastCR = beast3R + 1;
	var beastCC = beast3C;

	if(beastCR >= this.height) {
		beastCR = 0;
	}

	while(this.tiles[beastCR][beastCC].getType() == "slide") {
		beastCR += 1;

		if(beastCR >= this.height) {
			beastCR = 0;
		}
	}

	if(this.tiles[beastCR][beastCC].getType() == "normal") {
		this.tiles[beastCR][beastCC].setType("beastwarning");
	}
	// End Point C

	// Point 4
	var beast4R = beast3R;
	var beast4C = beast3C + 1;

	if(beast4C >= this.width) {
		beast4C = 0;
	}

	while(this.tiles[beast4R][beast4C].getType() == "slide") {
		beast4C += 1;

		if(beast4C >= this.width) {
			beast4C = 0;
		}
	}

	if(this.tiles[beast4R][beast4C].getType() == "normal") {
		this.tiles[beast4R][beast4C].setType("beastwarning");
	}

	// Point 5
	var beast5R = beastR + 1;
	var beast5C = beastC;

	if(beast5R >= this.height) {
		beast5R = 0;
	}

	while(this.tiles[beast5R][beast5C].getType() == "slide") {
		beast5R += 1;

		if(beast5R >= this.height) {
			beast5R = 0;
		}
	}

	if(this.tiles[beast5R][beast5C].getType() == "normal") {
		this.tiles[beast5R][beast5C].setType("beastwarning");
	}
	// End Point 5

	// Point D
	var beastDR = beast5R;
	var beastDC = beastC - 1;

	if(beastDC < 0) {
		beastDC = this.width - 1;
	}

	while(this.tiles[beastDR][beastDC].getType() == "slide") {
		beastDC -= 1;

		if(beastDC < 0) {
			beastDC = this.width - 1;
		}
	}

	if(this.tiles[beastDR][beastDC].getType() == "normal") {
		this.tiles[beastDR][beastDC].setType("beastwarning");
	}
	// End Point D

	// Point 6
	var beast6R = beast5R + 1;
	var beast6C = beast5C;

	if(beast6R >= this.height) {
		beast6R = 0;
	}

	while(this.tiles[beast6R][beast6C].getType() == "slide") {
		beast6R += 1;

		if(beast6R >= this.height) {
			beast6R = 0;
		}
	}

	if(this.tiles[beast6R][beast6C].getType() == "normal") {
		this.tiles[beast6R][beast6C].setType("beastwarning");
	}
	// End Point 6

	// Point 7
	var beast7R = beastR;
	var beast7C = beastC - 1;

	if(beast7C < 0) {
		beast7C = this.width - 1;
	}

	while(this.tiles[beast7R][beast7C].getType() == "slide") {
		beast7C -= 1;

		if(beast7C < 0) {
			beast7C = this.width - 1;
		}
	}

	if(this.tiles[beast7R][beast7C].getType() == "normal") {
		this.tiles[beast7R][beast7C].setType("beastwarning");
	}
	// End Point 7

	// Point 8
	var beast8R = beast7R;
	var beast8C = beast7C - 1;

	if(beast8C < 0) {
		beast8C = this.width - 1;
	}

	while(this.tiles[beast8R][beast8C].getType() == "slide") {
		beast8C -= 1;

		if(beast8C < 0) {
			beast8C = this.width - 1;
		}
	}

	if(this.tiles[beast8R][beast8C].getType() == "normal") {
		this.tiles[beast8R][beast8C].setType("beastwarning");
	}
	// End Point 8

	// Place the pit, keep generating until we get a tile that is either normal or a warning
	var pitR = 0;
	var pitC = 0;

	var pitValid = true;

	do {
		pitR = Math.floor(Math.random() * (this.height));
		pitC = Math.floor(Math.random() * (this.width));

		pitValid = true;

		var pitType = this.tiles[pitR][pitC].getType();

		if(pitType != "normal" && pitType != "beastwarning") {
			pitValid = false;
		}
	} while (pitValid == false);

	this.tiles[pitR][pitC].setType("pit");

	/*
		Place a warning anywhere that is one step away from the pit

		Here is another diagram of placement:

		 1
		4P2
		 3

		The number again denotes the point
			1 = pit1R and pit1C
	*/

	// Point 1
	var pit1R = pitR - 1;
	var pit1C = pitC;

	if(pit1R < 0) {
		pit1R = this.height - 1;
	}

	while(this.tiles[pit1R][pit1C].getType() == "slide") {
		pit1R -= 1;

		if(pit1R < 0) {
			pit1R = this.height - 1;
		}
	}

	// This is the only part that differs from beast warnings since a pit warning
	// overrides a beast warning
	pit1Type = this.tiles[pit1R][pit1C].getType();

	if(pit1Type == "normal" || pit1Type == "beastwarning") {
		this.tiles[pit1R][pit1C].setType("pitwarning");
	}
	// End Point 1

	// Point 2
	var pit2R = pitR;
	var pit2C = pitC + 1;

	if(pit2C >= this.width) {
		pit2C = 0;
	}

	while(this.tiles[pit2R][pit2C].getType() == "slide") {
		pit2C += 1;

		if(pit2C >= this.width) {
			pit2C = 0;
		}
	}

	var pit2Type = this.tiles[pit2R][pit2C].getType();

	if(pit2Type == "normal" || pit2Type == "beastwarning") {
		this.tiles[pit2R][pit2C].setType("pitwarning");
	}
	// End Point 2

	// Point 3
	var pit3R = pitR + 1;
	var pit3C = pitC;

	if(pit3R >= this.height) {
		pit3R = 0;
	}

	while(this.tiles[pit3R][pit3C].getType() == "slide") {
		pit3R += 1;

		if(pit3R >= this.height) {
			pit3R = 0;
		}
	}

	pit3Type = this.tiles[pit3R][pit3C].getType();

	if(pit3Type == "normal" || pit3Type == "beastwarning") {
		this.tiles[pit3R][pit3C].setType("pitwarning");
	}
	// End Point 3

	// Point 4
	var pit4R = pitR;
	var pit4C = pitC - 1;

	if(pit4C < 0) {
		pit4C = this.width - 1;
	}

	while(this.tiles[pit4R][pit4C].getType() == "slide") {
		pit4C -= 1;

		if(pit4C < 0) {
			pit4C = this.width - 1;
		}
	}

	pit4Type = this.tiles[pit4R][pit4C].getType();

	if(pit4Type == "normal" || pit4Type == "beastwarning") {
		this.tiles[pit4R][pit4C].setType("pitwarning");
	}
	// End Point 4

	this.player = new Player(this);

	/*
		Input handling happens here.
	*/

	this.upKey.onDown.add(function() {
		if(this.player.isShooting) {
			// Check if the shot hits the beast
			var playerUpR = this.player.r - 1;
			var playerUpC = this.player.c;

			if(playerUpR < 0) {
				playerUpR = this.height - 1;
			}

			if(this.tiles[playerUpR][playerUpC].getType() == "beast") {
				this.player.status = "win";
			}
			else {
				this.player.status = "death_miss";
			}
		}
		else if(!this.gameOver) {
			// Move the player up
			var nextMoveR = this.player.r - 1;
			var nextMoveC = this.player.c;

			// Check for wraparounds
			if(nextMoveR < 0) {
				nextMoveR = this.height - 1;
			}

			// Slide movement
			while(this.tiles[nextMoveR][nextMoveC].getType() == "slide") {
				this.tiles[nextMoveR][nextMoveC].setVisibility(true);

				nextMoveR -= 1;

				if(nextMoveR < 0) {
					nextMoveR = this.height - 1;
				}
				else if(nextMoveR >= this.height) {
					nextMoveR = 0;
				}
			}

			this.player.move(nextMoveR, nextMoveC);
		}
	}, this);

	this.downKey.onDown.add(function() {
		if(this.player.isShooting) {
			// Check if the shot hits the beast
			var playerDownR = this.player.r + 1;
			var playerDownC = this.player.c;

			if(playerDownR >= this.height) {
				playerDownR = 0;
			}

			if(this.tiles[playerDownR][playerDownC].getType() == "beast") {
				this.player.status = "win";
			}
			else {
				this.player.status = "death_miss";
			}
		}
		else if(!this.gameOver) {
			var nextMoveR = this.player.r + 1;
			var nextMoveC = this.player.c;

			if(nextMoveR >= this.height) {
				nextMoveR = 0;
			}

			while(this.tiles[nextMoveR][nextMoveC].getType() == "slide") {
				this.tiles[nextMoveR][nextMoveC].setVisibility(true);

				nextMoveR += 1;

				if(nextMoveR < 0) {
					nextMoveR = this.height - 1;
				}
				else if(nextMoveR >= this.height) {
					nextMoveR = 0;
				}
			}

			this.player.move(nextMoveR, nextMoveC);
		}
	}, this);

	this.leftKey.onDown.add(function() {
		if(this.player.isShooting) {
			var playerLeftR = this.player.r;
			var playerLeftC = this.player.c - 1;

			if(playerLeftC < 0) {
				playerLeftC = this.width - 1;
			}

			if(this.tiles[playerLeftR][playerLeftC].getType() == "beast") {
				this.player.status = "win";
			}
			else {
				this.player.status = "death_miss";
			}
		}
		else if(!this.gameOver) {
			var nextMoveR = this.player.r;
			var nextMoveC = this.player.c - 1;

			if(nextMoveC < 0) {
				nextMoveC = this.width - 1;
			}

			while(this.tiles[nextMoveR][nextMoveC].getType() == "slide") {
				this.tiles[nextMoveR][nextMoveC].setVisibility(true);

				nextMoveC -= 1;

				if(nextMoveC < 0) {
					nextMoveC = this.width - 1;
				}
				else if(nextMoveC >= this.width) {
					nextMoveC = 0;
				}
			}

			this.player.move(nextMoveR, nextMoveC);
		}
	}, this);

	this.rightKey.onDown.add(function() {
		if(this.player.isShooting) {
			var playerRightR = this.player.r;
			var playerRightC = this.player.c + 1;

			if(playerRightC >= this.width) {
				playerRightC = 0;
			}

			if(this.tiles[playerRightR][playerRightC].getType() == "beast") {
				this.player.status = "win";
			}
			else {
				this.player.status = "death_miss";
			}
		}
		else if(!this.gameOver) {
			var nextMoveR = this.player.r;
			var nextMoveC = this.player.c + 1;

			if(nextMoveC >= this.width) {
				nextMoveC = 0;
			}

			while(this.tiles[nextMoveR][nextMoveC].getType() == "slide") {
				this.tiles[nextMoveR][nextMoveC].setVisibility(true);

				nextMoveC += 1;

				if(nextMoveC < 0) {
					nextMoveC = this.width - 1;
				}
				else if(nextMoveC >= this.width) {
					nextMoveC = 0;
				}
			}

			this.player.move(nextMoveR, nextMoveC);
		}
	}, this);

	this.shootKey.onDown.add(function() {
		// Highlight the tiles around the player
		if(this.player.isShooting && !this.gameOver) {
			// Un-highlight the tiles around the player
			// Up
			var playerUpR = this.player.r - 1;
			var playerUpC = this.player.c;

			if(playerUpR < 0) {
				playerUpR = this.height - 1;
			}

			this.tiles[playerUpR][playerUpC].setHighlighted(false);
			// End Up

			// Down
			var playerDownR = this.player.r + 1;
			var playerDownC = this.player.c;

			if(playerDownR >= this.height) {
				playerDownR = 0;
			}

			this.tiles[playerDownR][playerDownC].setHighlighted(false);
			// End Down

			// Left
			var playerLeftR = this.player.r;
			var playerLeftC = this.player.c - 1;

			if(playerLeftC < 0) {
				playerLeftC = this.width - 1;
			}

			this.tiles[playerLeftR][playerLeftC].setHighlighted(false);
			// End Left

			// Right
			var playerRightR = this.player.r;
			var playerRightC = this.player.c + 1;

			if(playerRightC >= this.width) {
				playerRightC = 0;
			}

			this.tiles[playerRightR][playerRightC].setHighlighted(false);
			// End Right

			this.player.isShooting = false;
		}
		else if (!this.player.isShooting && !this.gameOver) {
			// Highlight the tiles around the player
			// Up
			var playerUpR = this.player.r - 1;
			var playerUpC = this.player.c;

			if(playerUpR < 0) {
				playerUpR = this.height - 1;
			}

			this.tiles[playerUpR][playerUpC].setHighlighted(true);
			// End Up

			// Down
			var playerDownR = this.player.r + 1;
			var playerDownC = this.player.c;

			if(playerDownR >= this.height) {
				playerDownR = 0;
			}

			this.tiles[playerDownR][playerDownC].setHighlighted(true);
			// End Down

			// Left
			var playerLeftR = this.player.r;
			var playerLeftC = this.player.c - 1;

			if(playerLeftC < 0) {
				playerLeftC = this.width - 1;
			}

			this.tiles[playerLeftR][playerLeftC].setHighlighted(true);
			// End Left

			// Right
			var playerRightR = this.player.r;
			var playerRightC = this.player.c + 1;

			if(playerRightC >= this.width) {
				playerRightC = 0;
			}

			this.tiles[playerRightR][playerRightC].setHighlighted(true);
			// End Right

			this.player.isShooting = true;
		}
		else if(this.gameOver) {
			game.state.start("title");
		}
	}, this);

	// Debug illuminate key
	this.illuminateKey.onDown.add(function() {
		this.illuminated = !this.illuminated;

		this.illuminate(this.illuminated);
	}, this);

	/*
		Touch controls

		The log for the movement itself is the same, just different actual handling.
		Basically you just pass each tile a function using that tile as the context
		which does the actual input handling.
	*/
	for(var r = 0; r < this.height; ++r) {
		for(var c = 0; c < this.width; ++c) {
			var currentTile = this.tiles[r][c];

			currentTile.sprite.inputEnabled = true;

			currentTile.sprite.events.onInputDown.add(function() {
				// Return to title if game is over
				if(this.board.gameOver) {
					game.state.start("title");
				}

				var currentTileR = this.r;
				var currentTileC = this.c;

				var currentPlayerR = this.board.player.r;
				var currentPlayerC = this.board.player.c;

				// Up
				if(currentTileR == currentPlayerR - 1 && currentTileC == currentPlayerC) {
					if(this.board.player.isShooting) {
						// Check if the shot hits the beast
						var playerUpR = this.board.player.r - 1;
						var playerUpC = this.board.player.c;

						if(playerUpR < 0) {
							playerUpR = this.board.height - 1;
						}

						if(this.board.tiles[playerUpR][playerUpC].getType() == "beast") {
							this.board.player.status = "win";
						}
						else {
							this.board.player.status = "death_miss";
						}
					}
					else if(!this.board.gameOver) {
						// Move the player up
						var nextMoveR = this.board.player.r - 1;
						var nextMoveC = this.board.player.c;

						// Check for wraparounds
						if(nextMoveR < 0) {
							nextMoveR = this.board.height - 1;
						}

						// Slide movement
						while(this.board.tiles[nextMoveR][nextMoveC].getType() == "slide") {
							this.board.tiles[nextMoveR][nextMoveC].setVisibility(true);

							nextMoveR -= 1;

							if(nextMoveR < 0) {
								nextMoveR = this.board.height - 1;
							}
							else if(nextMoveR >= this.board.height) {
								nextMoveR = 0;
							}
						}
					}

					this.board.player.move(nextMoveR, nextMoveC);
				}
				// Down
				else if(currentTileR == currentPlayerR + 1 && currentTileC == currentPlayerC) {
					if(this.board.player.isShooting) {
						// Check if the shot hits the beast
						var playerDownR = this.board.player.r + 1;
						var playerDownC = this.board.player.c;

						if(playerDownR >= this.board.height) {
							playerDownR = 0;
						}

						if(this.board.tiles[playerDownR][playerDownC].getType() == "beast") {
							this.board.player.status = "win";
						}
						else {
							this.board.player.status = "death_miss";
						}
					}
					else if(!this.board.gameOver) {
						var nextMoveR = this.board.player.r + 1;
						var nextMoveC = this.board.player.c;

						if(nextMoveR >= this.board.height) {
							nextMoveR = 0;
						}

						while(this.board.tiles[nextMoveR][nextMoveC].getType() == "slide") {
							this.board.tiles[nextMoveR][nextMoveC].setVisibility(true);

							nextMoveR += 1;

							if(nextMoveR < 0) {
								nextMoveR = this.board.height - 1;
							}
							else if(nextMoveR >= this.board.height) {
								nextMoveR = 0;
							}
						}
					}

					this.board.player.move(nextMoveR, nextMoveC);
				}
				// Left
				else if(currentTileR == currentPlayerR && currentTileC == currentPlayerC - 1) {
					if(this.board.player.isShooting) {
						var playerLeftR = this.board.player.r;
						var playerLeftC = this.board.player.c - 1;

						if(playerLeftC < 0) {
							playerLeftC = this.board.width - 1;
						}

						if(this.board.tiles[playerLeftR][playerLeftC].getType() == "beast") {
							this.board.player.status = "win";
						}
						else {
							this.board.player.status = "death_miss";
						}
					}
					else if(!this.board.gameOver) {
						var nextMoveR = this.board.player.r;
						var nextMoveC = this.board.player.c - 1;

						if(nextMoveC < 0) {
							nextMoveC = this.board.width - 1;
						}

						while(this.board.tiles[nextMoveR][nextMoveC].getType() == "slide") {
							this.board.tiles[nextMoveR][nextMoveC].setVisibility(true);

							nextMoveC -= 1;

							if(nextMoveC < 0) {
								nextMoveC = this.board.width - 1;
							}
							else if(nextMoveC >= this.board.width) {
								nextMoveC = 0;
							}
						}

						this.board.player.move(nextMoveR, nextMoveC);
					}
				}
				// Right
				else if(currentTileR == currentPlayerR && currentTileC == currentPlayerC + 1) {
					if(this.board.player.isShooting) {
						var playerRightR = this.board.player.r;
						var playerRightC = this.board.player.c + 1;

						if(playerRightC >= this.board.width) {
							playerRightC = 0;
						}

						if(this.board.tiles[playerRightR][playerRightC].getType() == "beast") {
							this.board.player.status = "win";
						}
						else {
							this.board.player.status = "death_miss";
						}
					}
					else if(!this.board.gameOver) {
						var nextMoveR = this.board.player.r;
						var nextMoveC = this.board.player.c + 1;

						if(nextMoveC >= this.board.width) {
							nextMoveC = 0;
						}

						while(this.board.tiles[nextMoveR][nextMoveC].getType() == "slide") {
							this.board.tiles[nextMoveR][nextMoveC].setVisibility(true);

							nextMoveC += 1;

							if(nextMoveC < 0) {
								nextMoveC = this.board.width - 1;
							}
							else if(nextMoveC >= this.board.width) {
								nextMoveC = 0;
							}
						}

						this.board.player.move(nextMoveR, nextMoveC);
					}
				}
				// Shoot
				else if(currentTileR == currentPlayerR && currentTileC == currentPlayerC) {
					// Highlight the tiles around the player
					if(this.board.player.isShooting && !this.board.gameOver) {
						// Un-highlight the tiles around the player
						// Up
						var playerUpR = this.board.player.r - 1;
						var playerUpC = this.board.player.c;

						if(playerUpR < 0) {
							playerUpR = this.board.height - 1;
						}

						this.board.tiles[playerUpR][playerUpC].setHighlighted(false);
						// End Up

						// Down
						var playerDownR = this.board.player.r + 1;
						var playerDownC = this.board.player.c;

						if(playerDownR >= this.board.height) {
							playerDownR = 0;
						}

						this.board.tiles[playerDownR][playerDownC].setHighlighted(false);
						// End Down

						// Left
						var playerLeftR = this.board.player.r;
						var playerLeftC = this.board.player.c - 1;

						if(playerLeftC < 0) {
							playerLeftC = this.board.width - 1;
						}

						this.board.tiles[playerLeftR][playerLeftC].setHighlighted(false);
						// End Left

						// Right
						var playerRightR = this.board.player.r;
						var playerRightC = this.board.player.c + 1;

						if(playerRightC >= this.board.width) {
							playerRightC = 0;
						}

						this.board.tiles[playerRightR][playerRightC].setHighlighted(false);
						// End Right

						this.board.player.isShooting = false;
					}
					else if (!this.board.player.isShooting && !this.board.gameOver) {
						// Highlight the tiles around the player
						// Up
						var playerUpR = this.board.player.r - 1;
						var playerUpC = this.board.player.c;

						if(playerUpR < 0) {
							playerUpR = this.board.height - 1;
						}

						this.board.tiles[playerUpR][playerUpC].setHighlighted(true);
						// End Up

						// Down
						var playerDownR = this.board.player.r + 1;
						var playerDownC = this.board.player.c;

						if(playerDownR >= this.board.height) {
							playerDownR = 0;
						}

						this.board.tiles[playerDownR][playerDownC].setHighlighted(true);
						// End Down

						// Left
						var playerLeftR = this.board.player.r;
						var playerLeftC = this.board.player.c - 1;

						if(playerLeftC < 0) {
							playerLeftC = this.board.width - 1;
						}

						this.board.tiles[playerLeftR][playerLeftC].setHighlighted(true);
						// End Left

						// Right
						var playerRightR = this.board.player.r;
						var playerRightC = this.board.player.c + 1;

						if(playerRightC >= this.board.width) {
							playerRightC = 0;
						}

						this.board.tiles[playerRightR][playerRightC].setHighlighted(true);
						// End Right

						this.board.player.isShooting = true;
					}
				}
			}, currentTile);
		}
	}

	// Add the timer
	game.time.events.loop(Phaser.Timer.SECOND, function() {
		if(!this.gameOver) {
			this.timerSeconds++;

			if(this.timerSeconds == 60) {
				if(this.timerMinutes < 99) {
					this.timerMinutes++;
				}

				this.timerSeconds = 0;
			}
		}
	}, this);

	/*
		Finally, add some extra UI elements
	*/
	this.stepsText = game.add.bitmapText(10, game.world.height - 42, "MedievalSharp32","Steps: 0", 32);
	this.timerText = game.add.bitmapText(175, game.world.height - 42, "MedievalSharp32", "Time: 00:00", 32);
	this.statusText = game.add.bitmapText(game.world.width - 425, game.world.height - 42, "MedievalSharp32", "", 32);
	this.statusText.visible = false;
}

Board.prototype.update = function() {
	for(var r = 0; r < this.height; ++r) {
		for(var c = 0; c < this.width; ++c) {
			this.tiles[r][c].update();
		}
	}

	this.player.update();

	// Check for loss and win conditions
	if(this.player.status == "win" && !this.gameOver) {
		this.illuminate(true);

		this.statusText.setText("You Win! SHOOT or TAP to Restart");
		this.statusText.visible = true;

		this.gameOver = true;
	}
	else if(this.player.status == "death_pit") {
		this.illuminate(true);

		this.statusText.setText("You Lose! SHOOT or TAP to Restart");
		this.statusText.visible = true;

		this.gameOver = true;
	}
	else if(this.player.status == "death_beast") {
		this.illuminate(true);

		this.statusText.setText("You Lose! SHOOT or TAP to Restart");
		this.statusText.visible = true;

		this.gameOver = true;
	}
	else if(this.player.status == "death_miss") {
		this.illuminate(true);

		this.statusText.setText("You Lose! SHOOT or TAP to Restart");
		this.statusText.visible = true;

		this.gameOver = true;
	}

	// Update UI
	this.stepsText.setText("Steps: " + String("0000" + this.player.steps).slice(-4));
	this.timerText.setText("Time: " + String("00" + this.timerMinutes).slice(-2) + ":" + String("00" + this.timerSeconds).slice(-2));

}

// Set all tiles to be visible
Board.prototype.illuminate = function(illuminated) {
	for(var r = 0; r < this.height; ++r) {
		for(var c = 0; c < this.width; ++c) {
			if(illuminated) {
				this.tiles[r][c].setVisibility(true);
			}
			else {
				this.tiles[r][c].setVisibility(false);
			}
		}
	}

	// Make player visible always
	this.tiles[this.player.r][this.player.c].setVisibility(true);
}
