ig.module(
	'impact.image'
)
.defines(function(){ "use strict";

ig.Image = ig.Class.extend({
	data: null,
	width: 0,
	height: 0,
	loaded: false,
	failed: false,
	loadCallback: null,
	path: '',

	// PIXI.
	texture: null,
	sprite: null,
	
	staticInstantiate: function( path ) {
		if(ig.editor) return ig.Image.cache[path] || null;
		else return null;
	},
	
	init: function( path ) {
		this.path = path;
		this.load();
	},	

	load: function( loadCallback ) {
		if( this.loaded ) {
			if( loadCallback ) {
				loadCallback( this.path, true );
			}
			return;
		}
		else if( !this.loaded && ig.ready ) {
			this.loadCallback = loadCallback || null;
			
			if(!ig.editor) { // PIXI for game.
				var loader = new PIXI.ImageLoader(ig.prefix + this.path + ig.nocache);
				loader.onLoaded = this.onload.bind(this);
				loader.onError = this.onerror.bind(this);
				loader.load();
			} else { // For Weltmeister, use ImpactJS's.
				this.data = new Image();
				this.data.onload = this.onload.bind(this);
				this.data.onerror = this.onerror.bind(this);
				this.data.src = ig.prefix + this.path + ig.nocache;
			}
		}
		else {
			ig.addResource( this );
		}
		
		ig.Image.cache[this.path] = this;
	},

	onload: function( event ) {
		if(!ig.editor) { // PIXI.
			this.texture = PIXI.TextureCache[ig.prefix + this.path + ig.nocache];
		  	this.sprite = new PIXI.Sprite(this.texture);
		  	this.sprite.zIndex = 100; // Image always on top as default.
			this.loaded = true;
			this.width = this.sprite.texture.width;
			this.height = this.sprite.texture.height;

			if( this.loadCallback ) {
				this.loadCallback( this.path, true );
			}
		} else { // Weltmeister.
			this.width = this.data.width;
			this.height = this.data.height;
			this.loaded = true;
			
			if( ig.system.scale != 1 ) {
				this.resize( ig.system.scale );
			}
			
			if( this.loadCallback ) {
				this.loadCallback( this.path, true );
			}
		}
	},
	
	
	onerror: function( event ) {
		this.failed = true;
		
		if( this.loadCallback ) {
			this.loadCallback( this.path, false );
		}
	},

	addToStage: function() {
		ig.game.stage.addChild(this.sprite);
	},

	removeFromStage: function() {
		ig.game.stage.removeChild(this.sprite);
	},
	
	reload: function() { 
		this.loaded = false;
		this.data = new Image();
		this.data.onload = this.onload.bind(this);
		this.data.src = this.path + '?' + Date.now();
	},
	
	resize: function( scale ) {
		// Nearest-Neighbor scaling
		
		// The original image is drawn into an offscreen canvas of the same size
		// and copied into another offscreen canvas with the new size. 
		// The scaled offscreen canvas becomes the image (data) of this object.
		
		var origPixels = ig.getImagePixels( this.data, 0, 0, this.width, this.height );
		
		var widthScaled = this.width * scale;
		var heightScaled = this.height * scale;

		var scaled = ig.$new('canvas');
		scaled.width = widthScaled;
		scaled.height = heightScaled;
		var scaledCtx = scaled.getContext('2d');
		var scaledPixels = scaledCtx.getImageData( 0, 0, widthScaled, heightScaled );
			
		for( var y = 0; y < heightScaled; y++ ) {
			for( var x = 0; x < widthScaled; x++ ) {
				var index = (Math.floor(y / scale) * this.width + Math.floor(x / scale)) * 4;
				var indexScaled = (y * widthScaled + x) * 4;
				scaledPixels.data[ indexScaled ] = origPixels.data[ index ];
				scaledPixels.data[ indexScaled+1 ] = origPixels.data[ index+1 ];
				scaledPixels.data[ indexScaled+2 ] = origPixels.data[ index+2 ];
				scaledPixels.data[ indexScaled+3 ] = origPixels.data[ index+3 ];
			}
		}
		scaledCtx.putImageData( scaledPixels, 0, 0 );
		this.data = scaled;
	},
	
	// Used for Weltmeister.
	draw: function( targetX, targetY, sourceX, sourceY, width, height ) {

		if( !this.loaded || !ig.editor ) { return; } // Only draw if Weltmeister.
		
		var scale = ig.system.scale;
		sourceX = sourceX ? sourceX * scale : 0;
		sourceY = sourceY ? sourceY * scale : 0;
		width = (width ? width : this.width) * scale;
		height = (height ? height : this.height) * scale;
		
		ig.system.context.drawImage( 
			this.data, sourceX, sourceY, width, height,
			ig.system.getDrawPos(targetX), 
			ig.system.getDrawPos(targetY),
			width, height
		);
		
		ig.Image.drawCount++;
	},
	
	// Used for Weltmeister.
	drawTile: function( targetX, targetY, tile, tileWidth, tileHeight, flipX, flipY ) {
		if(!ig.editor) return; // Only draw if Weltmeister.

		tileHeight = tileHeight ? tileHeight : tileWidth;
		
		if( !this.loaded || tileWidth > this.width || tileHeight > this.height ) { return; }

		var scale = ig.system.scale;
		var tileWidthScaled = Math.floor(tileWidth * scale);
		var tileHeightScaled = Math.floor(tileHeight * scale);
		
		var scaleX = flipX ? -1 : 1;
		var scaleY = flipY ? -1 : 1;
		
		if( flipX || flipY ) {
			ig.system.context.save();
			ig.system.context.scale( scaleX, scaleY );
		}
		//console.log(this.data);
		ig.system.context.drawImage( 
			this.data, 
			( Math.floor(tile * tileWidth) % this.width ) * scale,
			( Math.floor(tile * tileWidth / this.width) * tileHeight ) * scale,
			tileWidthScaled,
			tileHeightScaled,
			ig.system.getDrawPos(targetX) * scaleX - (flipX ? tileWidthScaled : 0), 
			ig.system.getDrawPos(targetY) * scaleY - (flipY ? tileHeightScaled : 0),
			tileWidthScaled,
			tileHeightScaled
		);
		if( flipX || flipY ) {
			ig.system.context.restore();
		}
		
		ig.Image.drawCount++;
	}
});

ig.Image.drawCount = 0;
ig.Image.cache = {};
ig.Image.reloadCache = function() {
	for( var path in ig.Image.cache ) {
		ig.Image.cache[path].reload();
	}
};

});