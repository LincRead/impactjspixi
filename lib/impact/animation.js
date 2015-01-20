ig.module(
	'impact.animation'
)
.requires(
	'impact.timer',
	'impact.image' 
)
.defines(function(){ "use strict";

ig.AnimationSheet = ig.Class.extend({
	width: 8,
	height: 8,
	image: null,
	path: null,
	
	init: function( path, width, height ) {
		this.width = width;
		this.height = height;
		this.texture = PIXI.Texture.fromImage(path).baseTexture;
		this.path = path;
	},

	loadWMImage: function() {
		this.image = new ig.Image( this.path );
	}
});

ig.Animation = ig.Class.extend({
	sheet: null,
	timer: null,
	texture: null,
	
	flip: {x: false, y: false},
	pivot: {x: 0, y: 0},
	
	tiles: [],	
	sequence: [],
	frame: 0,
	tile: 0,
	loopCount: 0,
	alpha: 1,
	angle: 0,
	pos: {x: 0, y: 0 }, // New.
	name: "",
	
	
	init: function( sheet, frameTime, sequence, stop ) {
		this.sheet = sheet;
		this.timer = new ig.Timer();

		// Set up textures.
		var per_row = this.sheet.texture.width / this.sheet.width;
		var rows = Math.ceil(sequence.length / per_row);
		//console.log(rows); 
		for(var sn = 0; sn < sequence.length; sn++) {
			for(var j = 0; j < rows; j++) {
				for (var i = 0; i < per_row; i++) {
					if( ((j*per_row)+(i*1)) === sequence[sn]) {
				        var anim_tex = new PIXI.Texture(this.sheet.texture, {x:i*this.sheet.width, y:j*this.sheet.height, width:this.sheet.width, height:this.sheet.height});
				        this.tiles[sn] = anim_tex;
				    }
		    	}
		    }
		}

		this.frameTime = frameTime;
		this.stop = !!stop;
		this.sequence = sequence;

		if(ig.editor) this.tile = sequence[0]; // Weltmeister.
		else this.tile = this.tiles[this.sequence[0]]; // PIXI.
	},

	addToStage: function() {
		//this.sheet.image.addToStage();
	},

	removeFromStage: function() {
		//this.sheet.image.removeFromStage();
	},
	
	
	rewind: function() {
		this.timer.set();
		this.loopCount = 0;
		this.frame = 0;
		this.tile = this.sequence[0];
		return this;
	},
	
	
	gotoFrame: function( f ) {
		// Offset the timer by one tenth of a millisecond to make sure we
		// jump to the correct frame and circumvent rounding errors
		this.timer.set( this.frameTime * -f - 0.0001 );
		this.update();
	},
	
	
	gotoRandomFrame: function() {
		this.gotoFrame( Math.floor(Math.random() * this.sequence.length) )
	},
	
	
	update: function() {
		var frameTotal = Math.floor(this.timer.delta() / this.frameTime);
		this.loopCount = Math.floor(frameTotal / this.sequence.length);
		if( this.stop && this.loopCount > 0 ) {
			this.frame = this.sequence.length - 1;
		}
		else {
			this.frame = frameTotal % this.sequence.length;
		}
		this.tile = this.tiles[ this.frame ];
	},
	
	// Draw image for Weltmeister only.
	draw: function( targetX, targetY ) {
		var bbsize = Math.max(this.sheet.width, this.sheet.height);
		
		// On screen?
		if(
		   targetX > ig.system.width || targetY > ig.system.height ||
		   targetX + bbsize < 0 || targetY + bbsize < 0
		) {
			return;
		}
		
		if( this.alpha != 1) {
			ig.system.context.globalAlpha = this.alpha;
		}

		this.sheet.image.drawTile(
			targetX, targetY,
			this.tile, this.sheet.width, this.sheet.height,
			this.flip.x, this.flip.y
		);
		
		if( this.alpha != 1) {
			ig.system.context.globalAlpha = 1;
		}
	}	
});

});