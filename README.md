# impactjspixi
Using ImpactJS with PIXI as rendering engine.

Rewritten most /impact/ files to support PIXI rendering:
- Create new entities and add animations like you would normally do.
- Use ig.Image as normally, but add it by writing ig.game.stage.addChild( your_image ) in eg. init()

Features:
- Background-map.js utilizes SpriteBatch for speed.
- Use of PIXI's ImageLoader in image.js that works with ImpactJS loader.
- Fallback to ImpactJS rendering with the use of Weltmeister.

Todo:
- Simplify button class
- Use PIXI input system instead of ImpactJSs.