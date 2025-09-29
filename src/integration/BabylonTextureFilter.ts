import { Filter, GlProgram } from 'pixi.js'

/**
 * Custom PIXI filter for handling Babylon.js texture compatibility
 *
 * This filter addresses two main compatibility issues between PIXI.js and Babylon.js:
 * 1. Coordinate System: PIXI uses Y-down coordinates, Babylon uses Y-up UV coordinates
 * 2. Alpha Premultiplication: PIXI typically uses premultiplied alpha, Babylon expects non-premultiplied
 *
 * The filter applies coordinate flipping and alpha correction to ensure
 * PIXI-rendered content displays correctly when used as a Babylon.js texture.
 */
export class BabylonTextureFilter extends Filter {
    // language=glsl
    private static readonly VERTEX_SHADER = `
        attribute vec2 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat3 projectionMatrix;

        varying vec2 vTextureCoord;

        void main(void) {
            gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
            // Flip Y coordinate for Babylon.js UV space
            vTextureCoord = vec2(aTextureCoord.x, 1.0 - aTextureCoord.y);
        }
    `
    // language=glsl
    private static readonly FRAGMENT_SHADER = `
        precision mediump float;

        varying vec2 vTextureCoord;
        uniform sampler2D uTexture;

        void main(void) {
            vec4 color = texture2D(uTexture, vTextureCoord);

            // Convert from premultiplied alpha to non-premultiplied alpha
            // This ensures proper blending in Babylon.js which expects non-premultiplied alpha
            if (color.a > 0.0) {
                color.rgb /= color.a;
            }

            gl_FragColor = color;
        }
    `

    constructor() {
        super({
            glProgram: new GlProgram({
                vertex: BabylonTextureFilter.VERTEX_SHADER,
                fragment: BabylonTextureFilter.FRAGMENT_SHADER,
            }),
        })
    }
}
