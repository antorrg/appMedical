import dbErrorHandler from "../errors/DatabaseErrorHandler.js"

export function setupTreatmentsHandler(ipcMain, db){
// Get all treatments
ipcMain.handle('getTreatments', async () => {
  const statement = db.prepare(`
    SELECT t.*, 
           mr.summary as medical_record_summary,
           p.full_name as patient_name,
           m.name as medication_name,
           pr.name as praxis_name
    FROM treatments t
    LEFT JOIN medical_records mr ON t.medical_record_id = mr.id
    LEFT JOIN patients p ON mr.patient_id = p.id
    LEFT JOIN medications m ON t.medication_id = m.id
    LEFT JOIN praxes pr ON t.praxis_id = pr.id
    ORDER BY t.created_at DESC
  `)
  return statement.all()
})

// Get treatments by medical record
ipcMain.handle('getTreatmentsByMedicalRecord', async (event, medicalRecordId) => {
  const statement = db.prepare(`
    SELECT t.*, 
           m.name as medication_name,
           pr.name as praxis_name
    FROM treatments t
    LEFT JOIN medications m ON t.medication_id = m.id
    LEFT JOIN praxes pr ON t.praxis_id = pr.id
    WHERE t.medical_record_id = ?
    ORDER BY t.created_at DESC
  `)
  return statement.all(medicalRecordId)
})

// Get single treatment
ipcMain.handle('getTreatment', async (event, id) => {
  const statement = db.prepare(`
    SELECT t.*, 
           mr.summary as medical_record_summary,
           p.full_name as patient_name,
           m.name as medication_name, m.description as medication_description, m.dosage as medication_dosage,
           pr.name as praxis_name, pr.description as praxis_description, pr.instructions as praxis_instructions
    FROM treatments t
    LEFT JOIN medical_records mr ON t.medical_record_id = mr.id
    LEFT JOIN patients p ON mr.patient_id = p.id
    LEFT JOIN medications m ON t.medication_id = m.id
    LEFT JOIN praxes pr ON t.praxis_id = pr.id
    WHERE t.id = ?
  `)
  return statement.get(id)
})

// Create treatment
ipcMain.handle('createTreatment', async (event, treatmentData) => {
  const { medical_record_id, title, notes, medication_id, praxis_id } = treatmentData
  const statement = db.prepare(`
    INSERT INTO treatments (medical_record_id, title, notes, medication_id, praxis_id)
    VALUES (?, ?, ?, ?, ?)
  `)
  const result = statement.run(medical_record_id, title, notes, medication_id, praxis_id)
  return { id: result.lastInsertRowid, ...treatmentData }
})

// Update treatment
ipcMain.handle('updateTreatment', async (event, id, treatmentData) => {
  const { medical_record_id, title, notes, medication_id, praxis_id } = treatmentData
  const statement = db.prepare(`
    UPDATE treatments 
    SET medical_record_id = ?, title = ?, notes = ?, medication_id = ?, praxis_id = ?
    WHERE id = ?
  `)
  statement.run(medical_record_id, title, notes, medication_id, praxis_id, id)
  return { id, ...treatmentData }
})

// Delete treatment
ipcMain.handle('deleteTreatment', async (event, id) => {
  const statement = db.prepare('DELETE FROM treatments WHERE id = ?')
  const result = statement.run(id)
  return result.changes > 0
})

}