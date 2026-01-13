# Development Guide

## Quick Start

### Option 1: Using the start script (Recommended)
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual start

**Terminal 1 - Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Project Structure

```
medical-dicom-viewer/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── uploads/             # DICOM file storage (created automatically)
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── Upload.jsx   # File upload component
│   │   │   ├── StudyList.jsx # Studies/series navigation
│   │   │   └── Viewer.jsx   # Main DICOM viewer with Cornerstone
│   │   ├── styles/
│   │   │   └── index.css    # Global styles
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # React entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── README.md
├── DEVELOPMENT.md
└── start-dev.sh
```

## Key Technologies

### Backend
- **FastAPI**: Modern, fast web framework for building APIs
- **pydicom**: Library for working with DICOM files
- **NumPy**: Numerical computing for image processing
- **Uvicorn**: ASGI server for running FastAPI

### Frontend
- **React 18**: UI library
- **Vite**: Fast build tool and dev server
- **Cornerstone.js**: Medical imaging display engine
  - `@cornerstonejs/core`: Core rendering engine
  - `@cornerstonejs/tools`: Interactive tools (zoom, pan, etc.)
  - `@cornerstonejs/dicom-image-loader`: DICOM file loading
- **Axios**: HTTP client for API calls

## API Endpoints

### GET `/`
Health check endpoint

### POST `/upload`
Upload DICOM files
- **Body**: multipart/form-data with `files` field
- **Returns**: Array of upload results with metadata

### GET `/studies`
Get list of all studies
- **Returns**: Array of study objects with patient info

### GET `/studies/{study_uid}/series`
Get all series for a specific study
- **Returns**: Array of series with instances

### GET `/dicom/{file_id}`
Download DICOM file
- **Returns**: DICOM file binary

### GET `/dicom/{file_id}/metadata`
Get DICOM metadata
- **Returns**: JSON object with DICOM tags

### DELETE `/studies/{study_uid}`
Delete all files for a study
- **Returns**: Number of files deleted

## Viewer Controls

### Mouse Controls
- **Left Click + Drag**: Pan (when Pan tool active)
- **Right Click + Drag**: Zoom
- **Middle Click + Drag**: Pan
- **Scroll Wheel**: Navigate through series

### Keyboard Controls
- Can be extended in `Viewer.jsx`

### Toolbar Controls
- **Window Center/Width Sliders**: Adjust image contrast
- **Prev/Next Buttons**: Navigate instances
- **Reset View**: Reset zoom/pan and window settings

## Development Tips

### Adding New Tools
1. Import tool from `@cornerstonejs/tools`
2. Add tool in `useEffect` initialization
3. Configure tool bindings (mouse buttons)
4. Add UI controls in toolbar

### Customizing Window Presets
Add preset buttons for common window/level settings:
```javascript
const presets = {
  lung: { center: -600, width: 1500 },
  abdomen: { center: 40, width: 400 },
  bone: { center: 400, width: 1800 },
}
```

### Adding MPR (Multi-Planar Reconstruction)
The current implementation uses Stack viewports. For MPR:
1. Switch to Volume viewports
2. Load volume data
3. Create 3 viewports (axial, sagittal, coronal)
4. Use Cornerstone3D volume rendering

### Performance Optimization
- Large series (100+ images) work well with current setup
- For very large datasets, consider:
  - Progressive loading
  - Image caching strategies
  - Worker threads for preprocessing

## Testing with Sample Data

### Finding DICOM Test Files
1. **Medical Imaging Repositories**:
   - https://www.dicomcollection.com/
   - https://www.cancerimagingarchive.net/

2. **Creating Test Data**:
   - Use DICOM test datasets from medical imaging research

### Privacy Notes
- Never upload real patient data to development environments
- Use anonymized or synthetic test data only
- This viewer is for demonstration purposes

## Common Issues

### CORS Errors
- Backend has CORS middleware configured for `localhost:5173` and `localhost:3000`
- Add additional origins in `main.py` if needed

### Cornerstone Not Rendering
- Check browser console for errors
- Ensure DICOM files are valid
- Verify image loader is properly configured

### File Upload Fails
- Check file is valid DICOM (.dcm extension)
- Verify backend is running on port 8000
- Check backend logs for errors

## Future Enhancements

- [ ] Multi-planar reconstruction (MPR) views
- [ ] Measurement tools (length, angle, ROI)
- [ ] Annotation support
- [ ] DICOM SR (Structured Report) support
- [ ] User authentication
- [ ] Cloud storage integration
- [ ] Export to PNG/JPEG
- [ ] Print to PDF
- [ ] Hanging protocols
- [ ] Compare studies side-by-side

## Contributing

This is a portfolio project, but suggestions are welcome! Key areas for enhancement:
- Advanced visualization features
- Performance optimizations
- UI/UX improvements
- Additional DICOM tag support
