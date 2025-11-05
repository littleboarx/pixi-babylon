import { Application, ApplicationOptions } from 'pixi.js'

/**
 * Creates a PIXI application with enhanced configuration options
 *
 * @param config - Configuration options for the PIXI application
 * @param canvas
 * @param context
 * @returns Promise that resolves to the initialized PIXI application
 */
export async function createPixiApp(
    config: Partial<ApplicationOptions>,
    canvas: HTMLCanvasElement,
    context: WebGL2RenderingContext
): Promise<Application> {
    const size = getComputedStyle(canvas)
    // Create application options
    const resolution = Math.min(devicePixelRatio, 2)
    const options: Partial<ApplicationOptions> = {
        // width: 800,
        // height: 600,
        // backgroundColor: 0x1099bb,
        // antialias: true,
        ...config,
        canvas,
        context,
        resolution,
        backgroundAlpha: 0,
        preferWebGLVersion: 2,
        autoStart: false,
        clearBeforeRender: false,
        roundPixels: true,
        width: parseInt(size.width),
        height: parseInt(size.height),
    }

    // Create and initialize application
    const app = new Application()
    await app.init(options)

    return app
}
