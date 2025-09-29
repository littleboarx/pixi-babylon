import { WebGLHardwareTexture } from '@babylonjs/core/Engines'
import { Constants } from '@babylonjs/core/Engines/constants'
import { Engine } from '@babylonjs/core/Engines/engine'
import { RawTexture } from '@babylonjs/core/Materials/Textures/rawTexture'
import { ISize } from '@babylonjs/core/Maths'
import { Observer } from '@babylonjs/core/Misc/observable'
import { Scene } from '@babylonjs/core/scene'
import { Container, GlTextureSystem, Rectangle, Renderer, RenderTexture } from 'pixi.js'

import { PixiBabylonApplication } from '../core/PixiBabylonApp.ts'
import { DynamicTextureOptions } from '../types.js'

import { BabylonTextureFilter } from './BabylonTextureFilter.js'

/**
 * PixiDynamicTexture allows rendering any PIXI object as a Babylon.js texture
 *
 * This class bridges PIXI.js 2D rendering with Babylon.js 3D rendering by:
 * - Creating a render texture in PIXI that captures 2D content
 * - Wrapping the WebGL texture for use in Babylon.js materials
 * - Handling coordinate system and color space differences between the two engines
 *
 * Technical Details:
 * - Uses two FBOs (Frame Buffer Objects): one for coordinate/premultiplication correction,
 *   one for generating the Babylon.js static texture
 * - Babylon.js uses the WebGL texture directly without additional overhead
 * - Manual synchronization required - no automatic updates unless autoUpdate is enabled
 *
 * @example
 * ```typescript
 * // Create a PIXI container with some content
 * const pixiContainer = new PIXI.Container()
 * const sprite = new PIXI.Sprite(texture)
 * pixiContainer.addChild(sprite)
 *
 * // Create dynamic texture
 * const dynamicTexture = new PixiDynamicTexture(pixiContainer, { width: 512, height: 512 }, {
 *   autoUpdate: true,
 *   name: 'ui-overlay'
 * })
 *
 * // Use in Babylon material
 * const material = new StandardMaterial('material', scene)
 * material.diffuseTexture = dynamicTexture
 * ```
 */
export class PixiDynamicTexture<T extends Container = Container> extends RawTexture {
    /** Configuration options for the dynamic texture */
    public readonly options: Required<DynamicTextureOptions>

    /** The PIXI render texture used for capturing content */
    public readonly renderTexture: RenderTexture

    /** Babylon texture filter for handling coordinate system differences */
    public readonly filter: BabylonTextureFilter

    /** The actual render size (width/height * resolution) */
    public readonly renderSize: { width: number; height: number }

    /** Root container that wraps the user's container with filters */
    public readonly rootContainer = new Container()

    private observer?: Observer<void>
    private beforeRenderObservable?: any // Will be set by context

    /**
     * Creates a new PixiDynamicTexture
     *
     * @param container - The PIXI container to render as texture
     * @param size - Target size for the texture (defaults to container size)
     * @param options - Configuration options
     * @param pixiBabylonApplication checkout Application
     */
    constructor(
        public readonly container: T,
        public readonly size: ISize = container,
        options: Partial<DynamicTextureOptions> = {},
        private pixiBabylonApplication = PixiBabylonApplication.lastCreateApplication
    ) {
        // Resolve default options
        const defaultOptions: Required<DynamicTextureOptions> = {
            autoUpdate: false,
            name: '',
            resolution: renderer?.resolution ?? 1,
        }
        const resolvedOptions = { ...defaultOptions, ...options }

        // Ensure integer dimensions
        const normalizedSize = {
            width: Math.ceil(size.width),
            height: Math.ceil(size.height),
        }

        // Calculate actual render size based on resolution
        const renderSize = {
            width: Math.ceil(normalizedSize.width * resolvedOptions.resolution),
            height: Math.ceil(normalizedSize.height * resolvedOptions.resolution),
        }

        // Initialize Babylon raw texture
        super(
            new Uint8Array(renderSize.width * renderSize.height * 4),
            renderSize.width,
            renderSize.height,
            Constants.TEXTUREFORMAT_RGBA,
            scene!,
            false, // generateMipMaps
            true // invertY
        )

        this.renderSize = renderSize
        this.options = resolvedOptions
        this.name = resolvedOptions.name

        // Set up coordinate system correction
        // Babylon's UV coordinate system and PIXI's XY coordinate system have different Y-axis directions
        // Babylon textures don't use premultiplied alpha by default, but PIXI does
        this.filter = new BabylonTextureFilter()
        this.filter.resolution = 'inherit'
        this.rootContainer.filters = [this.filter]
        this.rootContainer.filterArea = new Rectangle(
            0,
            0,
            normalizedSize.width,
            normalizedSize.height
        )
        this.rootContainer.addChild(this.container)

        // Create PIXI render texture
        const renderTexture = RenderTexture.create({
            width: normalizedSize.width,
            height: normalizedSize.height,
            resolution: resolvedOptions.resolution,
        })
        this.renderTexture = renderTexture

        // Set up Babylon.js texture properties
        this['hasAlpha'] = true

        // Get WebGL texture from PIXI and wrap it for Babylon.js
        const engine = scene!.getEngine() as Engine
        const webGlSource = (renderer!.texture as GlTextureSystem).getGlSource(renderTexture.source)
        this['_texture'] = engine.wrapWebGLTexture(
            webGlSource.texture,
            false,
            undefined,
            this.renderSize.width,
            this.renderSize.height
        )
        this['_texture'].type = Constants.TEXTURETYPE_UNSIGNED_BYTE

        // Set up automatic updates if requested
        this.setupUpdateBehavior()
    }

