ig.module(
	'game.entities.nevron'
)
.requires(
	'impact.entity'
)
.defines(function() {

EntityNevron = ig.Entity.extend({
	animSheet: new ig.AnimationSheet("media/nevron.png", 145, 145),

	size: {x: 145, y: 145},
	zIndex: 0,

	init: function( x, y, settings ) {
		this.parent(x,y,settings);

		this.addAnim('default', .05, [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]);
		this.currentAnim = this.anims['default'];
	},

	update: function() {
		this.parent();
	},
});	

});