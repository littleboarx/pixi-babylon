import { Scene, Engine } from '@babylonjs/core'
import { Application, ApplicationOptions } from 'pixi.js'

/**
 * Configuration options for PIXI application
 */
/**
 * Configuration options for Babylon scene
 */

/**
 * Combined application instance containing both PIXI and Babylon
 */
export interface PixiBabylonApp {
    /** PIXI Application instance */
    pixi: Application
    /** Babylon Scene instance */
    babylonScene: Scene
    /** Babylon Engine instance */
    babylonEngine: Engine
}

/**
 * Options for render loop configuration
 */

/**
 * Dynamic texture options for PIXI-to-Babylon texture sharing
 */
export interface DynamicTextureOptions {
    /** Whether to automatically update the texture */
    autoUpdate?: boolean
    /** Name identifier for the texture */
    name?: string
    /** Resolution multiplier for the render texture */
    resolution?: number
}
