/**
 * Advanced patch methods for users who understand the fundamentals
 *
 * These methods provide fine-grained control over PIXI-Babylon integration
 * and are intended for users who need to customize the rendering pipeline
 * beyond the out-of-box solutions.
 *
 * Usage requires understanding of:
 * - WebGL state management
 * - PIXI.js renderer internals
 * - Babylon.js engine lifecycle
 * - Render loop coordination
 */

export * from './renderLoop.js'
export * from './stateManagement.js'
export * from './contextSharing.js'
