import dbErrorHandler from "../errors/DatabaseErrorHandler.js"


export function setupUtilities(ipcMain, db){
    
    // Get patient with all related data
    ipcMain.handle('getPatientWithAllData', async (event, patientId) => {
      const patient = db.prepare('SELECT * FROM patients WHERE id = ?').get(patientId)
      
      if (!patient) return null
      
      const medicalRecords = db.prepare(`
        SELECT mr.*, 
               GROUP_CONCAT(t.title) as treatment_titles
        FROM medical_records mr
        LEFT JOIN treatments t ON mr.id = t.medical_record_id
        WHERE mr.patient_id = ?
        GROUP BY mr.id
        ORDER BY mr.created_at DESC
      `).all(patientId)
      
      return {
        ...patient,
        medical_records: medicalRecords
      }
    })
    
    // Search patients
    ipcMain.handle('searchPatients', async (event, searchTerm) => {
      const statement = db.prepare(`
        SELECT * FROM patients 
        WHERE full_name LIKE ? OR dni LIKE ? OR email LIKE ?
        ORDER BY full_name ASC
      `)
      const term = `%${searchTerm}%`
      return statement.all(term, term, term)
    })
}