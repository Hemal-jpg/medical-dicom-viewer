# Medical DICOM Viewer

A professional DICOM (Digital Imaging and Communications in Medicine) viewer designed for legal and medical professionals to review medical imaging studies.

## Features

- 📁 **DICOM File Upload** - Support for single and batch DICOM file uploads
- 🖼️ **Advanced Viewer** - Powered by Cornerstone.js for high-performance medical image rendering
- 🎚️ **Window/Level Adjustment** - Customize image contrast and brightness
- 🔄 **Series Navigation** - Browse through multi-image series seamlessly
- 📐 **Multi-Planar Reconstruction (MPR)** - View axial, sagittal, and coronal planes
- ⚡ **Fast Performance** - Optimized for large medical imaging datasets
- 🎯 **Professional UI** - Clean, intuitive interface for expert witness workflows

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **pydicom** - DICOM file parsing and manipulation
- **NumPy** - Numerical operations for image processing

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Cornerstone.js** - Medical imaging display library
- **Cornerstone Tools** - Interactive tools for image manipulation

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Start both backend and frontend servers
2. Open your browser to `http://localhost:5173`
3. Upload DICOM files using the upload interface
4. Use the viewer controls to adjust window/level, zoom, and pan
5. Navigate through series using keyboard arrows or navigation controls

## Use Cases

- **Expert Witness Review** - Analyze medical imaging for legal proceedings
- **Medical Consultations** - Review imaging studies remotely
- **Educational Purposes** - Teaching and training with medical images
- **Research** - Analysis of medical imaging datasets

## License

MIT License

## Author

Built for portfolio demonstration of full-stack development capabilities with medical imaging technologies.
