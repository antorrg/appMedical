import dbErrorHandler from "../errors/DatabaseErrorHandler.js"

export function setupPatientsHandlers(ipcMain, db) {
  
  ipcMain.handle('getPatients', async () => {
    try {
      const statement = db.prepare('SELECT * FROM patients ORDER BY created_at DESC')
      const patients = statement.all()
      
      // Lista vacía es válida, no es un error
      return patients
      
    } catch (error) {
      dbErrorHandler.handleDatabaseError(error, 'Get patients')
    }
  })

  ipcMain.handle('getPatient', async (event, id) => {
    try {
      dbErrorHandler.validateId(id, 'Patient')
      
      const statement = db.prepare('SELECT * FROM patients WHERE id = ?')
      const patient = statement.get(id)
      
      if (!patient) {
        throw new Error('Patient not found')
      }
      
      return patient
      
    } catch (error) {
      // Si ya es un error de validación, re-lanzarlo
      if (error.message.includes('Invalid') || error.message.includes('not found')) {
        throw error
      }
      // Si es error de DB, procesarlo
      dbErrorHandler.handleDatabaseError(error, 'Get patient')
    }
  })

  ipcMain.handle('createPatient', async (event, patientData) => {
    try {
      // Validar datos de entrada
      dbErrorHandler.validatePatientData(patientData)
      
      const { full_name, dni, age, email, address, phone, development_notes } = patientData
      
      const statement = db.prepare(`
        INSERT INTO patients (full_name, dni, age, email, address, phone, development_notes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `)
      
      const result = statement.run(full_name, dni, age, email, address, phone, development_notes)
      
      return { 
        id: result.lastInsertRowid, 
        ...patientData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
    } catch (error) {
      // Si es error de validación, re-lanzarlo
      if (error.message.includes('required') || error.message.includes('Invalid')) {
        throw error
      }
      // Si es error de DB, procesarlo
      dbErrorHandler.handleDatabaseError(error, 'Create patient')
    }
  })

  ipcMain.handle('updatePatient', async (event, id, patientData) => {
    try {
      dbErrorHandler.validateId(id, 'Patient')
     
     dbErrorHandler.validatePatientData(patientData)
      
      // Verificar que existe
      const existingPatient = db.prepare('SELECT id FROM patients WHERE id = ?').get(id)
      if (!existingPatient) {
        throw new Error('Patient not found')
      }
      
      const { full_name, dni, age, email, address, phone, development_notes } = patientData
      
      const statement = db.prepare(`
        UPDATE patients 
        SET full_name = ?, dni = ?, age = ?, email = ?, address = ?, phone = ?, 
            development_notes = ?, updated_at = datetime('now')
        WHERE id = ?
      `)
      
      const result = statement.run(full_name, dni, age, email, address, phone, development_notes, id)
      
      if (result.changes === 0) {
        throw new Error('No changes were made')
      }
      
      return { 
        message: 'Paciente actualizado exitosamente',
        data: {id: Number(id), 
        ...patientData,
        updated_at: new Date().toISOString()}
      }
      
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Invalid') || error.message.includes('required')) {
        throw error
      }
      dbErrorHandler.handleDatabaseError(error, 'Update patient')
    }
  })

  ipcMain.handle('deletePatient', async (event, id) => {
    try {
      dbErrorHandler.validateId(id, 'Patient')
      
      // Verificar que existe
      const existingPatient = db.prepare('SELECT id FROM patients WHERE id = ?').get(id)
      if (!existingPatient) {
        throw new Error('Patient not found')
      }
      
      // Verificar integridad referencial
      const hasRecords = db.prepare('SELECT COUNT(*) as count FROM medical_records WHERE patient_id = ?').get(id)
      if (hasRecords.count > 0) {
        throw new Error('Cannot delete patient with existing medical records')
      }
      
      const statement = db.prepare('DELETE FROM patients WHERE id = ?')
      const result = statement.run(id)
      
      return { deleted: result.changes > 0 }
      
    } catch (error) {
      if (error.message.includes('not found') || error.message.includes('Cannot delete') || error.message.includes('Invalid')) {
        throw error
      }
      dbErrorHandler.handleDatabaseError(error, 'Delete patient')
    }
  })
}