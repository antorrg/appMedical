import dbErrorHandler from "../errors/DatabaseErrorHandler.js"

export function setupPraxesHandler(ipcMain, db){
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
}