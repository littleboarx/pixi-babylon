# PIXI-Babylon Integration Library

A powerful library that provides out-of-box integration between PIXI.js 2D graphics and Babylon.js 3D rendering, with unified render loops and cross-engine texture sharing.

## ✨ Features

- **🚀 Out-of-box Solutions**: Quick setup for PIXI + Babylon applications
- **🔄 Unified Render Loop**: Seamlessly coordinate PIXI 2D and Babylon 3D rendering
- **🎨 Cross-Engine Textures**: Render PIXI content as Babylon textures
- **⚡ Performance Optimized**: Efficient WebGL state management
- **🔧 Advanced Patches**: Fine-grained control for expert users
- **📚 TypeScript Support**: Full type definitions included

## 📦 Installation

```bash
npm install pixi-babylon pixi.js @babylonjs/core
# or
yarn add pixi-babylon pixi.js @babylonjs/core
```

## 🚀 Quick Start

### Basic Usage

```typescript
import { quickStart } from 'pixi-babylon'
import * as PIXI from 'pixi.js'
import { MeshBuilder } from '@babylonjs/core'

// Create integrated application
const app = await quickStart({
  canvas: '#game-canvas',
  width: 1024,
  height: 768,
  backgroundColor: 0x1099bb
})

// Add PIXI 2D content
const sprite = new PIXI.Sprite(PIXI.Texture.WHITE)
sprite.tint = 0xff0000
sprite.width = sprite.height = 50
app.pixi.stage.addChild(sprite)

// Add Babylon 3D content
const box = MeshBuilder.CreateBox('box', { size: 2 }, app.babylonScene)
box.position.y = 1
```

### Manual Setup

```typescript
import { PixiBabylonApplication } from 'pixi-babylon'

const app = await PixiBabylonApplication.create({
  pixi: {
    width: 800,
    height: 600,
    antialias: true,
    backgroundColor: 0x2c3e50
  },
  babylon: {
    canvas: '#babylon-canvas',
    engineOptions: { antialias: true }
  }
})

// Start the integrated render loop
app.start()
```

## 🎯 Core Features

### 1. PIXI Application Creation

```typescript
import { createPixiApp } from 'pixi-babylon'

// Basic PIXI app
const app = await createPixiApp({
  width: 800,
  height: 600,
  backgroundColor: 0x1099bb,
  antialias: true
})

// With custom canvas
const app2 = await createPixiApp({
  canvas: '#my-canvas',
  width: 1024,
  height: 768
})
```

### 2. Babylon Scene Creation

```typescript
import { createBabylonScene } from 'pixi-babylon'

// Basic scene with default camera and lighting
const { engine, scene, camera, light } = await createBabylonScene({
  canvas: '#babylon-canvas',
  autoStart: true
})

// Minimal scene for advanced users
import { createMinimalBabylonScene } from 'pixi-babylon'
const { engine, scene } = createMinimalBabylonScene(canvas)
// Add your own camera and lighting...
```

### 3. Cross-Engine Texture Sharing

Convert PIXI containers to Babylon textures:

```typescript
import { PixiDynamicTexture } from 'pixi-babylon'
import * as PIXI from 'pixi.js'
import { StandardMaterial } from '@babylonjs/core'

// Create PIXI content
const container = new PIXI.Container()
const graphics = new PIXI.Graphics()
graphics.circle(0, 0, 50).fill(0xff0000)
container.addChild(graphics)

// Convert to Babylon texture
const dynamicTexture = new PixiDynamicTexture(container, { width: 512, height: 512 }, {
  autoUpdate: true,  // Update every frame
  name: 'ui-overlay'
})

// Use in Babylon material
const material = new StandardMaterial('material', scene)
material.diffuseTexture = dynamicTexture

// Apply to mesh
const plane = MeshBuilder.CreatePlane('plane', { size: 4 }, scene)
plane.material = material
```

### 4. Render Loop Control

```typescript
const app = await PixiBabylonApplication.create(config)

// Control render loop
app.start()  // Start rendering
app.stop()   // Stop rendering
app.destroy() // Clean up resources

// Listen to render events
app.beforeRenderObservable.add(() => {
  // Code that runs before each frame
})

app.afterRenderObservable.add(() => {
  // Code that runs after each frame
})
```

## 🔧 Advanced Usage

### Custom Render Loops

For users who need fine control over the rendering process:

```typescript
import { patches } from 'pixi-babylon'

const stopRenderLoop = patches.createCustomRenderLoop(scene, pixiApp, {
  clearStencil: true,
  pixiRenderOrder: 'before', // Render PIXI before Babylon
  clearColor: { r: 0.1, g: 0.1, b: 0.2, a: 1.0 }
})

// Later, stop the custom loop
stopRenderLoop()
```

