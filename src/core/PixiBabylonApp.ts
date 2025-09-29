import { Engine } from '@babylonjs/core/Engines/engine'
import { ThinEngine } from '@babylonjs/core/Engines/thinEngine'
import { Observable } from '@babylonjs/core/Misc/observable'
import { Scene } from '@babylonjs/core/scene'
import { Application } from 'pixi.js'

import { createBabylonScene } from '../babylon/createBabylonScene.js'
import { createPixiApp } from '../pixi/createPixiApp.js'
import { PixiAppConfig, BabylonSceneConfig, PixiBabylonApp, RenderLoopOptions } from '../types.js'

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

    private renderLoopRunning = false
    private renderLoopOptions: RenderLoopOptions = {
        clearStencil: false,
        autoReset: true,
    }

    /** Observable that fires before each render frame */
    public beforeRenderObservable = new Observable<void>()

    /** Observable that fires after each render frame */
    public afterRenderObservable = new Observable<void>()

    private constructor() {}

    /**
     * Creates a new integrated PIXI-Babylon application
     *
     * @param config - Configuration for both PIXI and Babylon components
     * @param renderOptions - Options for the integrated render loop
     * @returns Promise that resolves to the initialized application
     */
    static async create(
        config: {
            pixi?: PixiAppConfig
            babylon?: BabylonSceneConfig
            canvas?: HTMLCanvasElement
        } = {},
        renderOptions?: RenderLoopOptions
    ): Promise<PixiBabylonApplication> {
        if (!config.canvas) {
            config.canvas = document.createElement('canvas')
        }

        if (renderOptions) {
            app.renderLoopOptions = { ...app.renderLoopOptions, ...renderOptions }
        }

        // Initialize PIXI application
        app.pixi = await createPixiApp({
            autoStart: false, // We'll control the render loop
            ...config.pixi,
        })

        // Initialize Babylon scene
        const { engine, scene } = await createBabylonScene({
            autoStart: false, // We'll control the render loop
            ...config.babylon,
        })

        app.babylonEngine = engine
        app.babylonScene = scene

        // Set up context sharing (similar to original codebase)
        app.setupContextSharing()

        // Auto-start if not explicitly disabled
        if (config.pixi?.autoStart !== false && config.babylon?.autoStart !== false) {
            app.start()
        }

        return app
    }

    /**
     * Starts the integrated render loop
     * Renders both PIXI and Babylon content in the correct order
     */
    start(): void {
        if (this.renderLoopRunning) {
            return
        }

        this.renderLoopRunning = true

        // Set up the integrated render loop
        this.babylonEngine.runRenderLoop(() => {
            this.beforeRenderObservable.notifyObservers()

            // Reset renderer state if needed
            if (this.renderLoopOptions.autoReset) {
                this.pixi.renderer.resetState()
            }

            // Clear stencil buffer if requested
            if (this.renderLoopOptions.clearStencil) {
                const gl = (this.babylonEngine as ThinEngine)._gl
                gl.disable(gl.STENCIL_TEST)
                gl.stencilMask(0xff)
                gl.clear(gl.STENCIL_BUFFER_BIT)
            }

            // Render Babylon scene first (if there's an active camera)
            if (this.babylonScene.activeCamera) {
                this.babylonEngine.wipeCaches(true)
                this.babylonScene.render()
            }

            // Then render PIXI content
            this.renderPixi()

            this.afterRenderObservable.notifyObservers()
        })

        // Handle PIXI rendering at the end of each Babylon frame
        this.babylonEngine.onEndFrameObservable.add(() => {
            this.babylonEngine.wipeCaches(true)
            this.renderPixi()
        })
    }

    /**
     * Stops the render loop
     */
    stop(): void {
        if (!this.renderLoopRunning) {
            return
        }

        this.renderLoopRunning = false
        this.babylonEngine.stopRenderLoop()
    }

    /**
     * Destroys both applications and cleans up resources
     */
    destroy(): void {
        this.stop()

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
        if (this.renderLoopOptions.autoReset) {
            this.pixi.renderer.resetState()
        }

        this.pixi.render()

        if (this.renderLoopOptions.autoReset) {
            this.pixi.renderer.resetState()
        }

        // Ensure proper WebGL state for Babylon
        const gl = (this.babylonEngine as ThinEngine)._gl
        gl.bindVertexArray(null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    /**
     * Sets up context sharing between PIXI and Babylon
     * This allows for advanced integrations like shared textures
     */
    private setupContextSharing(): void {
        // Store references for potential cross-integration
        // This mimics the context.ts from the original codebase

        // Add resize handling
        window.addEventListener('resize', () => {
            this.babylonEngine.resize()
            // PIXI should auto-resize if canvas is responsive
        })
    }

    /**
     * Updates render loop options at runtime
     *
     * @param options - New render loop options
     */
    updateRenderOptions(options: Partial<RenderLoopOptions>): void {
        this.renderLoopOptions = { ...this.renderLoopOptions, ...options }
    }
}
