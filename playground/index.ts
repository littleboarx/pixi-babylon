import { HemisphericLight, MeshBuilder, StandardMaterial, Texture } from '@babylonjs/core'
import { FreeCamera } from '@babylonjs/core/Cameras/freeCamera'
import { Vector3 } from '@babylonjs/core/Maths/math.vector'
import { Text } from 'pixi.js'

import { PixiTexture, createPixiBabylon } from '../src'

const app = await createPixiBabylon()
const { scene } = app
await import('@babylonjs/inspector')
scene.debugLayer?.show({
    globalRoot: document.body,
    overlay: true,
    // embedMode: true,
})
document.body.appendChild(app.engine._renderingCanvas!)
const hello = new Text('hello!')
const right = new Text({
    text: 'pixi love babylon',
    style: {
        fill: '#f00',
    },
})

app.start()
const camera = new FreeCamera('camera1', new Vector3(0, 5, -10), scene)
// Targets the camera to scene origin
camera.setTarget(Vector3.Zero())
camera.attachControl()
// Creates a light, aiming 0,1,0
const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
// Dim the light a small amount 0 - 1
light.intensity = 0.7
// Built-in 'sphere' shape.
const sphere = MeshBuilder.CreateSphere('sphere', { diameter: 2, segments: 32 }, scene)
// Move sphere upward 1/2 its height
sphere.position.y = 1
// Built-in 'ground' shape.
const ground = MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene)
app.pixiApp.stage.addChild(hello)
const pixiM = new StandardMaterial('pixi')
pixiM.transparencyMode = 2
pixiM.useAlphaFromDiffuseTexture = true
const pixiD = new PixiTexture(right, {
    width: 256,
    height: 256,
})
const texture2 = new Texture(new URL('./FAQ1.png', import.meta.url).href)
pixiM.diffuseTexture = pixiD
ground.material = pixiM
