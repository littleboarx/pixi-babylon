import { ThinEngine } from '@babylonjs/core/Engines/thinEngine'
import { Observable } from '@babylonjs/core/Misc/observable'
import { Scene } from '@babylonjs/core/scene'
import { Application } from 'pixi.js'

/**
 * Advanced render loop management for custom rendering pipelines
 *
 * These utilities allow experienced users to create custom render loops
 * that integrate PIXI and Babylon in specific ways not covered by the
 * out-of-box PixiBabylonApplication.
 */

/**
 * Observable that fires before each render frame
 * Advanced users can subscribe to this for custom pre-render logic
 */
export const beforeRenderObservable = new Observable<void>()

/**
 * Observable that fires after each render frame
 * Advanced users can subscribe to this for custom post-render logic
 */
export const afterRenderObservable = new Observable<void>()

/**
 * Render loop options for advanced customization
 */
export interface AdvancedRenderOptions {
    /** Clear stencil buffer before rendering */
    clearStencil?: boolean
    /** Clear depth buffer before rendering */
    clearDepth?: boolean
    /** Custom clear color */
    clearColor?: { r: number; g: number; b: number; a: number }
    /** Whether to wipe Babylon caches before rendering */
    wipeCaches?: boolean
    /** Custom PIXI render order (before/after Babylon) */
    pixiRenderOrder?: 'before' | 'after' | 'both'
    /** Whether to reset PIXI state automatically */
    autoResetPixiState?: boolean
}

/**
 * Creates a custom render loop with advanced options
 *
 * @param scene - Babylon.js scene
 * @param pixiApp - PIXI application
 * @param options - Advanced render options
 * @returns Function to stop the render loop
 *
 * @example
 * ```typescript
 * const stopRenderLoop = createCustomRenderLoop(scene, pixiApp, {
 *   clearStencil: true,
 *   pixiRenderOrder: 'before',
 *   clearColor: { r: 0.1, g: 0.1, b: 0.2, a: 1.0 }
 * })
 *
 * // Later, stop the loop
 * stopRenderLoop()
 * ```
 */
export function createCustomRenderLoop(
    scene: Scene,
    pixiApp: Application,
    options: AdvancedRenderOptions = {}
): () => void {
    const engine = scene.getEngine() as ThinEngine
    const gl = engine._gl

    const defaultOptions: Required<AdvancedRenderOptions> = {
        clearStencil: false,
        clearDepth: false,
        clearColor: { r: 0, g: 0, b: 0, a: 0 },
        wipeCaches: true,
        pixiRenderOrder: 'after',
        autoResetPixiState: true,
    }

    const resolvedOptions = { ...defaultOptions, ...options }

    const pixiRender = () => {
        if (resolvedOptions.autoResetPixiState) {
            pixiApp.renderer.resetState()
        }

        pixiApp.render()

        if (resolvedOptions.autoResetPixiState) {
            pixiApp.renderer.resetState()
            // Restore WebGL state for Babylon
            gl.bindVertexArray(null)
            gl.bindFramebuffer(gl.FRAMEBUFFER, null)
        }
    }

    const renderFrame = () => {
        beforeRenderObservable.notifyObservers()

        // Apply custom clear settings
        if (resolvedOptions.clearStencil || resolvedOptions.clearDepth) {
            let clearFlags = 0
            if (resolvedOptions.clearStencil) {
                gl.disable(gl.STENCIL_TEST)
                gl.stencilMask(0xff)
                clearFlags |= gl.STENCIL_BUFFER_BIT
            }
            if (resolvedOptions.clearDepth) {
                clearFlags |= gl.DEPTH_BUFFER_BIT
            }
            if (clearFlags) {
                gl.clear(clearFlags)
            }
        }

        // Set custom clear color
        const { r, g, b, a } = resolvedOptions.clearColor
        gl.clearColor(r, g, b, a)

        // Render PIXI before Babylon if requested
        if (
            resolvedOptions.pixiRenderOrder === 'before' ||
            resolvedOptions.pixiRenderOrder === 'both'
        ) {
            pixiRender()
        }

        // Render Babylon scene
        if (scene.activeCamera) {
            if (resolvedOptions.wipeCaches) {
                engine.wipeCaches(true)
            }
            scene.render()
        }

        // Render PIXI after Babylon if requested
        if (
            resolvedOptions.pixiRenderOrder === 'after' ||
            resolvedOptions.pixiRenderOrder === 'both'
        ) {
            pixiRender()
        }

        afterRenderObservable.notifyObservers()
    }

    // Start render loop
    engine.runRenderLoop(renderFrame)

    // Return stop function
    return () => {
        engine.stopRenderLoop()
    }
}

/**
 * Patches the default Babylon render loop to include PIXI integration
 * This is a lower-level alternative to PixiBabylonApplication
 *
 * @param scene - Babylon scene to patch
 * @param pixiApp - PIXI application to integrate
 * @param options - Render options
 *
 * @example
 * ```typescript
 * // Create scene and PIXI app separately
 * const scene = new Scene(engine)
 * const pixiApp = new Application()
 *
 * // Patch the render loop to include PIXI
 * patchBabylonRenderLoop(scene, pixiApp, {
 *   clearStencil: true
 * })
 *
 * // Start normal Babylon render loop
 * engine.runRenderLoop(() => scene.render())
 * ```
 */
export function patchBabylonRenderLoop(
    scene: Scene,
    pixiApp: Application,
    options: AdvancedRenderOptions = {}
): void {
    const engine = scene.getEngine() as ThinEngine
    const originalRender = scene.render.bind(scene)

    scene.render = (updateCameras?: boolean, ignoreAnimations?: boolean) => {
        beforeRenderObservable.notifyObservers()

        // Custom pre-render logic
        if (options.clearStencil) {
            const gl = engine._gl
            gl.disable(gl.STENCIL_TEST)
            gl.stencilMask(0xff)
            gl.clear(gl.STENCIL_BUFFER_BIT)
        }

        // Call original Babylon render
        const result = originalRender(updateCameras, ignoreAnimations)

        // Render PIXI after Babylon
        if (options.autoResetPixiState !== false) {
            pixiApp.renderer.resetState()
        }
        pixiApp.render()
        if (options.autoResetPixiState !== false) {
            pixiApp.renderer.resetState()
        }

        afterRenderObservable.notifyObservers()
        return result
    }
}
