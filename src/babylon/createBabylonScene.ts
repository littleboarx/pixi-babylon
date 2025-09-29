import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { Engine } from '@babylonjs/core/Engines/engine'
import { HemisphericLight } from '@babylonjs/core/Lights/hemisphericLight'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Scene } from '@babylonjs/core/scene'

import { BabylonSceneConfig } from '../types.js'

/**
 * Creates a Babylon.js scene with default camera and lighting
 *
 * @param config - Configuration options for the Babylon scene
 * @returns Object containing the engine and scene instances
 *
 * @example
 * ```typescript
 * // Basic usage
 * const { engine, scene } = await createBabylonScene({
 *   canvas: '#babylon-canvas'
 * })
 *
 * // Advanced configuration
 * const { engine, scene } = await createBabylonScene({
 *   canvas: document.getElementById('canvas'),
 *   engineOptions: { antialias: true, stencil: true },
 *   autoStart: true
 * })
 * ```
 */
export async function createBabylonScene(config: BabylonSceneConfig = {}) {
    // Handle canvas selection
    let canvas: HTMLCanvasElement
    if (typeof config.canvas === 'string') {
        const element = document.querySelector(config.canvas) as HTMLCanvasElement
        if (!element) {
            throw new Error(`Canvas element not found: ${config.canvas}`)
        }
        canvas = element
    } else if (config.canvas) {
        canvas = config.canvas
    } else {
        // Create default canvas if none provided
        canvas = document.createElement('canvas')
        canvas.style.width = '100%'
        canvas.style.height = '100%'
        document.body.appendChild(canvas)
    }

    // Create engine with default options
    const engineOptions = {
        antialias: true,
        stencil: true,
        premultipliedAlpha: false,
        ...config.engineOptions,
    }

    const engine = new Engine(canvas, true, engineOptions)

    // Create scene with default options
    const scene = new Scene(engine, config.sceneOptions)

    // Add default camera
    const camera = new FreeCamera('camera', new Vector3(0, 5, -10), scene)
    camera.setTarget(Vector3.Zero())

    // Add default lighting
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
    light.intensity = 0.7

    // Auto-start render loop if specified
    if (config.autoStart !== false) {
        engine.runRenderLoop(() => {
            scene.render()
        })
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        engine.resize()
    })

    return { engine, scene, camera, light }
}

/**
 * Creates a minimal Babylon.js scene without default camera and lighting
 * Useful for advanced users who want full control over scene setup
 *
 * @param canvas - Canvas element for rendering
 * @param engineOptions - Engine configuration options
 * @param sceneOptions - Scene configuration options
 * @returns Object containing the engine and scene instances
 *
 * @example
 * ```typescript
 * const canvas = document.getElementById('canvas') as HTMLCanvasElement
 * const { engine, scene } = createMinimalBabylonScene(canvas, {
 *   antialias: true,
 *   powerPreference: 'high-performance'
 * })
 *
 * // Add your own camera and lighting
 * const camera = new ArcRotateCamera('camera', 0, 0, 10, Vector3.Zero(), scene)
 * ```
 */
export function createMinimalBabylonScene(
    canvas: HTMLCanvasElement,
    engineOptions: any = {},
    sceneOptions: any = {}
) {
    const engine = new Engine(canvas, true, {
        antialias: true,
        stencil: true,
        ...engineOptions,
    })

    const scene = new Scene(engine, sceneOptions)

    return { engine, scene }
}
