import { Application, ApplicationOptions, Container, WebGLRenderer } from 'pixi.js'

/**
 * Creates a PIXI application with enhanced configuration options
 *
 * @param config - Configuration options for the PIXI application
 * @param canvas
 * @returns Promise that resolves to the initialized PIXI application
 *
 * @example
 * ```typescript
 * // Basic usage
 * const app = await createPixiApp({
 *   width: 800,
 *   height: 600,
 *   backgroundColor: 0x1099bb
 * })
 *
 * // With custom canvas
 * const app = await createPixiApp({
 *   canvas: '#game-canvas',
 *   width: 1024,
 *   height: 768,
 *   antialias: true
 * })
 * ```
 */
export async function createPixiApp(
    config: ApplicationOptions,
    canvas: HTMLCanvasElement
): Promise<Application> {
    // Create application options
    const options: ApplicationOptions = {
        // width: 800,
        // height: 600,
        // backgroundColor: 0x1099bb,
        // antialias: true,
        ...config,
        canvas,
    }

    // Create and initialize application
    const app = new Application()
    await app.init(options)

    return app
}
