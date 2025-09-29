import { Scene } from '@babylonjs/core/scene'
import { Application } from 'pixi.js'

/**
 * Advanced context sharing utilities
 *
 * These functions help set up and manage shared context between PIXI and Babylon
 * applications, enabling advanced integration scenarios.
 */

/**
 * Global context for PIXI-Babylon integration
 * Advanced users can access this for custom integrations
 */
interface GlobalContext {
    scene: Scene | null
    pixiApp: Application | null
    initialized: boolean
}

const globalContext: GlobalContext = {
    scene: null,
    pixiApp: null,
    initialized: false,
}

/**
 * Sets up shared context between PIXI and Babylon applications
 * This enables advanced features like PixiDynamicTexture to work without
 * explicit scene/renderer parameters
 *
 * @param scene - Babylon.js scene
 * @param pixiApp - PIXI application
 *
 * @example
 * ```typescript
 * const scene = new Scene(engine)
 * const pixiApp = new Application()
 * await pixiApp.init()
 *
 * // Set up shared context
 * setupSharedContext(scene, pixiApp)
 *
 * // Now PixiDynamicTexture can be used without explicit parameters
 * const texture = new PixiDynamicTexture(container, { width: 256, height: 256 })
 * ```
 */
export function setupSharedContext(scene: Scene, pixiApp: Application): void {
    globalContext.scene = scene
    globalContext.pixiApp = pixiApp
    globalContext.initialized = true

    console.log('PIXI-Babylon shared context initialized')
}

/**
 * Gets the current shared context
 * Throws an error if context hasn't been set up
 *
 * @returns The shared context
 * @throws Error if context is not initialized
 */
export function getSharedContext(): Required<Omit<GlobalContext, 'initialized'>> {
    if (!globalContext.initialized || !globalContext.scene || !globalContext.pixiApp) {
        throw new Error(
            'PIXI-Babylon shared context not initialized. Call setupSharedContext() first or provide scene/pixiApp explicitly.'
        )
    }

    return {
        scene: globalContext.scene,
        pixiApp: globalContext.pixiApp,
    }
}

/**
 * Clears the shared context
 * Useful when switching between different scene/app combinations
 */
export function clearSharedContext(): void {
    globalContext.scene = null
    globalContext.pixiApp = null
    globalContext.initialized = false
}

/**
 * Checks if shared context is available
 *
 * @returns true if context is initialized and available
 */
export function hasSharedContext(): boolean {
    return globalContext.initialized && !!globalContext.scene && !!globalContext.pixiApp
}

/**
 * Advanced context manager for multiple scene/app combinations
 * Allows managing multiple contexts with named identifiers
 */
export class ContextManager {
    private contexts = new Map<string, { scene: Scene; pixiApp: Application }>()
    private activeContext: string | null = null

    /**
     * Registers a new context with a given name
     *
     * @param name - Context identifier
     * @param scene - Babylon scene
     * @param pixiApp - PIXI application
     */
    register(name: string, scene: Scene, pixiApp: Application): void {
        this.contexts.set(name, { scene, pixiApp })
    }

    /**
     * Switches to a named context
     *
     * @param name - Context identifier
     * @throws Error if context doesn't exist
     */
    switchTo(name: string): void {
        const context = this.contexts.get(name)
        if (!context) {
            throw new Error(`Context '${name}' not found`)
        }

        setupSharedContext(context.scene, context.pixiApp)
        this.activeContext = name
    }

    /**
     * Gets the currently active context name
     *
     * @returns Active context name or null if none active
     */
    getActive(): string | null {
        return this.activeContext
    }

    /**
     * Lists all registered context names
     *
     * @returns Array of context names
     */
    list(): string[] {
        return Array.from(this.contexts.keys())
    }

    /**
     * Removes a context
     *
     * @param name - Context identifier
     */
    unregister(name: string): void {
        this.contexts.delete(name)
        if (this.activeContext === name) {
            clearSharedContext()
            this.activeContext = null
        }
    }

    /**
     * Clears all contexts
     */
    clear(): void {
        this.contexts.clear()
        clearSharedContext()
        this.activeContext = null
    }
}

/**
 * Creates a new context manager instance
 *
 * @returns New context manager
 *
 * @example
 * ```typescript
 * const manager = createContextManager()
 *
 * manager.register('game', gameScene, gamePixiApp)
 * manager.register('ui', uiScene, uiPixiApp)
 *
 * // Switch contexts as needed
 * manager.switchTo('game')
 * // ... work with game context ...
 *
 * manager.switchTo('ui')
 * // ... work with UI context ...
 * ```
 */
export function createContextManager(): ContextManager {
    return new ContextManager()
}
