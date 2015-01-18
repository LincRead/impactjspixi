ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',

	'game.levels.one',

	'game.entities.player',
	'game.entities.nevron'
)
.defines(function(){

MyGame = ig.Game.extend({
	
	// Load a font
	//font: new ig.Font( 'media/04b03.font.png' ),

	init: function() {
		// Temp.
		this.stage = new PIXI.Stage(0x222222); // New stage for every level.

		this.loadLevel(LevelOne);
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
		
		
		// Add your own drawing code here
		/*var x = ig.system.width/2,
			y = ig.system.height/2;
		
		this.font.draw( 'It Works!', x, y, ig.Font.ALIGN.CENTER );*/
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', MyGame, 60, 800, 600, 1 );

});
