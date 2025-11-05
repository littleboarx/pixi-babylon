/**
 * PIXI-Babylon Integration Library
 *
 * This library provides out-of-box methods for creating PIXI 2D applications
 * and Babylon 3D scenes with integrated rendering loops. It also offers
 * advanced patch methods for users who need fine-grained control.
 *
 * @packageDocumentation
 */

import { PixiBabylonApplication } from './core/PixiBabylonApp.js'

// Out-of-box methods - Easy to use, works immediately
export { createPixiApp } from './pixi/createPixiApp.js'
export { createBabylonScene } from './babylon/createBabylonScene.js'
export { PixiBabylonApplication } from './core/PixiBabylonApp.js'

// Advanced integration features
export { PixiTexture } from './integration/PixiTexture.js'
export { BabylonTextureFilter } from './integration/BabylonTextureFilter.js'

/**
 * Quick start function that creates a complete PIXI-Babylon application
 * with sensible defaults.
 *
 * @param config - Optional configuration for the application
 * @returns Promise that resolves to the initialized application
 *
 * @example
 * ```typescript
 * import { quickStart } from 'pixi-babylon'
 *
 * const app = await quickStart({
 *   canvas: '#game-canvas',
 *   width: 1024,
 *   height: 768
 * })
 *
 * // Add PIXI content
 * const sprite = new PIXI.Sprite(texture)
 * app.pixi.stage.addChild(sprite)
 *
 * // Add Babylon content
 * const box = MeshBuilder.CreateBox('box', {size: 2}, app.babylonScene)
 * ```
 */
export async function createPixiBabylon(): Promise<PixiBabylonApplication> {
    return PixiBabylonApplication.create()
}
