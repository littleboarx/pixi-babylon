import { Engine } from '@babylonjs/core/Engines/engine'
import { ThinEngine } from '@babylonjs/core/Engines/thinEngine'
import { Observable } from '@babylonjs/core/Misc/observable'
import { Scene } from '@babylonjs/core/scene'
import { Application } from 'pixi.js'

import { createBabylonScene } from '../babylon/createBabylonScene.js'
import { createPixiApp } from '../pixi/createPixiApp.js'
import { PixiBabylonApp } from '../types.js'

/**
 * Integrated application class that manages both PIXI and Babylon.js rendering
 * Provides a unified render loop and cross-integration capabilities
 *
 * @example
 * ```typescript
 * // Basic usage - single canvas
 * const app = await PixiBabylonApplication.create({
 *   pixi: { width: 800, height: 600 },
 *   babylon: { canvas: '#canvas' }
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
export class PixiBabylonApplication implements PixiBabylonApp {
    public pixi!: Application
    public babylonScene!: Scene
    public babylonEngine!: Engine
    public gl!: WebGL2RenderingContext

    /** Observable that fires before each render frame */
    public beforeRenderObservable = new Observable<void>()

    /** Observable that fires after each render frame */
    public afterRenderObservable = new Observable<void>()

    private constructor() {
        PixiBabylonApplication.lastCreateApplication = this
    }
    static lastCreateApplication?: PixiBabylonApplication

    /**
     * Creates a new integrated PIXI-Babylon application
     */
    static async create(
        config: {
            canvas?: HTMLCanvasElement
        } = {}
    ): Promise<PixiBabylonApplication> {
        if (!config.canvas) {
            config.canvas = document.createElement('canvas')
        }
        const app = new PixiBabylonApplication()

        // Initialize Babylon scene
        const { engine, scene } = await createBabylonScene(config.canvas)
        app.gl = engine._gl
        // Initialize PIXI application
        app.pixi = await createPixiApp({}, config.canvas!, app.gl)

        app.babylonEngine = engine
        app.babylonScene = scene

        return app
    }

    /**
     * Starts the integrated render loop
     * Renders both PIXI and Babylon content in the correct order
     */
    start(): void {
        this.babylonEngine.onEndFrameObservable.add(() => {
            this.babylonEngine.wipeCaches(true)
            this.renderPixi()
        })
        this.babylonEngine.runRenderLoop(() => {
            this.beforeRenderObservable.notifyObservers()

            // Render Babylon scene first (if there's an active camera)
            if (this.babylonScene.activeCamera) {
                this.babylonEngine.wipeCaches(true)
                this.babylonScene.render()
            } else {
                // Then render PIXI content
                this.renderPixi()
            }

            this.afterRenderObservable.notifyObservers()
        })

        // Handle PIXI rendering at the end of each Babylon frame
        this.babylonEngine.onEndFrameObservable.add(() => {
            this.babylonEngine.wipeCaches(true)
            this.renderPixi()
        })
    }

    /**
     * Destroys both applications and cleans up resources
     */
    destroy(): void {
        this.beforeRenderObservable.clear()
        this.afterRenderObservable.clear()
        this.pixi.destroy()
        this.babylonScene.dispose()
        this.babylonEngine.dispose()
    }

    /**
     * Renders the PIXI application
     */
    private renderPixi(): void {
        const { gl } = this
        gl.disable(gl.STENCIL_TEST)
        gl.stencilMask(0xff)
        gl.clear(gl.STENCIL_BUFFER_BIT)
        this.pixi.renderer.resetState()
        this.pixi.render()
        this.pixi.renderer.resetState()
    }
}
