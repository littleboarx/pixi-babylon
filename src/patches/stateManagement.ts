import { Engine } from '@babylonjs/core/Engines/engine'
import { Renderer } from 'pixi.js'

/**
 * Advanced WebGL state management utilities
 *
 * These functions help manage WebGL state transitions between PIXI and Babylon
 * when using custom render loops or integration patterns.
 */

/**
 * WebGL state snapshot for restoration
 */
interface WebGLState {
    viewport: Int32Array
    scissorBox: Int32Array
    clearColor: Float32Array
    blendFunc: { src: number; dst: number; srcAlpha: number; dstAlpha: number }
    depthFunc: number
    stencilFunc: { func: number; ref: number; mask: number }
    activeTexture: number
    boundTextures: (WebGLTexture | null)[]
    boundArrayBuffer: WebGLBuffer | null
    boundElementArrayBuffer: WebGLBuffer | null
    boundFramebuffer: WebGLFramebuffer | null
    boundRenderbuffer: WebGLRenderbuffer | null
}

/**
 * Captures the current WebGL state for later restoration
 *
 * @param gl - WebGL rendering context
 * @returns State snapshot
 *
 * @example
 * ```typescript
 * const gl = engine._gl
 * const state = captureWebGLState(gl)
 *
 * // ... perform custom rendering ...
 *
 * restoreWebGLState(gl, state)
 * ```
 */
export function captureWebGLState(gl: WebGLRenderingContext | WebGL2RenderingContext): WebGLState {
    const boundTextures: (WebGLTexture | null)[] = []
    const activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE) as number
    const maxTextureUnits = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS) as number

    // Capture bound textures for each texture unit
    for (let i = 0; i < Math.min(maxTextureUnits, 8); i++) {
        gl.activeTexture(gl.TEXTURE0 + i)
        boundTextures.push(gl.getParameter(gl.TEXTURE_BINDING_2D) as WebGLTexture | null)
    }
    gl.activeTexture(activeTexture)

    return {
        viewport: gl.getParameter(gl.VIEWPORT) as Int32Array,
        scissorBox: gl.getParameter(gl.SCISSOR_BOX) as Int32Array,
        clearColor: gl.getParameter(gl.COLOR_CLEAR_VALUE) as Float32Array,
        blendFunc: {
            src: gl.getParameter(gl.BLEND_SRC_RGB) as number,
            dst: gl.getParameter(gl.BLEND_DST_RGB) as number,
            srcAlpha: gl.getParameter(gl.BLEND_SRC_ALPHA) as number,
            dstAlpha: gl.getParameter(gl.BLEND_DST_ALPHA) as number,
        },
        depthFunc: gl.getParameter(gl.DEPTH_FUNC) as number,
        stencilFunc: {
            func: gl.getParameter(gl.STENCIL_FUNC) as number,
            ref: gl.getParameter(gl.STENCIL_REF) as number,
            mask: gl.getParameter(gl.STENCIL_VALUE_MASK) as number,
        },
        activeTexture,
        boundTextures,
        boundArrayBuffer: gl.getParameter(gl.ARRAY_BUFFER_BINDING) as WebGLBuffer | null,
        boundElementArrayBuffer: gl.getParameter(
            gl.ELEMENT_ARRAY_BUFFER_BINDING
        ) as WebGLBuffer | null,
        boundFramebuffer: gl.getParameter(gl.FRAMEBUFFER_BINDING) as WebGLFramebuffer | null,
        boundRenderbuffer: gl.getParameter(gl.RENDERBUFFER_BINDING) as WebGLRenderbuffer | null,
    }
}

/**
 * Restores WebGL state from a captured snapshot
 *
 * @param gl - WebGL rendering context
 * @param state - Previously captured state
 */
