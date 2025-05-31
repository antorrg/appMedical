import dbErrorHandler from "../errors/DatabaseErrorHandler.js"

export function setupMedicalRecordsHandlers(ipcMain, db) {
// Get all medical records
ipcMain.handle('getMedicalRecords', async () => {
    try{
  const statement = db.prepare(`
    SELECT mr.*, p.full_name as patient_name 
    FROM medical_records mr
    LEFT JOIN patients p ON mr.patient_id = p.id
    ORDER BY mr.created_at DESC
  `)
  return statement.all()
   } catch (error) {
      dbErrorHandler.handleDatabaseError(error, 'Get MedicalRecords')
    }
})

// Get medical records by patient
ipcMain.handle('getMedicalRecordsByPatient', async (event, patientId) => {
  const statement = db.prepare(`
    SELECT * FROM medical_records 
    WHERE patient_id = ? 
    ORDER BY created_at DESC
  `)
  return statement.all(patientId)
})

// Get single medical record
ipcMain.handle('getMedicalRecord', async (event, id) => {
  const statement = db.prepare(`
    SELECT mr.*, p.full_name as patient_name 
    FROM medical_records mr
    LEFT JOIN patients p ON mr.patient_id = p.id
    WHERE mr.id = ?
  `)
  return statement.get(id)
})

// Create medical record
ipcMain.handle('createMedicalRecord', async (event, recordData) => {
  const { patient_id, summary } = recordData
  const statement = db.prepare(`
    INSERT INTO medical_records (patient_id, summary)
    VALUES (?, ?)
  `)
  const result = statement.run(patient_id, summary)
  return { id: result.lastInsertRowid, ...recordData }
})

// Update medical record
ipcMain.handle('updateMedicalRecord', async (event, id, recordData) => {
  const { patient_id, summary } = recordData
  const statement = db.prepare(`
    UPDATE medical_records 
    SET patient_id = ?, summary = ?
    WHERE id = ?
  `)
  statement.run(patient_id, summary, id)
  return { id, ...recordData }
})

// Delete medical record
ipcMain.handle('deleteMedicalRecord', async (event, id) => {
  const statement = db.prepare('DELETE FROM medical_records WHERE id = ?')
  const result = statement.run(id)
  return result.changes > 0
})

}