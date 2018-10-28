var TitleState = function(game) {
	this.titleText = undefined;
	this.enterText = undefined;

	this.startKey = game.input.keyboard.addKey(startKey);	
}

TitleState.prototype.preload = function() {
}

TitleState.prototype.create = function() {
	// Create the title text
	this.titleText = game.add.bitmapText(game.world.centerX - 175, 25, "MedievalSharp72", "BEAST HUNT", 72);

	// Create the enter text
	this.enterText = game.add.bitmapText(game.world.centerX - 160, game.world.centerY + game.world.height / 4, "MedievalSharp32", "Press SPACE or TAP to Play", 32);

	// Make the enter text blink every second
	game.time.events.loop(Phaser.Timer.SECOND, function() {
		this.enterText.visible = !this.enterText.visible;
	}, this);

	// Change to main menu state when the user presses enter
	this.startKey.onDown.add(function() {
		game.state.start("game");
	}, this);
}

TitleState.prototype.update = function() {
	// Change to main menu state when the user clicks
	if(game.input.activePointer.isDown) {
		game.state.start("game");
	}
}
