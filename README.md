# ImpactJSPixi
Using ImpactJS as game engine with PIXI as rendering engine.

_Note: this rep only shows work in progress. This was a starting point for rendering Enki and other HTML5 games with PixiJS. It was done to see if integrating ImpactJS with PixiJS was a viable option, which it turned out to be._

_Enki (http://www.enkifag.no) runs on the final version of my ImpactJS + PixiJS solution, which is a lot more complete. It takes use of PixiJS's input system, and is highly optimized. Unfortunately, that solution is private._

Rewritten most /impact/ files to support PIXI rendering:
- Create new entities and add animations like you would normally do.
- Use ig.Image as normally, but add it to stage by writing: ig.game.stage.addChild( your_image )

Features:
- Background-map.js utilizes SpriteBatch for performance.
- Usage of PIXI's ImageLoader in image.js that works with ImpactJS Loader.
- Fallback to ImpactJS's Canvas rendering method while using Weltmeister.
