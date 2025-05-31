import {ipcMain }from 'electron'
import {db} from '../main.js'
// ============== PATIENTS CRUD ==============

// Get all patients
ipcMain.handle('getPatients', async () => {
  const statement = db.prepare('SELECT * FROM patients ORDER BY created_at DESC')
  return statement.all()
})

// Get single patient
ipcMain.handle('getPatient', async (event, id) => {
  const statement = db.prepare('SELECT * FROM patients WHERE id = ?')
  return statement.get(id)
})

// Create patient
ipcMain.handle('createPatient', async (event, patientData) => {
  const { full_name, dni, age, email, address, phone, development_notes } = patientData
  const statement = db.prepare(`
    INSERT INTO patients (full_name, dni, age, email, address, phone, development_notes, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `)
  const result = statement.run(full_name, dni, age, email, address, phone, development_notes)
  return { id: result.lastInsertRowid, ...patientData }
})

// Update patient
ipcMain.handle('updatePatient', async (event, id, patientData) => {
  const { full_name, dni, age, email, address, phone, development_notes } = patientData
  const statement = db.prepare(`
    UPDATE patients 
    SET full_name = ?, dni = ?, age = ?, email = ?, address = ?, phone = ?, 
        development_notes = ?, updated_at = datetime('now')
    WHERE id = ?
  `)
  statement.run(full_name, dni, age, email, address, phone, development_notes, id)
  return { id, ...patientData }
})

// Delete patient
ipcMain.handle('deletePatient', async (event, id) => {
  const statement = db.prepare('DELETE FROM patients WHERE id = ?')
  const result = statement.run(id)
  return result.changes > 0
})

// ============== MEDICAL RECORDS CRUD ==============

// Get all medical records
ipcMain.handle('getMedicalRecords', async () => {
  const statement = db.prepare(`
    SELECT mr.*, p.full_name as patient_name 
    FROM medical_records mr
    LEFT JOIN patients p ON mr.patient_id = p.id
    ORDER BY mr.created_at DESC
  `)
  return statement.all()
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

// ============== MEDICATIONS CRUD ==============

// Get all medications
ipcMain.handle('getMedications', async () => {
  const statement = db.prepare('SELECT * FROM medications ORDER BY name ASC')
  return statement.all()
})

// Get single medication
ipcMain.handle('getMedication', async (event, id) => {
  const statement = db.prepare('SELECT * FROM medications WHERE id = ?')
  return statement.get(id)
})

// Create medication
ipcMain.handle('createMedication', async (event, medicationData) => {
  const { name, description, dosage } = medicationData
  const statement = db.prepare(`
    INSERT INTO medications (name, description, dosage)
    VALUES (?, ?, ?)
  `)
  const result = statement.run(name, description, dosage)
  return { id: result.lastInsertRowid, ...medicationData }
})

// Update medication
ipcMain.handle('updateMedication', async (event, id, medicationData) => {
  const { name, description, dosage } = medicationData
  const statement = db.prepare(`
    UPDATE medications 
    SET name = ?, description = ?, dosage = ?
    WHERE id = ?
  `)
  statement.run(name, description, dosage, id)
  return { id, ...medicationData }
})

// Delete medication
ipcMain.handle('deleteMedication', async (event, id) => {
  const statement = db.prepare('DELETE FROM medications WHERE id = ?')
  const result = statement.run(id)
  return result.changes > 0
})

// ============== PRAXES CRUD ==============

// Get all praxes
ipcMain.handle('getPraxes', async () => {
  const statement = db.prepare('SELECT * FROM praxes ORDER BY name ASC')
  return statement.all()
})

// Get single praxis
ipcMain.handle('getPraxis', async (event, id) => {
  const statement = db.prepare('SELECT * FROM praxes WHERE id = ?')
  return statement.get(id)
})

// Create praxis
ipcMain.handle('createPraxis', async (event, praxisData) => {
  const { name, description, instructions } = praxisData
  const statement = db.prepare(`
    INSERT INTO praxes (name, description, instructions)
    VALUES (?, ?, ?)
  `)
  const result = statement.run(name, description, instructions)
  return { id: result.lastInsertRowid, ...praxisData }
})

// Update praxis
ipcMain.handle('updatePraxis', async (event, id, praxisData) => {
  const { name, description, instructions } = praxisData
  const statement = db.prepare(`
    UPDATE praxes 
    SET name = ?, description = ?, instructions = ?
    WHERE id = ?
  `)
  statement.run(name, description, instructions, id)
  return { id, ...praxisData }
})

// Delete praxis
ipcMain.handle('deletePraxis', async (event, id) => {
  const statement = db.prepare('DELETE FROM praxes WHERE id = ?')
  const result = statement.run(id)
  return result.changes > 0
})

// ============== TREATMENTS CRUD ==============

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

// ============== EVOLUTION NOTES CRUD ==============

// Get all evolution notes
ipcMain.handle('getEvolutionNotes', async () => {
  const statement = db.prepare(`
    SELECT en.*, 
           t.title as treatment_title,
           p.full_name as patient_name
    FROM evolution_notes en
    LEFT JOIN treatments t ON en.treatment_id = t.id
    LEFT JOIN medical_records mr ON t.medical_record_id = mr.id
    LEFT JOIN patients p ON mr.patient_id = p.id
    ORDER BY en.created_at DESC
  `)
  return statement.all()
})

// Get evolution notes by treatment
ipcMain.handle('getEvolutionNotesByTreatment', async (event, treatmentId) => {
  const statement = db.prepare(`
    SELECT * FROM evolution_notes 
    WHERE treatment_id = ? 
    ORDER BY created_at DESC
  `)
  return statement.all(treatmentId)
})

// Get single evolution note
ipcMain.handle('getEvolutionNote', async (event, id) => {
  const statement = db.prepare(`
    SELECT en.*, 
           t.title as treatment_title,
           p.full_name as patient_name
    FROM evolution_notes en
    LEFT JOIN treatments t ON en.treatment_id = t.id
    LEFT JOIN medical_records mr ON t.medical_record_id = mr.id
    LEFT JOIN patients p ON mr.patient_id = p.id
    WHERE en.id = ?
  `)
  return statement.get(id)
})

// Create evolution note
ipcMain.handle('createEvolutionNote', async (event, noteData) => {
  const { treatment_id, entry } = noteData
  const statement = db.prepare(`
    INSERT INTO evolution_notes (treatment_id, entry)
    VALUES (?, ?)
  `)
  const result = statement.run(treatment_id, entry)
  return { id: result.lastInsertRowid, ...noteData }
})

// Update evolution note
ipcMain.handle('updateEvolutionNote', async (event, id, noteData) => {
  const { treatment_id, entry } = noteData
  const statement = db.prepare(`
    UPDATE evolution_notes 
    SET treatment_id = ?, entry = ?
    WHERE id = ?
  `)
  statement.run(treatment_id, entry, id)
  return { id, ...noteData }
})

// Delete evolution note
ipcMain.handle('deleteEvolutionNote', async (event, id) => {
  const statement = db.prepare('DELETE FROM evolution_notes WHERE id = ?')
  const result = statement.run(id)
  return result.changes > 0
})

// ============== UTILITY FUNCTIONS ==============

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