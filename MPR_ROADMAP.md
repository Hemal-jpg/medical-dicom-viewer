# Multi-Planar Reconstruction (MPR) Implementation Roadmap

MPR allows viewing 3D medical imaging data in multiple planes simultaneously (axial, sagittal, coronal).

## Current Status
✅ Stack viewport implementation (single plane navigation)
⏳ MPR views (planned enhancement)

## Implementation Steps

### 1. Switch to Volume Rendering
Currently using Stack viewports. MPR requires Volume viewports:

```javascript
// Current: StackViewport
type: ViewportType.STACK

// MPR: Volume viewports
type: ViewportType.ORTHOGRAPHIC
```

### 2. Create Volume Loader
Load entire series as a volume instead of individual images:

```javascript
import { volumeLoader } from '@cornerstonejs/core'

const volumeId = 'cornerstoneStreamingImageVolume:myVolume'
const volume = await volumeLoader.createAndCacheVolume(volumeId, {
  imageIds: imageIds
})

volume.load()
```

### 3. Create Three Viewports
Set up axial, sagittal, and coronal views:

```javascript
const viewportInputs = [
  {
    viewportId: 'CT_AXIAL',
    type: ViewportType.ORTHOGRAPHIC,
    element: axialElement,
    defaultOptions: {
      orientation: Enums.OrientationAxis.AXIAL,
    },
  },
  {
    viewportId: 'CT_SAGITTAL',
    type: ViewportType.ORTHOGRAPHIC,
    element: sagittalElement,
    defaultOptions: {
      orientation: Enums.OrientationAxis.SAGITTAL,
    },
  },
  {
    viewportId: 'CT_CORONAL',
    type: ViewportType.ORTHOGRAPHIC,
    element: coronalElement,
    defaultOptions: {
      orientation: Enums.OrientationAxis.CORONAL,
    },
  },
]
```

### 4. Update UI Layout
Change from single viewport to 2x2 grid:

```css
.viewport-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  height: 100%;
}

.viewport-cell {
  background: #000;
  position: relative;
}
```

### 5. Synchronize Viewports
Add crosshair synchronization between views:

```javascript
import { synchronizers } from '@cornerstonejs/tools'

const synchronizerId = 'CROSSHAIR_SYNC'
const synchronizer = synchronizers.createSynchronizer(
  synchronizerId,
  'crosshairsSynchronizer',
  [
    { renderingEngineId, viewportId: 'CT_AXIAL' },
    { renderingEngineId, viewportId: 'CT_SAGITTAL' },
    { renderingEngineId, viewportId: 'CT_CORONAL' },
  ]
)
```

### 6. Add Crosshair Tool
Enable interactive plane selection:

```javascript
import { CrosshairsTool } from '@cornerstonejs/tools'

cornerstoneTools.addTool(CrosshairsTool)
toolGroup.addTool(CrosshairsTool.toolName)
toolGroup.setToolActive(CrosshairsTool.toolName, {
  bindings: [{ mouseButton: MouseBindings.Primary }],
})
```

## UI Mockup

```
┌─────────────────────────────────────────┐
│ Toolbar (Window/Level, Tools, etc.)    │
├─────────────────┬───────────────────────┤
│                 │                       │
│  Axial View     │  Sagittal View       │
│  (Top-down)     │  (Side view)         │
│                 │                       │
├─────────────────┼───────────────────────┤
│                 │                       │
│  Coronal View   │  3D Render (optional)│
│  (Front view)   │                       │
│                 │                       │
└─────────────────┴───────────────────────┘
```

## Benefits of MPR

1. **Complete Spatial Understanding**: See anatomy from all angles
2. **Better Lesion Detection**: Identify abnormalities missed in single plane
3. **Surgical Planning**: Essential for pre-operative assessment
4. **Expert Witness Reports**: Provide comprehensive visual evidence

## Resources

- [Cornerstone3D MPR Example](https://www.cornerstonejs.org/live-examples/volumeviewport)
- [OHIF Viewer MPR Implementation](https://github.com/OHIF/Viewers)
- [Medical Imaging MPR Tutorial](https://www.youtube.com/results?search_query=cornerstone+mpr)

## Estimated Effort

- **Basic MPR**: 4-6 hours
- **With Crosshairs**: 6-8 hours
- **Full Synchronization**: 8-10 hours
- **3D Rendering**: 10-15 hours (optional)

## Priority

MPR is a "nice-to-have" for portfolio purposes. The current single-plane viewer is fully functional and demonstrates:
- ✅ DICOM parsing and rendering
- ✅ Full-stack development
- ✅ Medical imaging expertise
- ✅ Professional UI/UX

MPR can be added as a future enhancement to further impress potential employers/clients.
