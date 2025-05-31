// database.js
/*import { app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');
const \_\_dirname = path.dirname(fileURLToPath(import.meta.url));

let db;

//\*\*

* Initializes SQLite database and creates tables if not present.
* Should be called once from main process before IPC handlers.
  \*/
  export function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'patients.db');
  db = new Database(dbPath);
  console.log('Database connected at', dbPath);

db.exec(`
PRAGMA foreign\_keys = ON;

```
CREATE TABLE IF NOT EXISTS patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  full_name TEXT NOT NULL,
  dni TEXT UNIQUE,
  age INTEGER NOT NULL,
  email TEXT,
  address TEXT,
  phone TEXT,
  development_notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS medical_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  patient_id INTEGER NOT NULL,
  summary TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS medications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  dosage TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS praxes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS treatments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  medical_record_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  notes TEXT,
  medication_id INTEGER,
  praxis_id INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE CASCADE,
  FOREIGN KEY (medication_id) REFERENCES medications(id),
  FOREIGN KEY (praxis_id) REFERENCES praxes(id)
);

CREATE TABLE IF NOT EXISTS evolution_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  treatment_id INTEGER NOT NULL,
  entry TEXT NOT NULL,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE
);
```

\`);

console.log('Database schema initialized');
}

/\*\*

* Returns the database instance. Call initDatabase first.
  \*/
  export function getDb() {
  if (!db) {
  throw new Error('Database not initialized.');
  }
  return db;
  }

// ipcHandlers.js
/\*\*

* Registers IPC handlers for CRUD operations.
* @param {Electron.IpcMain} ipcMain - Electron IPC main process
* @param {import('better-sqlite3').Database} db - better-sqlite3 database instance
  \*/
  export function registerIpcHandlers(ipcMain, db) {
  // Patients
  ipcMain.handle('getPatients', () => db.prepare('SELECT \* FROM patients ORDER BY updated\_at DESC').all());
  ipcMain.handle('getPatient', (\_e, id) => db.prepare('SELECT \* FROM patients WHERE id = ?').get(id));
  ipcMain.handle('addPatient', (\_e, patient) => {
  const now = new Date().toISOString();
  const stmt = db.prepare(
  `INSERT INTO patients (full_name, dni, age, email, address, phone, development_notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const result = stmt.run(
  patient.full\_name,
  patient.dni,
  patient.age,
  patient.email || null,
  patient.address || null,
  patient.phone || null,
  patient.development\_notes || null,
  now,
  now
  );
  return { id: result.lastInsertRowid, ...patient, created\_at: now, updated\_at: now };
  });
  ipcMain.handle('updatePatient', (\_e, { id, ...patient }) => {
  const now = new Date().toISOString();
  const stmt = db.prepare(
  `UPDATE patients SET full_name = ?, dni = ?, age = ?, email = ?, address = ?, phone = ?, development_notes = ?, updated_at = ? WHERE id = ?`
  );
  stmt.run(
  patient.full\_name,
  patient.dni,
  patient.age,
  patient.email || null,
  patient.address || null,
  patient.phone || null,
  patient.development\_notes || null,
  now,
  id
  );
  return { id, ...patient, updated\_at: now };
  });
  ipcMain.handle('deletePatient', (\_e, id) => {
  db.prepare('DELETE FROM patients WHERE id = ?').run(id);
  return true;
  });

// Medical Records
ipcMain.handle('getMedicalRecords', (\_e, patientId) => db.prepare('SELECT \* FROM medical\_records WHERE patient\_id = ? ORDER BY created\_at DESC').all(patientId));
ipcMain.handle('addMedicalRecord', (\_e, { patient\_id, summary }) => {
const now = new Date().toISOString();
const stmt = db.prepare('INSERT INTO medical\_records (patient\_id, summary, created\_at) VALUES (?, ?, ?)');
const result = stmt.run(patient\_id, summary || null, now);
return { id: result.lastInsertRowid, patient\_id, summary: summary || null, created\_at: now };
});

// Treatments
ipcMain.handle('getTreatments', (\_e, recordId) => db.prepare('SELECT \* FROM treatments WHERE medical\_record\_id = ? ORDER BY created\_at DESC').all(recordId));
ipcMain.handle('addTreatment', (\_e, treatment) => {
const now = new Date().toISOString();
const stmt = db.prepare(
`INSERT INTO treatments (medical_record_id, title, notes, medication_id, praxis_id, created_at) VALUES (?, ?, ?, ?, ?, ?)`
);
const result = stmt.run(
treatment.medical\_record\_id,
treatment.title,
treatment.notes || null,
treatment.medication\_id || null,
treatment.praxis\_id || null,
now
);
return { id: result.lastInsertRowid, ...treatment, created\_at: now };
});

// Evolution Notes
ipcMain.handle('getEvolutionNotes', (\_e, treatmentId) => db.prepare('SELECT \* FROM evolution\_notes WHERE treatment\_id = ? ORDER BY created\_at').all(treatmentId));
ipcMain.handle('addEvolutionNote', (\_e, { treatment\_id, entry }) => {
const now = new Date().toISOString();
const stmt = db.prepare('INSERT INTO evolution\_notes (treatment\_id, entry, created\_at) VALUES (?, ?, ?)');
const result = stmt.run(treatment\_id, entry, now);
return { id: result.lastInsertRowid, treatment\_id, entry, created\_at: now };
});

// Medications
ipcMain.handle('getMedications', () => db.prepare('SELECT \* FROM medications').all());
ipcMain.handle('addMedication', (\_e, { name, description, dosage }) => {
const now = new Date().toISOString();
const stmt = db.prepare('INSERT INTO medications (name, description, dosage, created\_at) VALUES (?, ?, ?, ?)');
const result = stmt.run(name, description || null, dosage || null, now);
return { id: result.lastInsertRowid, name, description: description || null, dosage: dosage || null, created\_at: now };
});

// Praxes
ipcMain.handle('getPraxes', () => db.prepare('SELECT \* FROM praxes').all());
ipcMain.handle('addPraxis', (\_e, { name, description, instructions }) => {
const now = new Date().toISOString();
const stmt = db.prepare('INSERT INTO praxes (name, description, instructions, created\_at) VALUES (?, ?, ?, ?)');
const result = stmt.run(name, description || null, instructions || null, now);
return { id: result.lastInsertRowid, name, description: description || null, instructions: instructions || null, created\_at: now };
});
}


