import { Filter, GlProgram } from 'pixi.js'
// language=glsl
const VERTEX_SHADER = `
    in vec2 aPosition;
    out vec2 vTextureCoord;

    uniform mediump vec4 uInputSize;
    uniform vec4 uOutputFrame;
    uniform vec4 uOutputTexture;

    vec4 filterVertexPosition( void )
    {
        vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;

        position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
        position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

        return vec4(position, 0.0, 1.0);
    }

    vec2 filterTextureCoord( void )
    {
        // 翻转Y轴：将aPosition.y从[0,1]映射到[1,0]
        vec2 flippedPosition = vec2(aPosition.x, 1.0 - aPosition.y);

        // 如果需要水平翻转，使用下面这行
        // vec2 flippedPosition = vec2(1.0 - aPosition.x, 1.0 - aPosition.y);

        return flippedPosition * (uOutputFrame.zw * uInputSize.zw);
    }

    void main(void)
    {
        gl_Position = filterVertexPosition();
        vTextureCoord = filterTextureCoord();
    }
    `
// language=glsl
const FRAGMENT_SHADER = `
    in vec2 vTextureCoord;

    out vec4 finalColor;

    uniform sampler2D uTexture;
    uniform mediump vec4 uInputSize;

    void main()
    {
        vec4 c = texture(uTexture, vTextureCoord);
        if(c.a == 0.0) {
            finalColor = vec4(0,0,0,0);
        } else {
            finalColor = vec4(c.rgb/ c.a,c.a);
        }
    }
    `

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
    constructor() {
        super({
            glProgram: new GlProgram({
                vertex: VERTEX_SHADER,
                fragment: FRAGMENT_SHADER,
            }),
        })
    }
}
