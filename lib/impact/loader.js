ig.module(
	'impact.loader'
)
.requires(
	'impact.image',
	'impact.font',
	'impact.sound'
)
.defines(function(){ "use strict";

ig.Loader = ig.Class.extend({
	resources: [],
	
	gameClass: null,
	status: 0,
	done: false,
	
	_unloaded: [],
	_drawStatus: 0,
	_intervalId: 0,
	_loadCallbackBound: null,

	graphics: null,
	
	init: function( gameClass, resources ) {
		this.gameClass = gameClass;
		this.resources = resources;
		this._loadCallbackBound = this._loadCallback.bind(this);
		
		for( var i = 0; i < this.resources.length; i++ ) {
			this._unloaded.push( this.resources[i].path );
		}

		// Add graphics to stage.
		this.stage = new PIXI.Stage(0x000000); // New stage for every level.
		this.graphics = new PIXI.Graphics();
		this.stage.addChild(this.graphics);

		// Percentage done text.
		this.text = new PIXI.Text("10%", {font:"18px Fontoon", fill:"#19fc8e"});
		this.text.style.align = "center";
		this.text.position = {x: 400, y: 260};
		this.text.position.x -= this.text.width * 0.5;
		this.text.setText("0%");
		this.stage.addChild(this.text);
	},
	
	
	load: function() {
		ig.system.clear( '#000' );
		
		if( !this.resources.length ) {
			this.end();
			return;
		}

		for( var i = 0; i < this.resources.length; i++ ) {
			this.loadResource( this.resources[i] );
		}
		this._intervalId = setInterval( this.draw.bind(this), 16 );
	},
	
	
	loadResource: function( res ) {
		res.load( this._loadCallbackBound );
	},
	
	
	end: function() {
		if( this.done ) { return; }
		
		this.done = true;
		clearInterval( this._intervalId );
		ig.system.setGame( this.gameClass );

		// Remove loader stage.
		for (var i = this.stage.children.length - 1; i >= 0; i--) {
			this.stage.removeChild(this.stage.children[i]);
		}; this.stage = null;
	},
	
	
	draw: function() {
		if(this.stage)
			ig.system.renderer.render(this.stage);

		this._drawStatus += (this.status - this._drawStatus)/5;

		var s = ig.system.scale;
		var w = ig.system.width * 0.25;
		var h = ig.system.height * 0.03;
		var x = ig.system.width * 0.5-w/2;
		var y = ig.system.height * 0.5-h/2;
		
		this.graphics.beginFill(0x19fc8e);
		this.graphics.drawRect( x*s, y*s, w*s, h*s);

		this.graphics.beginFill(0x000000);
		this.graphics.drawRect( x*s+s, y*s+s, w*s-s-s, h*s-s-s);

		this.graphics.beginFill(0x19fc8e);
		this.graphics.drawRect( x*s, y*s, w*s*this._drawStatus, h*s);

		this.graphics.endFill();

		this.text.setText((this.status*100).toFixed(0) + "%");

		/*
		this._drawStatus += (this.status - this._drawStatus)/5;
		var s = ig.system.scale;
		var w = ig.system.width * 0.25;
		var h = ig.system.height * 0.03;
		var x = ig.system.width * 0.5-w/2;
		var y = ig.system.height * 0.5-h/2;

		ig.system.context.fillStyle = '#000';
		ig.system.context.fillRect( 0, 0, 480, 320 );
		
		ig.system.context.fillStyle = '#19fc8e';
		ig.system.context.fillRect( x*s, y*s, w*s, h*s );
		
		ig.system.context.fillStyle = '#000';
		ig.system.context.fillRect( x*s+s, y*s+s, w*s-s-s, h*s-s-s );
		
		ig.system.context.fillStyle = '#19fc8e';
		ig.system.context.fillRect( x*s, y*s, w*s*this._drawStatus, h*s );

		this.l_font.draw((this.status*100).toFixed(0) + '%', 400, 260, 'center', '#19fc8e');*/
	},
	
	
	_loadCallback: function( path, status ) {
		if( status ) {
			this._unloaded.erase( path );
		}
		else {
			throw( 'Failed to load resource: ' + path );
		}

		this.status = 1 - (this._unloaded.length / this.resources.length);
		if( this._unloaded.length == 0 ) { // all done?
			setTimeout( this.end.bind(this), 250 );
		}
	}
});

});