    /**
     * Manually synchronize the texture content
     * Call this after modifying the PIXI container content
     *
     * @param clear - Whether to clear the render texture before rendering
     */
    public sync(clear: boolean = true): void {
        if (!this.renderer || !this.scene) {
            console.warn('PixiDynamicTexture: Renderer or scene not available for sync')
            return
        }

        const engine = this.scene.getEngine() as Engine
        const gl = engine._gl

        // Prepare for PIXI rendering
        gl.clearColor(0, 0, 0, 0)
        this.renderer.resetState()

        // Render PIXI content to render texture
        this.renderer.render({
            target: this.renderTexture,
            container: this.rootContainer,
            clear: clear,
        })

        // Clean up WebGL state for Babylon.js
        gl.bindVertexArray(null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }

    /**
     * Asynchronously render the texture content
     * This ensures the texture is ready before the next Babylon.js render frame
     *
     * @returns Promise that resolves when the texture has been updated
     *
     * @example
     * ```typescript
     * // Update PIXI content
     * sprite.x = 100
     * text.text = 'Updated!'
     *
     * // Ensure texture is updated before next frame
     * await dynamicTexture.render()
     * ```
     */
    async render(): Promise<void> {
        return new Promise<void>(resolve => {
            if (this.beforeRenderObservable) {
                this.beforeRenderObservable.addOnce(() => {
                    this.sync(true)
                    resolve()
                })
            }
        })
    }

    /**
     * Updates the auto-update behavior
     *
     * @param autoUpdate - Whether to automatically update the texture each frame
     */
    public setAutoUpdate(autoUpdate: boolean): void {
        if (this.options.autoUpdate === autoUpdate) {
            return
        }

        // Update options
        ;(this.options as any).autoUpdate = autoUpdate

        // Clean up existing observer
        if (this.observer) {
            this.observer.remove()
            this.observer = undefined
        }

        // Set up new observer if needed
        this.setupUpdateBehavior()
    }

    /**
     * Cleans up resources and removes observers
     * Call this when the texture is no longer needed
     */
    dispose(): void {
        super.dispose()

        if (this.observer) {
            this.observer.remove()
        }

        this.renderTexture.destroy(true)
        this.rootContainer.destroy({ children: false }) // Don't destroy user's container
    }

    /**
     * Sets up the update behavior based on options
     */
    private setupUpdateBehavior(): void {
        if (!this.beforeRenderObservable) {
            console.warn(
                'PixiDynamicTexture: beforeRenderObservable not available, auto-update disabled'
            )
            return
        }

        if (this.options.autoUpdate) {
            // Update every frame
            this.observer = this.beforeRenderObservable.add(() => {
                this.sync(true)
            })
        } else {
            // Update once on next frame
            this.observer = this.beforeRenderObservable.addOnce(() => {
                this.sync(true)
            })
        }
    }

    /**
     * Sets the render observable for automatic updates
     * This is typically called by the integration context
     *
     * @param observable - The observable that fires before each render
     * @internal
     */
    static setRenderObservable(observable: any): void {
        this.beforeRenderObservable = observable
    }
}
