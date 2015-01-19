ig.module(
    'game.entities.gui.button'
)

.requires(
    'impact.entity'
)

.defines(function(){
    
// Base class for buttons.
EntityButton = ig.Entity.extend({
    
    zIndex: 6, // How far behind this should be drawn compared to other objects.
    is_activated: true, // If the buttons is activated, the user can interact with it.
    can_be_activate: false, // Need a delay so that when a button is clicked, and a new button is added at the same space, the new button won't be set as clicked right away.
    can_be_active_timer: new ig.Timer(), // The delay set before a new button can be clicked.
    gravityFactor: 0, // Stay where you are.
    notice: { }, // A notice or comment about what is going to happen if user clicks this button."
    scale: 1, // Scale.
    selected: false, // Button is currently selected.
    play_click_sound: true,
    hide: false,
    scale_alignment: "c", // c = center, l = left, r = right, u = up, d = down. Size scales in the direction set with this value.
    has_focus: false,

    // Anim values.
    scale_dir:1,
    anim_speed: 0.3,
    anim_speed_start: 0.45,
    anim_scaling: 0.08,
    scale_to_this: 1,
    scale_init: 0.1,

    has_had_focus: false, // Important for tweening to work.

    snd_hover: null,

    init: function( x, y, settings ) {
        this.parent( x, y, settings ); 

        this.addOffset();

        if(settings.notice === undefined) this.notice = "";
        else this.notice = settings.notice;
        
        if(!ig.editor){

            // Re-sort Entities
            ig.game.sortEntitiesDeferred();
            
            // Set click button delay.
            this.can_be_active_timer.set( .1 );
        }

        // Tween activation of button.
        this.scale = this.scale_init;
        this.tween = TweenMax.to(this, this.anim_speed_start, {ease:Power2.easeOut, scale:this.scale_to_this, onComplete:this.activated.bind(this)});
    },

    activated: function() {
        this.can_be_activate = true;
    },

    // Increase size of hitbox for all buttons, so you can slighly "miss"; but still hit the button.
    addOffset: function() {
        this.size.x += 16;
        this.size.y += 16;
        this.offset.x -= 8;
        this.offset.y -= 8;       
    },

    // Use this for setting position when dynamic offset position is considered.
    setPosition: function(x, y) {
        this.pos.x = x + this.offset.x;
        this.pos.y = y + this.offset.y;
    },

    // When the buttons has mouse focus.
    onMouseFocus: function() {    
        if(!this.can_be_activate || this.is_activated === false)
            return;

        // Mouse cursor is hoovering button and user clicked on it.
        if(ig.input.pressed('mouse_left') === true && this.selected === false) {
            // Play click sound after action is done.
            if(this.play_click_sound === true) {
                //this.snd_click.play();
            }

            this.action();

            // Play click sound after action is done.
            if(this.play_click_sound === true) {
                var snd_click = new ig.Sound( 'media/sounds/click_1.*');

                snd_click.play();
            }

            ig.game.button_has_focus = null;
        }

        else if(!this.selected) this.focus();
    },

    // Check whether the mouse cursor is hovering above a sprite.
    mouseCollision: function() {
        if(this.is_activated === false || this.selected === true)
            return false;
        //console.log(this.pos.x, ig.input.mouse.x);
        // PC.
        if(this.mouseCollisionScreen()) {
            return true;
        } else if(!this.selected) {
            this.unfocus();
            return false;
        }     
    },

    update: function() {
        if(this.mouseCollision()) this.onMouseFocus();

        // If button is recently added and has not been set to 'can be active'.
        if(!this.can_be_activate) {
            if(this.is_activated)
            // Thus button can not be focused on yet.
            this.unfocus();
            
            // Check if button should be able to be activated.
            if(this.can_be_active_timer.delta() > 0 ) {
                //this.can_be_activate = true;
                this.can_be_active_timer.pause(); // Deactivate timer.
            } else {
                // ...
            }
        }

        // Override parent update.
        if( this.currentAnim ) {
            this.currentAnim.update();

            if(this.sprite) {
                //this.sprite.setTexture(this.currentAnim.tile);

                if(this.scale_alignment === "c") {
                    this.sprite.anchor = new PIXI.Point(0.5, 0.5);
                    this.sprite.position.x = this.pos.x + (this.size.x/2);
                    this.sprite.position.y = this.pos.y + (this.size.y/2);
                } else if (this.scale_alignment === "l") {
                    this.sprite.anchor = new PIXI.Point(0, 0.5);
                }

                this.sprite.rotation = this.currentAnim.angle;
                this.sprite.scale = new PIXI.Point(this.scale, this.scale);
            }
        }
    },

    select: function() {
        this.currentAnim = this.anims.select;
        this.selected = true;

        TweenMax.fromTo(this, this.anim_speed*2.2, {scale:0.8},{scale:1, ease:Bounce.easeOut, onComplete:this.selectTweenCompleted.bind(this)});
    },

    selectTweenCompleted: function() {

    },

    unselect: function() {
        this.selected = false;
        this.has_focus = false;
        this.is_activated = true;
    },

    // Called when mouse cursor intersects button. Can be used to e.g.change frame.
    focus: function() {
        this.currentAnim = this.anims.focus;

        if(!this.has_focus) {
            TweenMax.fromTo(this, this.anim_speed, {scale:this.scale_to_this},{yoyo: true, repeat:-1, scale:this.scale_to_this-this.anim_scaling});
            
            var snd_hover = new ig.Sound('media/sounds/hover_1.*');
            snd_hover.play();
        }

        this.has_focus = true;
        this.has_had_focus = true;
    },
    
    // Called when mouse cursor intersects button. Can be used to e.g.change frame.
    unfocus: function() {
        if(this.selected === false) {
            this.currentAnim = this.anims.unfocus;

            if(this.has_had_focus) {
                TweenMax.to(this, .1, {scale:this.scale_to_this});
            }
        }

        this.has_focus = false;
    },

    // Activate user interaction with button.
    activate: function() { 
        if(!this.is_activated) {
            this.scale = 0;
            TweenMax.fromTo(this, this.anim_speed_start, {scale:this.scale_init},{ease:Back.easeOut, scale:this.scale_to_this, onComplete:this.activated.bind(this)});
            this.has_had_focus = false;
        }

        this.is_activated = true; 
        this.hide = false; 
    },

    // Deactivate user interaction with button.
    deactivate: function() { 
        this.selected = false;
        this.is_activated = false; 
        this.hide = true; 
    },

    /* Disables the button without hiding it.
     *
     */
    disable: function() { 
        // Not the same as deactivated. Deactivate to hide.
        this.hide = false;
        this.is_activated = false; 
        this.selected = false;

        if(this.has_had_focus) {
            TweenMax.to(this, .1, {scale:this.scale_to_this});
        }

        if(this.selected === false) {
            if(this.anims.disabled)
                this.currentAnim = this.anims.disabled;
            else 
                this.currentAnim = this.anims.unfocus;
        }

        this.has_focus = false;
    },

    disableClickSound: function() { this.play_click_sound = false; },
})
});