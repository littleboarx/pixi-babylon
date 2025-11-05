import { Engine } from '@babylonjs/core/Engines/engine'
import { HDRFiltering } from '@babylonjs/core/Materials/Textures/Filtering/hdrFiltering'
let fixed = false
export function babylonFix(engine: Engine) {
    if (fixed) {
        return
    }
    fixed = true
    const old = HDRFiltering.prototype['_prefilterInternal']
    HDRFiltering.prototype['_prefilterInternal'] = function (...args) {
        // reset gl state to avoid GL state pollution
        engine.wipeCaches(true)
        old.apply(this, args)
    }
}
