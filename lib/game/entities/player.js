ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)
.defines(function() {

EntityPlayer = ig.Entity.extend({
	img_ship: new ig.Image("media/ship.png"),

	animSheet: new ig.AnimationSheet("media/shields.png", 65, 65),

	size: {x: 65, y: 65},
	zIndex: 5,

	init: function( x, y, settings ) {
		this.parent(x,y,settings);

		//this.img_ship.addToStage();
		//this.img_ship.texture.crop = new PIXI.Rectangle(0, 0, 50, 30);

		this.pos.x = 200;
		this.pos.y = 200;

		this.addAnim('default', 1, [0,1,2]);
	},

	update: function() {
		this.parent();
		this.img_ship.sprite.position.x = 100;
		this.img_ship.sprite.position.y = 100;
		//this.img_ship.sprite.position.x += 100 * ig.system.tick;
		//if(this.img_ship.sprite.position.x>200)
		//	this.kill();
	},

	kill: function() {
		this.parent();
	},

});	

});