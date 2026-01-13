import { useEffect, useRef, useState } from 'react'
import * as cornerstone from '@cornerstonejs/core'
import * as cornerstoneTools from '@cornerstonejs/tools'
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader'
import dicomParser from 'dicom-parser'

const {
  PanTool,
  ZoomTool,
  StackScrollMouseWheelTool,
  ToolGroupManager,
  Enums: csToolsEnums,
} = cornerstoneTools

const { ViewportType } = cornerstone.Enums

function Viewer({ series }) {
  const viewportRef = useRef(null)
  const [initialized, setInitialized] = useState(false)
  const [currentInstance, setCurrentInstance] = useState(0)
  const [windowLevel, setWindowLevel] = useState({ center: 40, width: 400 })
  const [activeTool, setActiveTool] = useState('StackScrollMouseWheel')
  const renderingEngineRef = useRef(null)
  const toolGroupRef = useRef(null)

  useEffect(() => {
    const initCornerstone = async () => {
      if (initialized) return

      cornerstoneDICOMImageLoader.external.cornerstone = cornerstone
      cornerstoneDICOMImageLoader.external.dicomParser = dicomParser

      cornerstoneDICOMImageLoader.configure({
        useWebWorkers: true,
        decodeConfig: {
          convertFloatPixelDataToInt: false,
        },
      })

      await cornerstone.init()
      cornerstoneTools.init()

      cornerstoneTools.addTool(PanTool)
      cornerstoneTools.addTool(ZoomTool)
      cornerstoneTools.addTool(StackScrollMouseWheelTool)

      setInitialized(true)
    }

    initCornerstone()
  }, [])

  useEffect(() => {
    if (!initialized || !series || !viewportRef.current) return

    const setupViewer = async () => {
      try {
        if (renderingEngineRef.current) {
          renderingEngineRef.current.destroy()
        }

        const renderingEngineId = 'myRenderingEngine'
        const viewportId = 'CT_STACK'

        renderingEngineRef.current = new cornerstone.RenderingEngine(renderingEngineId)

        const viewportInput = {
          viewportId,
          type: ViewportType.STACK,
          element: viewportRef.current,
        }

        renderingEngineRef.current.enableElement(viewportInput)

        const toolGroupId = 'STACK_TOOL_GROUP_ID'
        
        let toolGroup = ToolGroupManager.getToolGroup(toolGroupId)
        if (toolGroup) {
          toolGroup.destroy()
        }

        toolGroup = ToolGroupManager.createToolGroup(toolGroupId)
        toolGroupRef.current = toolGroup

        toolGroup.addTool(PanTool.toolName)
        toolGroup.addTool(ZoomTool.toolName)
        toolGroup.addTool(StackScrollMouseWheelTool.toolName)

        toolGroup.setToolActive(StackScrollMouseWheelTool.toolName)
        toolGroup.setToolActive(PanTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Auxiliary }],
        })
        toolGroup.setToolActive(ZoomTool.toolName, {
          bindings: [{ mouseButton: csToolsEnums.MouseBindings.Secondary }],
        })

        toolGroup.addViewport(viewportId, renderingEngineId)

        const imageIds = series.instances.map(
          (instance) => `wadouri:http://localhost:8000/dicom/${instance.fileId}.dcm`
        )

        const viewport = renderingEngineRef.current.getViewport(viewportId)

        await viewport.setStack(imageIds, 0)

        if (series.instances[0].windowCenter && series.instances[0].windowWidth) {
          setWindowLevel({
            center: series.instances[0].windowCenter,
            width: series.instances[0].windowWidth,
          })
          viewport.setProperties({
            voiRange: {
              lower: series.instances[0].windowCenter - series.instances[0].windowWidth / 2,
              upper: series.instances[0].windowCenter + series.instances[0].windowWidth / 2,
            },
          })
        }

        viewport.render()

        setCurrentInstance(0)
      } catch (error) {
        console.error('Error setting up viewer:', error)
      }
    }

    setupViewer()

    return () => {
      if (renderingEngineRef.current) {
        try {
          renderingEngineRef.current.destroy()
        } catch (e) {
          console.error('Error destroying rendering engine:', e)
        }
      }
    }
  }, [initialized, series])

  const handleWindowCenterChange = (e) => {
    const center = parseFloat(e.target.value)
    setWindowLevel(prev => ({ ...prev, center }))
    applyWindowLevel(center, windowLevel.width)
  }

  const handleWindowWidthChange = (e) => {
    const width = parseFloat(e.target.value)
    setWindowLevel(prev => ({ ...prev, width }))
    applyWindowLevel(windowLevel.center, width)
  }

  const applyWindowLevel = (center, width) => {
    if (!renderingEngineRef.current) return

    const viewport = renderingEngineRef.current.getViewport('CT_STACK')
    if (viewport) {
      viewport.setProperties({
        voiRange: {
          lower: center - width / 2,
          upper: center + width / 2,
        },
      })
      viewport.render()
    }
  }

  const handleInstanceChange = (newIndex) => {
    if (!renderingEngineRef.current || !series) return

    const viewport = renderingEngineRef.current.getViewport('CT_STACK')
    if (viewport) {
      viewport.setImageIdIndex(newIndex)
      viewport.render()
      setCurrentInstance(newIndex)
    }
  }

  const handleReset = () => {
    if (!renderingEngineRef.current) return

    const viewport = renderingEngineRef.current.getViewport('CT_STACK')
    if (viewport) {
      viewport.resetCamera()
      
      if (series?.instances[0].windowCenter && series?.instances[0].windowWidth) {
        const center = series.instances[0].windowCenter
        const width = series.instances[0].windowWidth
        setWindowLevel({ center, width })
        viewport.setProperties({
          voiRange: {
            lower: center - width / 2,
            upper: center + width / 2,
          },
        })
      }
      
      viewport.render()
    }
  }

  if (!series) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🏥</div>
        <h2>No Series Selected</h2>
        <p>Upload DICOM files and select a series to view</p>
      </div>
    )
  }

  return (
    <div className="viewer-container">
      <div className="viewer-toolbar">
        <div className="tool-group">
          <label>Window Center:</label>
          <input
            type="range"
            min="-1024"
            max="3071"
            value={windowLevel.center}
            onChange={handleWindowCenterChange}
          />
          <span style={{ minWidth: '50px', fontSize: '0.875rem' }}>{windowLevel.center.toFixed(0)}</span>
        </div>

        <div className="tool-group">
          <label>Window Width:</label>
          <input
            type="range"
            min="1"
            max="4096"
            value={windowLevel.width}
            onChange={handleWindowWidthChange}
          />
          <span style={{ minWidth: '50px', fontSize: '0.875rem' }}>{windowLevel.width.toFixed(0)}</span>
        </div>

        <div className="tool-group instance-navigation">
          <button
            className="tool-btn"
            onClick={() => handleInstanceChange(Math.max(0, currentInstance - 1))}
            disabled={currentInstance === 0}
          >
            ◀ Prev
          </button>
          <span>
            {currentInstance + 1} / {series.instances.length}
          </span>
          <button
            className="tool-btn"
            onClick={() => handleInstanceChange(Math.min(series.instances.length - 1, currentInstance + 1))}
            disabled={currentInstance === series.instances.length - 1}
          >
            Next ▶
          </button>
        </div>

        <button className="tool-btn" onClick={handleReset}>
          Reset View
        </button>
      </div>

      <div className="viewport-wrapper">
        <div ref={viewportRef} className="viewport"></div>
        
        {series && (
          <div className="viewport-overlay">
            <div><strong>{series.seriesDescription}</strong></div>
            <div>Series: {series.seriesNumber}</div>
            <div>Modality: {series.modality}</div>
            <div>Images: {series.instances.length}</div>
            {series.instances[currentInstance] && (
              <>
                <div>Instance: {series.instances[currentInstance].instanceNumber}</div>
                {series.instances[currentInstance].sliceLocation && (
                  <div>Slice: {series.instances[currentInstance].sliceLocation.toFixed(2)} mm</div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Viewer
