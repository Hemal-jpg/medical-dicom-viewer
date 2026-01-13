function StudyList({ 
  studies, 
  seriesData,
  selectedStudy, 
  selectedSeries,
  onStudySelect, 
  onSeriesSelect,
  onDeleteStudy 
}) {
  return (
    <div className="studies-section">
      <h3>Studies ({studies.length})</h3>
      
      {studies.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#6b7280', padding: '2rem' }}>
          <p>No studies loaded</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
            Upload DICOM files to get started
          </p>
        </div>
      ) : (
        <div className="study-list">
          {studies.map(study => (
            <div
              key={study.studyInstanceUID}
              className={`study-item ${selectedStudy?.studyInstanceUID === study.studyInstanceUID ? 'active' : ''}`}
              onClick={() => onStudySelect(study)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h4>{study.patientName}</h4>
                <button
                  className="btn btn-danger"
                  style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteStudy(study.studyInstanceUID)
                  }}
                >
                  Delete
                </button>
              </div>
              
              <div className="study-info">
                <span>ID: {study.patientID}</span>
                <span>Date: {study.studyDate}</span>
                <span>Modality: {study.modality}</span>
                {study.studyDescription && (
                  <span>Description: {study.studyDescription}</span>
                )}
              </div>

              {selectedStudy?.studyInstanceUID === study.studyInstanceUID && seriesData.length > 0 && (
                <div className="series-list">
                  <strong style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
                    Series ({seriesData.length})
                  </strong>
                  {seriesData.map(series => (
                    <div
                      key={series.seriesInstanceUID}
                      className={`series-item ${selectedSeries?.seriesInstanceUID === series.seriesInstanceUID ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSeriesSelect(series)
                      }}
                    >
                      <div style={{ fontSize: '0.875rem' }}>
                        <strong>Series {series.seriesNumber}</strong>
                        <div style={{ color: '#9ca3af', marginTop: '0.25rem' }}>
                          {series.seriesDescription}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                          {series.instances.length} images
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default StudyList
