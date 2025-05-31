import dbErrorHandler from "../errors/DatabaseErrorHandler.js"

export function setupMedicationsHandlers (ipcMain, db){
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
}