export function restoreWebGLState(
    gl: WebGLRenderingContext | WebGL2RenderingContext,
    state: WebGLState
): void {
    // Restore viewport and scissor
    gl.viewport(state.viewport[0], state.viewport[1], state.viewport[2], state.viewport[3])
    gl.scissor(state.scissorBox[0], state.scissorBox[1], state.scissorBox[2], state.scissorBox[3])

    // Restore clear color
    gl.clearColor(
        state.clearColor[0],
        state.clearColor[1],
        state.clearColor[2],
        state.clearColor[3]
    )

    // Restore blend function
    gl.blendFuncSeparate(
        state.blendFunc.src,
        state.blendFunc.dst,
        state.blendFunc.srcAlpha,
        state.blendFunc.dstAlpha
    )

    // Restore depth function
    gl.depthFunc(state.depthFunc)

    // Restore stencil function
    gl.stencilFunc(state.stencilFunc.func, state.stencilFunc.ref, state.stencilFunc.mask)

    // Restore bound buffers
    gl.bindBuffer(gl.ARRAY_BUFFER, state.boundArrayBuffer)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, state.boundElementArrayBuffer)

    // Restore bound framebuffer and renderbuffer
    gl.bindFramebuffer(gl.FRAMEBUFFER, state.boundFramebuffer)
    gl.bindRenderbuffer(gl.RENDERBUFFER, state.boundRenderbuffer)

    // Restore bound textures
    for (let i = 0; i < state.boundTextures.length; i++) {
        gl.activeTexture(gl.TEXTURE0 + i)
        gl.bindTexture(gl.TEXTURE_2D, state.boundTextures[i])
    }
    gl.activeTexture(state.activeTexture)
}

/**
 * Safely executes a function with PIXI renderer state management
 * Automatically captures and restores WebGL state around PIXI rendering
 *
 * @param pixiRenderer - PIXI renderer
 * @param babylonEngine - Babylon engine
 * @param renderFunction - Function to execute with PIXI state
 *
 * @example
 * ```typescript
 * withPixiState(pixiApp.renderer, engine, () => {
 *   // This PIXI rendering won't interfere with Babylon state
 *   pixiApp.render()
 * })
 * ```
 */
export function withPixiState(
    pixiRenderer: Renderer,
    babylonEngine: Engine,
    renderFunction: () => void
): void {
    const gl = babylonEngine._gl
    const state = captureWebGLState(gl)

    try {
        pixiRenderer.resetState()
        renderFunction()
        pixiRenderer.resetState()

        // Ensure proper cleanup for Babylon
        gl.bindVertexArray?.(null)
        gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    } finally {
        restoreWebGLState(gl, state)
    }
}

/**
 * Safely executes a function with Babylon engine state management
 * Useful when mixing custom WebGL calls with Babylon rendering
 *
 * @param babylonEngine - Babylon engine
 * @param renderFunction - Function to execute with Babylon state
 *
 * @example
 * ```typescript
 * withBabylonState(engine, () => {
 *   // Custom WebGL calls that won't interfere with PIXI
 *   gl.clear(gl.COLOR_BUFFER_BIT)
 *   scene.render()
 * })
 * ```
 */
export function withBabylonState(babylonEngine: Engine, renderFunction: () => void): void {
    const gl = babylonEngine._gl
    const state = captureWebGLState(gl)

    try {
        babylonEngine.wipeCaches(true)
        renderFunction()
    } finally {
        restoreWebGLState(gl, state)
    }
}

/**
 * Creates a state manager instance for repeated state management operations
 * More efficient than individual calls when doing frequent state switches
 *
 * @param pixiRenderer - PIXI renderer
 * @param babylonEngine - Babylon engine
 * @returns State manager instance
 *
 * @example
 * ```typescript
 * const stateManager = createStateManager(pixiApp.renderer, engine)
 *
 * // In render loop
 * stateManager.saveState()
 * pixiApp.render()
 * stateManager.restoreState()
 * scene.render()
 * ```
 */
export function createStateManager(pixiRenderer: Renderer, babylonEngine: Engine) {
    const gl = babylonEngine._gl
    let savedState: WebGLState | null = null

    return {
        saveState() {
            savedState = captureWebGLState(gl)
        },

        restoreState() {
            if (savedState) {
                restoreWebGLState(gl, savedState)
            }
        },

        withPixiState(renderFunction: () => void) {
            withPixiState(pixiRenderer, babylonEngine, renderFunction)
        },

        withBabylonState(renderFunction: () => void) {
            withBabylonState(babylonEngine, renderFunction)
        },

        reset() {
            savedState = null
        },
    }
}
