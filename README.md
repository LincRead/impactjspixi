# impactjspixi
Using ImpactJS with PIXI as rendering engine.

Rewritten most /impact/ files to support PIXI rendering:
- create new entities and add animations like you would normally do.
- background-map.js utilizes SpriteBatch for speed.
- Use of PIXI's ImageLoader in image.js that works with ImpactJS loader.
- Fallback to ImpactJS rendering with the use of Weltmeister.

Todo:
- Simplify button class
- Use PIXI input system instead of ImpactJSs.