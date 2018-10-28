var game = new Phaser.Game(768, 690, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render: render});

/*
	These global variables are used locally by game objects to determine
	what buttons coorespond to what input.
	
	Rebind keys by changing these
*/
var upKey = Phaser.Keyboard.UP;
var downKey = Phaser.Keyboard.DOWN;
var leftKey = Phaser.Keyboard.LEFT;
var rightKey = Phaser.Keyboard.RIGHT;
var shootKey = Phaser.Keyboard.SPACEBAR;
var startKey = Phaser.Keyboard.SPACEBAR;

function preload() {
	console.log("Loading Fonts");
	game.load.bitmapFont("MedievalSharp32", "assets/Fonts/MedievalSharp32.png", "assets/Fonts/MedievalSharp32.xml");
	game.load.bitmapFont("MedievalSharp72", "assets/Fonts/MedievalSharp72.png", "assets/Fonts/MedievalSharp72.xml");
	console.log("Loaded Fonts");

	console.log("Loading main assets");
	game.load.image("BoardTile_beast", "assets/BoardTile/BoardTile_beast.png");
	game.load.image("BoardTile_beastwarning", "assets/BoardTile/BoardTile_beastwarning.png");
	game.load.image("BoardTile_normal", "assets/BoardTile/BoardTile_normal.png");
	game.load.image("BoardTile_pit", "assets/BoardTile/BoardTile_pit.png");
	game.load.image("BoardTile_pitwarning", "assets/BoardTile/BoardTile_pitwarning.png");
	game.load.image("BoardTile_slide", "assets/BoardTile/BoardTile_slide.png");
	game.load.image("BoardTile_invisible", "assets/BoardTile/BoardTile_invisible.png");
	game.load.image("BoardTile_highlight", "assets/BoardTile/BoardTile_highlight.png");
	game.load.image("Player_normal", "assets/Player/Player_normal.png");
	console.log("Finished loading main assets");
}

function create() {
	this.game.stage.backgroundColor = "#F5F5DC";

	console.log("Registering title state");
	game.state.add("title", TitleState);

	console.log("Registering main menu state");
	game.state.add("menu", MenuState);

	console.log("Registering main game state");
	game.state.add("game", GameState);

	console.log("Starting title state");
	game.state.start("title");
}

function update() {
}

function render() {
}
