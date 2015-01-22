ig.module(
	'impact.background-map'
)
.requires(
	'impact.map',
	'impact.image'
)
.defines(function(){ "use strict";

ig.BackgroundMap = ig.Map.extend({	
	tiles: null,
	scroll: {x: 0, y:0},
	distance: 1,
	repeat: false,
	tilesetName: '',
	foreground: false,
	enabled: true,
	
	preRender: false,
	preRenderedChunks: null,
	chunkSize: 512,
	debugChunks: false,
	
	anims: {},
	tileContainer: new PIXI.SpriteBatch(),
	
	init: function( tilesize, data, tileset ) {
		this.parent( tilesize, data );
		this.setTileset( tileset );
	},
	
	
	setTileset: function( tileset ) {
		this.tilesetName  = tileset instanceof ig.Image ? tileset.path : tileset;
		this.tiles = new ig.Image( this.tilesetName );
		this.preRenderedChunks = null;
		if(!ig.editor) this.createTiles();
	},
	
	
	setScreenPos: function( x, y ) {
		this.scroll.x = Math.floor(x / this.distance);
		this.scroll.y = Math.floor(y / this.distance);
	},
	
	update: function() {
		this.tileContainer.position.x = this.scroll.x;
		this.tileContainer.position.y = this.scroll.y;

		var posx = this.tileContainer.position.x;
		var posy = this.tileContainer.position.y;

		var visible = 0;
		for(var i = 0; i < this.tileContainer.children.length; i++) {
			if(!
				(this.tileContainer.children[i].position.x + posx > ig.system.width || this.tileContainer.children[i].position.y + posy > ig.system.height ||
				this.tileContainer.children[i].position.x + posx + this.tilesize  < 0 || this.tileContainer.children[i].position.y + posy + this.tilesize < 0)) {
					this.tileContainer.children[i].visible = true;
					visible++;
				}
				else {
					this.tileContainer.children[i].visible = false;
				}
		}
	},
	
	preRenderMapToChunks: function() {
		var totalWidth = this.width * this.tilesize * ig.system.scale,
			totalHeight = this.height * this.tilesize * ig.system.scale;
		
		// If this layer is smaller than the chunkSize, adjust the chunkSize
		// accordingly, so we don't have as much overdraw
		this.chunkSize = Math.min( Math.max(totalWidth, totalHeight), this.chunkSize );
			
		var chunkCols = Math.ceil(totalWidth / this.chunkSize),
			chunkRows = Math.ceil(totalHeight / this.chunkSize);
		
		this.preRenderedChunks = [];
		for( var y = 0; y < chunkRows; y++ ) {
			this.preRenderedChunks[y] = [];
			
			for( var x = 0; x < chunkCols; x++ ) {
				
				
				var chunkWidth = (x == chunkCols-1)
					? totalWidth - x * this.chunkSize
					: this.chunkSize;
					
				var chunkHeight = (y == chunkRows-1)
					? totalHeight - y * this.chunkSize
					: this.chunkSize;
					
				this.preRenderedChunks[y][x] = this.preRenderChunk( x, y, chunkWidth, chunkHeight );
			}
		}
	},
	
	
	preRenderChunk: function( cx, cy, w, h ) {
		var tw = w / this.tilesize / ig.system.scale + 1,
			th = h / this.tilesize / ig.system.scale + 1;
		
		var nx = (cx * this.chunkSize / ig.system.scale) % this.tilesize,
			ny = (cy * this.chunkSize / ig.system.scale) % this.tilesize;
		
		var tx = Math.floor(cx * this.chunkSize / this.tilesize / ig.system.scale),
			ty = Math.floor(cy * this.chunkSize / this.tilesize / ig.system.scale);
		
		
		var chunk = ig.$new('canvas');
		chunk.width = w;
		chunk.height = h;
		chunk.retinaResolutionEnabled = false; // Opt out for Ejecta
		
		var chunkContext = chunk.getContext('2d');
		ig.System.scaleMode(chunk, chunkContext);
		
		var screenContext = ig.system.context;
		ig.system.context = chunkContext;
		
		for( var x = 0; x < tw; x++ ) {
			for( var y = 0; y < th; y++ ) {
				if( x + tx < this.width && y + ty < this.height ) {
					var tile = this.data[y+ty][x+tx];
					if( tile ) {
						this.tiles.drawTile(
							x * this.tilesize - nx,	y * this.tilesize - ny,
							tile - 1, this.tilesize
						);
					}
				}
			}
		}
		ig.system.context = screenContext;
		
		return chunk;
	},
	
	
	draw: function() {
		if( !this.tiles.loaded || !this.enabled || !ig.editor ) {
			return;
		}
		
		if( this.preRender ) {
			this.drawPreRendered();
		}
		else {
			this.drawTiled();
		}
	},
		
	
	drawPreRendered: function() {
		if( !this.preRenderedChunks ) {
			this.preRenderMapToChunks();
		}
		
		var dx = ig.system.getDrawPos(this.scroll.x),
			dy = ig.system.getDrawPos(this.scroll.y);
			
			
		if( this.repeat ) {
			var w = this.width * this.tilesize * ig.system.scale;
			dx = (dx%w + w) % w;

			var h = this.height * this.tilesize * ig.system.scale;
			dy = (dy%h + h) % h;
		}
		
		var minChunkX = Math.max( Math.floor(dx / this.chunkSize), 0 ),
			minChunkY = Math.max( Math.floor(dy / this.chunkSize), 0 ),
			maxChunkX = Math.ceil((dx+ig.system.realWidth) / this.chunkSize),
			maxChunkY = Math.ceil((dy+ig.system.realHeight) / this.chunkSize),
			maxRealChunkX = this.preRenderedChunks[0].length,
			maxRealChunkY = this.preRenderedChunks.length;
			
		
		if( !this.repeat ) {
			maxChunkX = Math.min( maxChunkX, maxRealChunkX );
			maxChunkY = Math.min( maxChunkY, maxRealChunkY );
		}
		
		
		var nudgeY = 0;
		for( var cy = minChunkY; cy < maxChunkY; cy++ ) {
			
			var nudgeX = 0;
			for( var cx = minChunkX; cx < maxChunkX; cx++ ) {
				var chunk = this.preRenderedChunks[cy % maxRealChunkY][cx % maxRealChunkX];
				
				var x = -dx + cx * this.chunkSize - nudgeX;
				var y = -dy + cy * this.chunkSize - nudgeY;
				ig.system.context.drawImage( chunk, x, y);
				ig.Image.drawCount++;
				
				if( this.debugChunks ) {
					ig.system.context.strokeStyle = '#f0f';
					ig.system.context.strokeRect( x, y, this.chunkSize, this.chunkSize );
				}
				
				// If we repeat in X and this chunk's width wasn't the full chunk size
				// and the screen is not already filled, we need to draw anohter chunk
				// AND nudge it to be flush with the last chunk
				if( this.repeat && chunk.width < this.chunkSize && x + chunk.width < ig.system.realWidth ) {
					nudgeX += this.chunkSize - chunk.width;
					maxChunkX++;
				}
			}
			
			// Same as above, but for Y
			if( this.repeat && chunk.height < this.chunkSize && y + chunk.height < ig.system.realHeight	) {
				nudgeY += this.chunkSize - chunk.height;
				maxChunkY++;
			}
		}
	},
	
	
	createTiles: function() {
		var tile = 0,
			anim = null,
			tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
			tileOffsetY = (this.scroll.y / this.tilesize).toInt(),
			pxOffsetX = this.scroll.x % this.tilesize,
			pxOffsetY = this.scroll.y % this.tilesize,
			pxMinX = -pxOffsetX - this.tilesize,
			pxMinY = -pxOffsetY - this.tilesize,
			pxMaxX = (this.width * this.tilesize) - pxOffsetX,
			pxMaxY = (this.height * this.tilesize) - pxOffsetY;

		for( var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
			var tileY = mapY + tileOffsetY;
				
			// Repeat Y?
			if( tileY >= this.height || tileY < 0 ) {
				if( !this.repeat ) { continue; }
				tileY = (tileY%this.height + this.height) % this.height;
			}
			
			for( var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize ) {
				var tileX = mapX + tileOffsetX;
				
				// Repeat X?
				if( tileX >= this.width || tileX < 0 ) {
					if( !this.repeat ) { continue; }
					tileX = (tileX%this.width + this.width) % this.width;
				}
				
				// Create tile!
				if( (tile = this.data[tileY][tileX]) ) {
					var tile_n = tile-1;

					var texture = new PIXI.Texture(this.tiles.texture, {
						x:( Math.floor(tile_n * this.tilesize) % this.tiles.texture.width ), 
						y:( Math.floor(tile_n * this.tilesize / this.tiles.texture.width) * this.tilesize ),
						width:this.tilesize, 
						height:this.tilesize
					});

					// Create sprite.
					var sprite = new PIXI.Sprite(texture);

					// Set position of tile.
					sprite.pos = {x: pxX, y: pxY};
					sprite.position.x = sprite.pos.x;
					sprite.position.y = sprite.pos.y;

					this.tileContainer.addChild(sprite);
				}
			} // end for x
		} // end for y

		// Add map to scene.
		ig.game.stage.addChild(this.tileContainer);
	},

	drawTiled: function() {	
		if(!ig.editor) return;

		var tile = 0,
			anim = null,
			tileOffsetX = (this.scroll.x / this.tilesize).toInt(),
			tileOffsetY = (this.scroll.y / this.tilesize).toInt(),
			pxOffsetX = this.scroll.x % this.tilesize,
			pxOffsetY = this.scroll.y % this.tilesize,
			pxMinX = -pxOffsetX - this.tilesize,
			pxMinY = -pxOffsetY - this.tilesize,
			pxMaxX = ig.system.width + this.tilesize - pxOffsetX,
			pxMaxY = ig.system.height + this.tilesize - pxOffsetY;
			
		
		// FIXME: could be sped up for non-repeated maps: restrict the for loops
		// to the map size instead of to the screen size and skip the 'repeat'
		// checks inside the loop.

		for( var mapY = -1, pxY = pxMinY; pxY < pxMaxY; mapY++, pxY += this.tilesize) {
			var tileY = mapY + tileOffsetY;
				
			// Repeat Y?
			if( tileY >= this.height || tileY < 0 ) {
				if( !this.repeat ) { continue; }
				tileY = (tileY%this.height + this.height) % this.height;
			}
			
			for( var mapX = -1, pxX = pxMinX; pxX < pxMaxX; mapX++, pxX += this.tilesize ) {
				var tileX = mapX + tileOffsetX;
				
				// Repeat X?
				if( tileX >= this.width || tileX < 0 ) {
					if( !this.repeat ) { continue; }
					tileX = (tileX%this.width + this.width) % this.width;
				}
				
				// Draw!
				if( (tile = this.data[tileY][tileX]) ) {
					if( (anim = this.anims[tile-1]) ) { 
						anim.draw( pxX, pxY );
					}
					else {
						this.tiles.drawTile( pxX, pxY, tile-1, this.tilesize );
					}
				}
			} // end for x
		} // end for y
	}
});

});