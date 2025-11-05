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
import { createPixiBabylon } from 'pixi-babylon'
import * as PIXI from 'pixi.js'
import { MeshBuilder } from '@babylonjs/core'

// Create integrated application
const app = await createPixiBabylon({
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
### 1. PIXI-based UI layer render
```typescript

```

### 2. Cross-Engine Texture Sharing

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

## 🔧 Advanced Usage
TODO

## 🎮 Examples

### UI Overlay Example

```typescript
import { createPixiBabylon, PixiDynamicTexture } from 'pixi-babylon'
import * as PIXI from 'pixi.js'
import { MeshBuilder, StandardMaterial } from '@babylonjs/core'

const app = await createPixiBabylon()

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

## 🛠️ Development

```bash
# Install dependencies
yarn install

# Build the library
yarn run build

# Run type checking
yarn run typecheck

# Run linting
yarn run lint
```

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
