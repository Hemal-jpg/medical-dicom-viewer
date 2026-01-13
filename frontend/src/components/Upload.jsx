import { useState } from 'react'

function Upload({ onUpload, loading }) {
  const [dragging, setDragging] = useState(false)

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onUpload(files)
    }
  }

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      onUpload(files)
    }
  }

  return (
    <div className="upload-section">
      <div
        className={`upload-box ${dragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".dcm,.dicom"
          onChange={handleFileSelect}
        />
        
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <span>Uploading...</span>
          </div>
        ) : (
          <>
            <div className="upload-icon">📁</div>
            <div>
              <strong>Drop DICOM files here</strong>
              <p>or click to browse</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Upload
