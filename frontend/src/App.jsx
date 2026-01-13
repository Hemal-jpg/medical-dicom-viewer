import { useState, useEffect } from 'react'
import Upload from './components/Upload'
import StudyList from './components/StudyList'
import Viewer from './components/Viewer'
import axios from 'axios'

const API_BASE = '/api'

function App() {
  const [studies, setStudies] = useState([])
  const [selectedStudy, setSelectedStudy] = useState(null)
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [seriesData, setSeriesData] = useState([])
  const [loading, setLoading] = useState(false)

  const loadStudies = async () => {
    try {
      const response = await axios.get(`${API_BASE}/studies`)
      setStudies(response.data.studies)
    } catch (error) {
      console.error('Error loading studies:', error)
    }
  }

  useEffect(() => {
    loadStudies()
  }, [])

  const handleUpload = async (files) => {
    const formData = new FormData()
    Array.from(files).forEach(file => {
      formData.append('files', file)
    })

    try {
      setLoading(true)
      await axios.post(`${API_BASE}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      await loadStudies()
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStudySelect = async (study) => {
    setSelectedStudy(study)
    setSelectedSeries(null)
    
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE}/studies/${study.studyInstanceUID}/series`)
      setSeriesData(response.data.series)
      
      if (response.data.series.length > 0) {
        setSelectedSeries(response.data.series[0])
      }
    } catch (error) {
      console.error('Error loading series:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSeriesSelect = (series) => {
    setSelectedSeries(series)
  }

  const handleDeleteStudy = async (studyUID) => {
    if (!confirm('Are you sure you want to delete this study?')) {
      return
    }

    try {
      await axios.delete(`${API_BASE}/studies/${studyUID}`)
      await loadStudies()
      if (selectedStudy?.studyInstanceUID === studyUID) {
        setSelectedStudy(null)
        setSelectedSeries(null)
        setSeriesData([])
      }
    } catch (error) {
      console.error('Error deleting study:', error)
      alert('Error deleting study. Please try again.')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Medical DICOM Viewer</h1>
        <p>Professional medical imaging viewer for legal and medical professionals</p>
      </header>
      
      <main className="main">
        <aside className="sidebar">
          <Upload onUpload={handleUpload} loading={loading} />
          
          <StudyList
            studies={studies}
            seriesData={seriesData}
            selectedStudy={selectedStudy}
            selectedSeries={selectedSeries}
            onStudySelect={handleStudySelect}
            onSeriesSelect={handleSeriesSelect}
            onDeleteStudy={handleDeleteStudy}
          />
        </aside>
        
        <div className="content">
          <Viewer series={selectedSeries} />
        </div>
      </main>
    </div>
  )
}

export default App
