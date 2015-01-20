# impactjspixi
Using ImpactJS with PIXI as rendering engine.

Rewritten most /impact/ files to support PIXI rendering:
- Create new entities and add animations like you would normally do.
- Use ig.Image as normally, but add it to stage by writing: ig.game.stage.addChild( your_image )

Features:
- Background-map.js utilizes SpriteBatch for speed.
- Use of PIXI's ImageLoader in image.js that works with ImpactJS loader.
- Fallback to ImpactJS rendering when using Weltmeister.

Todo:
- Simplify button class
- Use PIXI's input system instead of ImpactJS's.