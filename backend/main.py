from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
import pydicom
from pydicom.errors import InvalidDicomError
import os
import json
from pathlib import Path
import shutil
from typing import List
import hashlib

app = FastAPI(title="Medical DICOM Viewer API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

def get_file_hash(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()

def extract_dicom_metadata(dcm):
    """Extract relevant metadata from DICOM file"""
    metadata = {
        "patientName": str(getattr(dcm, "PatientName", "Unknown")),
        "patientID": str(getattr(dcm, "PatientID", "Unknown")),
        "studyDate": str(getattr(dcm, "StudyDate", "Unknown")),
        "studyDescription": str(getattr(dcm, "StudyDescription", "Unknown")),
        "seriesDescription": str(getattr(dcm, "SeriesDescription", "Unknown")),
        "seriesNumber": int(getattr(dcm, "SeriesNumber", 0)),
        "instanceNumber": int(getattr(dcm, "InstanceNumber", 0)),
        "modality": str(getattr(dcm, "Modality", "Unknown")),
        "studyInstanceUID": str(getattr(dcm, "StudyInstanceUID", "")),
        "seriesInstanceUID": str(getattr(dcm, "SeriesInstanceUID", "")),
        "sopInstanceUID": str(getattr(dcm, "SOPInstanceUID", "")),
        "rows": int(getattr(dcm, "Rows", 0)),
        "columns": int(getattr(dcm, "Columns", 0)),
        "windowCenter": float(getattr(dcm, "WindowCenter", 0)) if hasattr(dcm, "WindowCenter") else None,
        "windowWidth": float(getattr(dcm, "WindowWidth", 0)) if hasattr(dcm, "WindowWidth") else None,
    }
    
    if hasattr(dcm, "SliceLocation"):
        metadata["sliceLocation"] = float(dcm.SliceLocation)
    
    if hasattr(dcm, "ImagePositionPatient"):
        metadata["imagePosition"] = [float(x) for x in dcm.ImagePositionPatient]
    
    if hasattr(dcm, "ImageOrientationPatient"):
        metadata["imageOrientation"] = [float(x) for x in dcm.ImageOrientationPatient]
    
    return metadata

@app.get("/")
async def root():
    return {"message": "Medical DICOM Viewer API", "status": "running"}

@app.post("/upload")
async def upload_dicom(files: List[UploadFile] = File(...)):
    """Upload one or more DICOM files"""
    results = []
    
    for file in files:
        try:
            content = await file.read()
            file_hash = get_file_hash(content)
            
            file_path = UPLOAD_DIR / f"{file_hash}.dcm"
            
            if file_path.exists():
                dcm = pydicom.dcmread(file_path)
                metadata = extract_dicom_metadata(dcm)
                results.append({
                    "filename": file.filename,
                    "fileId": file_hash,
                    "status": "already_exists",
                    "metadata": metadata
                })
                continue
            
            with open(file_path, "wb") as f:
                f.write(content)
            
            dcm = pydicom.dcmread(file_path)
            metadata = extract_dicom_metadata(dcm)
            
            results.append({
                "filename": file.filename,
                "fileId": file_hash,
                "status": "uploaded",
                "metadata": metadata
            })
            
        except InvalidDicomError:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": "Invalid DICOM file"
            })
        except Exception as e:
            results.append({
                "filename": file.filename,
                "status": "error",
                "error": str(e)
            })
    
    return {"results": results}

@app.get("/studies")
async def get_studies():
    """Get list of all studies"""
    studies = {}
    
    for file_path in UPLOAD_DIR.glob("*.dcm"):
        try:
            dcm = pydicom.dcmread(file_path)
            study_uid = str(getattr(dcm, "StudyInstanceUID", ""))
            
            if not study_uid:
                continue
            
            if study_uid not in studies:
                studies[study_uid] = {
                    "studyInstanceUID": study_uid,
                    "patientName": str(getattr(dcm, "PatientName", "Unknown")),
                    "patientID": str(getattr(dcm, "PatientID", "Unknown")),
                    "studyDate": str(getattr(dcm, "StudyDate", "Unknown")),
                    "studyDescription": str(getattr(dcm, "StudyDescription", "Unknown")),
                    "modality": str(getattr(dcm, "Modality", "Unknown")),
                    "seriesCount": 0,
                    "instanceCount": 0
                }
            
            studies[study_uid]["instanceCount"] += 1
            
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            continue
    
    return {"studies": list(studies.values())}

@app.get("/studies/{study_uid}/series")
async def get_series(study_uid: str):
    """Get all series for a specific study"""
    series_dict = {}
    
    for file_path in UPLOAD_DIR.glob("*.dcm"):
        try:
            dcm = pydicom.dcmread(file_path)
            
            if str(getattr(dcm, "StudyInstanceUID", "")) != study_uid:
                continue
            
            series_uid = str(getattr(dcm, "SeriesInstanceUID", ""))
            if not series_uid:
                continue
            
            if series_uid not in series_dict:
                series_dict[series_uid] = {
                    "seriesInstanceUID": series_uid,
                    "seriesNumber": int(getattr(dcm, "SeriesNumber", 0)),
                    "seriesDescription": str(getattr(dcm, "SeriesDescription", "Unknown")),
                    "modality": str(getattr(dcm, "Modality", "Unknown")),
                    "instances": []
                }
            
            metadata = extract_dicom_metadata(dcm)
            metadata["fileId"] = file_path.stem
            
            series_dict[series_uid]["instances"].append(metadata)
            
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            continue
    
    for series in series_dict.values():
        series["instances"].sort(key=lambda x: x.get("instanceNumber", 0))
    
    return {"series": list(series_dict.values())}

@app.get("/dicom/{file_id}")
async def get_dicom_file(file_id: str):
    """Serve DICOM file"""
    file_path = UPLOAD_DIR / f"{file_id}.dcm"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        file_path,
        media_type="application/dicom",
        headers={"Content-Disposition": f"attachment; filename={file_id}.dcm"}
    )

@app.get("/dicom/{file_id}/metadata")
async def get_dicom_metadata(file_id: str):
    """Get DICOM metadata"""
    file_path = UPLOAD_DIR / f"{file_id}.dcm"
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        dcm = pydicom.dcmread(file_path)
        metadata = extract_dicom_metadata(dcm)
        return metadata
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/studies/{study_uid}")
async def delete_study(study_uid: str):
    """Delete all files for a specific study"""
    deleted_count = 0
    
    for file_path in UPLOAD_DIR.glob("*.dcm"):
        try:
            dcm = pydicom.dcmread(file_path)
            if str(getattr(dcm, "StudyInstanceUID", "")) == study_uid:
                file_path.unlink()
                deleted_count += 1
        except Exception as e:
            print(f"Error deleting {file_path}: {e}")
            continue
    
    return {"deleted": deleted_count}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
