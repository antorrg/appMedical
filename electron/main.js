import { app, BrowserWindow, ipcMain  } from 'electron'
import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import path from 'path'
import initDatabase from './persistence/database'
import { setupPatientsHandlers } from './persistence/setupPatientsHandlers'
import { setupMedicalRecordsHandlers } from './persistence/setupMedicalHandlers'
import { setupMedicationsHandlers } from './persistence/setupMedicationsHandlers'
import { setupEvolutionNotesHandler } from './persistence/setupEvolutionNotesHandler'
import { setupTreatmentsHandler } from './persistence/setupTreatmentsHandler'
import { setupUtilities } from './persistence/setupUtilties'


const require = createRequire(import.meta.url)
const Database = require('better-sqlite3')
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win;
//let db; 
const dbPath = path.join(app.getPath('userData'), 'patients.db');
    console.log('soy dbPath',dbPath);
export const db = new Database(dbPath);


function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

//*aqui ponemos los handlers
// IPC handlers
setupPatientsHandlers(ipcMain, db)
setupMedicalRecordsHandlers(ipcMain, db)
setupMedicationsHandlers(ipcMain, db)
setupEvolutionNotesHandler(ipcMain, db)
setupTreatmentsHandler(ipcMain, db)
setupUtilities(ipcMain, db)

/*
ipcMain.handle('getPatients', async () => {
  const statement = db.prepare('SELECT * FROM patients ORDER BY updatedAt DESC')
  return statement.all()
})

ipcMain.handle('getPatient', async (event, id) => {
  const statement = db.prepare('SELECT * FROM patients WHERE id = ?')
  return statement.get(id)
})

ipcMain.handle('addPatient', async (event, patient) => {
  try{
   // console.log('addPatient: ',patient)
  const now = new Date().toISOString()
  const statement = db.prepare(`
    INSERT INTO patients (
      name, age, email, diagnostic, observations, 
      patientDevelopment, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `)
  
  const result = statement.run(
    patient.name,
    patient.age,
    patient.email || null,
    patient.diagnostic || null,
    patient.observations || null,
    patient.patientDevelopment || null,
    now,
    now
  )
  
  return { id: result.lastInsertRowid, ...patient, createdAt: now, updatedAt: now }
}catch(err){
  console.log('Error en addPatient: ',err)

}
})

ipcMain.handle('updatePatient', async (event, { id, ...patient }) => {
  const now = new Date().toISOString()
  const statement = db.prepare(`
    UPDATE patients SET 
      name = ?, age = ?, email = ?, diagnostic = ?,
      observations = ?, patientDevelopment = ?, updatedAt = ?
    WHERE id = ?
  `)
  
  statement.run(
    patient.name,
    patient.age,
    patient.email || null,
    patient.diagnostic || null,
    patient.observations || null,
    patient.patientDevelopment || null,
    now,
    id
  )
  
  return { id, ...patient, updatedAt: now }
})

ipcMain.handle('deletePatient', async (event, id) => {
  const statement = db.prepare('DELETE FROM patients WHERE id = ?')
  statement.run(id)
  return true
})
  */

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(
  createWindow,
  initDatabase(db),
  )