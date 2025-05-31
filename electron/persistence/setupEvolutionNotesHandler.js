import dbErrorHandler from "../errors/DatabaseErrorHandler.js"

export function setupEvolutionNotesHandler(ipcMain, db){
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
}