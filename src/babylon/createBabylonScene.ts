import { EngineOptions } from '@babylonjs/core'
import { Engine } from '@babylonjs/core/Engines/engine'
import { Scene, SceneOptions } from '@babylonjs/core/scene'

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

export type BabylonOption = {
    sceneOption: SceneOptions
    engineOption: EngineOptions
    antialias: boolean
}
const defaultBabylonOption = { sceneOption: {}, engineOption: {}, antialias: false }
export async function createBabylonScene(
    canvas: HTMLCanvasElement,
    option?: Partial<BabylonOption>
) {
    const { sceneOption, engineOption, antialias } = { ...defaultBabylonOption, ...option }

    const engine = new Engine(canvas, antialias, engineOption)

    const scene = new Scene(engine, sceneOption)

    return { engine, scene }
}