### WebGL State Management

Handle WebGL state transitions between engines:

```typescript
import { patches } from 'pixi-babylon'

// Capture and restore WebGL state
const gl = engine._gl
const state = patches.captureWebGLState(gl)

// ... perform custom rendering ...

patches.restoreWebGLState(gl, state)

// Or use convenience functions
patches.withPixiState(pixiRenderer, engine, () => {
  // PIXI rendering with automatic state management
  pixiApp.render()
})
```

### Context Sharing

Set up shared context for advanced integrations:

```typescript
import { patches } from 'pixi-babylon'

// Set up global context
patches.setupSharedContext(scene, pixiApp)

// Now PixiDynamicTexture works without explicit parameters
const texture = new PixiDynamicTexture(container, { width: 256, height: 256 })

// Multiple contexts
const manager = patches.createContextManager()
manager.register('game', gameScene, gamePixiApp)
manager.register('ui', uiScene, uiPixiApp)
manager.switchTo('game')
```

## 📚 API Reference

### Core Classes

#### `PixiBabylonApplication`

Main integration class that manages both PIXI and Babylon rendering.

```typescript
class PixiBabylonApplication {
  static create(config?, renderOptions?): Promise<PixiBabylonApplication>

  pixi: Application
  babylonScene: Scene
  babylonEngine: Engine

  start(): void
  stop(): void
  destroy(): void
  updateRenderOptions(options): void

  beforeRenderObservable: Observable<void>
  afterRenderObservable: Observable<void>
}
```

#### `PixiDynamicTexture`

Converts PIXI containers to Babylon textures.

```typescript
class PixiDynamicTexture extends RawTexture {
  constructor(container, size?, options?, scene?, renderer?)

  sync(clear?): void
  render(): Promise<void>
  setAutoUpdate(autoUpdate): void
  dispose(): void
}
```

### Configuration Types

```typescript
interface PixiAppConfig extends ApplicationOptions {
  canvas?: HTMLCanvasElement | string
  autoStart?: boolean
  backgroundColor?: number | string
}

interface BabylonSceneConfig {
  canvas?: HTMLCanvasElement | string
  engineOptions?: any
  sceneOptions?: any
  autoStart?: boolean
}

interface DynamicTextureOptions {
  autoUpdate?: boolean
  name?: string
  resolution?: number
}
```

## 🎮 Examples

### UI Overlay Example

```typescript
import { quickStart, PixiDynamicTexture } from 'pixi-babylon'
import * as PIXI from 'pixi.js'
import { MeshBuilder, StandardMaterial } from '@babylonjs/core'

const app = await quickStart()

// Create UI container
const uiContainer = new PIXI.Container()
const healthBar = new PIXI.Graphics()
healthBar.rect(0, 0, 200, 20).fill(0x00ff00)
uiContainer.addChild(healthBar)

// Convert to texture
const uiTexture = new PixiDynamicTexture(uiContainer, { width: 512, height: 128 }, {
  autoUpdate: true
})

// Apply to 3D plane
const hudPlane = MeshBuilder.CreatePlane('hud', { width: 4, height: 1 }, app.babylonScene)
hudPlane.position.y = 3
hudPlane.position.z = 5

const hudMaterial = new StandardMaterial('hudMaterial', app.babylonScene)
hudMaterial.diffuseTexture = uiTexture
hudMaterial.hasAlpha = true
hudPlane.material = hudMaterial

// Update health bar
setInterval(() => {
  healthBar.width = Math.random() * 200
}, 1000)
```

### Particle System Integration

```typescript
import { PixiBabylonApplication } from 'pixi-babylon'
import * as PIXI from 'pixi.js'

const app = await PixiBabylonApplication.create()

// PIXI particle emitter
const emitter = new PIXI.ParticleContainer(1000, {
  position: true,
  rotation: true,
  uvs: true,
  alpha: true
})
app.pixi.stage.addChild(emitter)

// 3D scene objects
const boxes = []
for (let i = 0; i < 10; i++) {
  const box = MeshBuilder.CreateBox(`box${i}`, { size: 1 }, app.babylonScene)
  box.position.x = (Math.random() - 0.5) * 10
  boxes.push(box)
}

app.start()
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

- 📚 Check the examples in `/examples` directory
- 🐛 Report issues on GitHub
- 💬 Join our Discord community

---

Made with ❤️ for the WebGL community
