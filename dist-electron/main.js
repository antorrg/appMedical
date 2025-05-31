import { app, BrowserWindow, ipcMain } from "electron";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";
function initDatabase(db2) {
  try {
    db2.exec(`
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
    `);
    console.log("All tables created successfully");
  } catch (err) {
    console.log("Database error:", err);
  }
}
class DatabaseErrorHandler {
  constructor(enableLogging = true) {
    this.enableLogging = enableLogging;
  }
  /**
   * Procesa errores de base de datos y los convierte en errores más específicos
   */
  handleDatabaseError(error, operation = "Database operation") {
    let userMessage = "";
    let errorCode = "DB_ERROR";
    switch (error.code) {
      case "SQLITE_CONSTRAINT_UNIQUE":
        userMessage = "Ya existe un registro con esos datos";
        errorCode = "DUPLICATE_ENTRY";
        break;
      case "SQLITE_CONSTRAINT_FOREIGNKEY":
        userMessage = "No se puede realizar la operación: referencia inválida";
        errorCode = "INVALID_REFERENCE";
        break;
      case "SQLITE_BUSY":
        userMessage = "Base de datos ocupada, intente nuevamente";
        errorCode = "DB_BUSY";
        break;
      case "SQLITE_READONLY":
        userMessage = "No se puede escribir en la base de datos";
        errorCode = "DB_READONLY";
        break;
      default:
        userMessage = "Error en la base de datos";
        errorCode = "DB_ERROR";
    }
    if (this.enableLogging) {
      console.error(`[${operation}] Database Error:`, {
        code: error.code,
        message: error.message,
        operation,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    }
    const customError = new Error(`${operation}: ${userMessage}`);
    customError.code = errorCode;
    customError.originalError = error;
    throw customError;
  }
  /**
   * Valida datos de entrada y lanza errores específicos
   */
  validatePatientData(patientData) {
    var _a;
    if (!patientData) {
      throw new Error("Patient data is required");
    }
    if (!((_a = patientData.full_name) == null ? void 0 : _a.trim())) {
      throw new Error("Patient name is required");
    }
    if (!patientData.age || patientData.age < 0 || patientData.age > 150) {
      throw new Error("Valid age is required (0-150)");
    }
    if (patientData.dni && !/^\d{7,8}$/.test(patientData.dni)) {
      throw new Error("DNI must be 7-8 digits");
    }
    if (patientData.email && !/\S+@\S+\.\S+/.test(patientData.email)) {
      throw new Error("Invalid email format");
    }
  }
  /**
   * Valida ID
   */
  validateId(id, entityName = "Entity") {
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error(`Invalid ${entityName.toLowerCase()} ID`);
    }
  }
}
const dbErrorHandler = new DatabaseErrorHandler();
function setupPatientsHandlers(ipcMain2, db2) {
  ipcMain2.handle("getPatients", async () => {
    try {
      const statement = db2.prepare("SELECT * FROM patients ORDER BY created_at DESC");
      const patients = statement.all();
      return patients;
    } catch (error) {
      dbErrorHandler.handleDatabaseError(error, "Get patients");
    }
  });
  ipcMain2.handle("getPatient", async (event, id) => {
    try {
      dbErrorHandler.validateId(id, "Patient");
      const statement = db2.prepare("SELECT * FROM patients WHERE id = ?");
      const patient = statement.get(id);
      if (!patient) {
        throw new Error("Patient not found");
      }
      return patient;
    } catch (error) {
      if (error.message.includes("Invalid") || error.message.includes("not found")) {
        throw error;
      }
      dbErrorHandler.handleDatabaseError(error, "Get patient");
    }
  });
  ipcMain2.handle("createPatient", async (event, patientData) => {
    try {
      dbErrorHandler.validatePatientData(patientData);
      const { full_name, dni, age, email, address, phone, development_notes } = patientData;
      const statement = db2.prepare(`
        INSERT INTO patients (full_name, dni, age, email, address, phone, development_notes, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `);
      const result = statement.run(full_name, dni, age, email, address, phone, development_notes);
      return {
        id: result.lastInsertRowid,
        ...patientData,
        created_at: (/* @__PURE__ */ new Date()).toISOString(),
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
    } catch (error) {
      if (error.message.includes("required") || error.message.includes("Invalid")) {
        throw error;
      }
      dbErrorHandler.handleDatabaseError(error, "Create patient");
    }
  });
  ipcMain2.handle("updatePatient", async (event, id, patientData) => {
    try {
      dbErrorHandler.validateId(id, "Patient");
      dbErrorHandler.validatePatientData(patientData);
      const existingPatient = db2.prepare("SELECT id FROM patients WHERE id = ?").get(id);
      if (!existingPatient) {
        throw new Error("Patient not found");
      }
      const { full_name, dni, age, email, address, phone, development_notes } = patientData;
      const statement = db2.prepare(`
        UPDATE patients 
        SET full_name = ?, dni = ?, age = ?, email = ?, address = ?, phone = ?, 
            development_notes = ?, updated_at = datetime('now')
        WHERE id = ?
      `);
      const result = statement.run(full_name, dni, age, email, address, phone, development_notes, id);
      if (result.changes === 0) {
        throw new Error("No changes were made");
      }
      return {
        message: "Paciente actualizado exitosamente",
        data: {
          id: Number(id),
          ...patientData,
          updated_at: (/* @__PURE__ */ new Date()).toISOString()
        }
      };
    } catch (error) {
      if (error.message.includes("not found") || error.message.includes("Invalid") || error.message.includes("required")) {
        throw error;
      }
      dbErrorHandler.handleDatabaseError(error, "Update patient");
    }
  });
  ipcMain2.handle("deletePatient", async (event, id) => {
    try {
      dbErrorHandler.validateId(id, "Patient");
      const existingPatient = db2.prepare("SELECT id FROM patients WHERE id = ?").get(id);
      if (!existingPatient) {
        throw new Error("Patient not found");
      }
      const hasRecords = db2.prepare("SELECT COUNT(*) as count FROM medical_records WHERE patient_id = ?").get(id);
      if (hasRecords.count > 0) {
        throw new Error("Cannot delete patient with existing medical records");
      }
      const statement = db2.prepare("DELETE FROM patients WHERE id = ?");
      const result = statement.run(id);
      return { deleted: result.changes > 0 };
    } catch (error) {
      if (error.message.includes("not found") || error.message.includes("Cannot delete") || error.message.includes("Invalid")) {
        throw error;
      }
      dbErrorHandler.handleDatabaseError(error, "Delete patient");
    }
  });
}
function setupMedicalRecordsHandlers(ipcMain2, db2) {
  ipcMain2.handle("getMedicalRecords", async () => {
    try {
      const statement = db2.prepare(`
    SELECT mr.*, p.full_name as patient_name 
    FROM medical_records mr
    LEFT JOIN patients p ON mr.patient_id = p.id
    ORDER BY mr.created_at DESC
  `);
      return statement.all();
    } catch (error) {
      dbErrorHandler.handleDatabaseError(error, "Get MedicalRecords");
    }
  });
  ipcMain2.handle("getMedicalRecordsByPatient", async (event, patientId) => {
    const statement = db2.prepare(`
    SELECT * FROM medical_records 
    WHERE patient_id = ? 
    ORDER BY created_at DESC
  `);
    return statement.all(patientId);
  });
  ipcMain2.handle("getMedicalRecord", async (event, id) => {
    const statement = db2.prepare(`
    SELECT mr.*, p.full_name as patient_name 
    FROM medical_records mr
    LEFT JOIN patients p ON mr.patient_id = p.id
    WHERE mr.id = ?
  `);
    return statement.get(id);
  });
  ipcMain2.handle("createMedicalRecord", async (event, recordData) => {
    const { patient_id, summary } = recordData;
    const statement = db2.prepare(`
    INSERT INTO medical_records (patient_id, summary)
    VALUES (?, ?)
  `);
    const result = statement.run(patient_id, summary);
    return { id: result.lastInsertRowid, ...recordData };
  });
  ipcMain2.handle("updateMedicalRecord", async (event, id, recordData) => {
    const { patient_id, summary } = recordData;
    const statement = db2.prepare(`
    UPDATE medical_records 
    SET patient_id = ?, summary = ?
    WHERE id = ?
  `);
    statement.run(patient_id, summary, id);
    return { id, ...recordData };
  });
  ipcMain2.handle("deleteMedicalRecord", async (event, id) => {
    const statement = db2.prepare("DELETE FROM medical_records WHERE id = ?");
    const result = statement.run(id);
    return result.changes > 0;
  });
}
function setupMedicationsHandlers(ipcMain2, db2) {
  ipcMain2.handle("getMedications", async () => {
    const statement = db2.prepare("SELECT * FROM medications ORDER BY name ASC");
    return statement.all();
  });
  ipcMain2.handle("getMedication", async (event, id) => {
    const statement = db2.prepare("SELECT * FROM medications WHERE id = ?");
    return statement.get(id);
  });
  ipcMain2.handle("createMedication", async (event, medicationData) => {
    const { name, description, dosage } = medicationData;
    const statement = db2.prepare(`
        INSERT INTO medications (name, description, dosage)
        VALUES (?, ?, ?)
      `);
    const result = statement.run(name, description, dosage);
    return { id: result.lastInsertRowid, ...medicationData };
  });
  ipcMain2.handle("updateMedication", async (event, id, medicationData) => {
    const { name, description, dosage } = medicationData;
    const statement = db2.prepare(`
        UPDATE medications 
        SET name = ?, description = ?, dosage = ?
        WHERE id = ?
      `);
    statement.run(name, description, dosage, id);
    return { id, ...medicationData };
  });
  ipcMain2.handle("deleteMedication", async (event, id) => {
    const statement = db2.prepare("DELETE FROM medications WHERE id = ?");
    const result = statement.run(id);
    return result.changes > 0;
  });
}
function setupEvolutionNotesHandler(ipcMain2, db2) {
  ipcMain2.handle("getEvolutionNotes", async () => {
    const statement = db2.prepare(`
        SELECT en.*, 
               t.title as treatment_title,
               p.full_name as patient_name
        FROM evolution_notes en
        LEFT JOIN treatments t ON en.treatment_id = t.id
        LEFT JOIN medical_records mr ON t.medical_record_id = mr.id
        LEFT JOIN patients p ON mr.patient_id = p.id
        ORDER BY en.created_at DESC
      `);
    return statement.all();
  });
  ipcMain2.handle("getEvolutionNotesByTreatment", async (event, treatmentId) => {
    const statement = db2.prepare(`
        SELECT * FROM evolution_notes 
        WHERE treatment_id = ? 
        ORDER BY created_at DESC
      `);
    return statement.all(treatmentId);
  });
  ipcMain2.handle("getEvolutionNote", async (event, id) => {
    const statement = db2.prepare(`
        SELECT en.*, 
               t.title as treatment_title,
               p.full_name as patient_name
        FROM evolution_notes en
        LEFT JOIN treatments t ON en.treatment_id = t.id
        LEFT JOIN medical_records mr ON t.medical_record_id = mr.id
        LEFT JOIN patients p ON mr.patient_id = p.id
        WHERE en.id = ?
      `);
    return statement.get(id);
  });
  ipcMain2.handle("createEvolutionNote", async (event, noteData) => {
    const { treatment_id, entry } = noteData;
    const statement = db2.prepare(`
        INSERT INTO evolution_notes (treatment_id, entry)
        VALUES (?, ?)
      `);
    const result = statement.run(treatment_id, entry);
    return { id: result.lastInsertRowid, ...noteData };
  });
  ipcMain2.handle("updateEvolutionNote", async (event, id, noteData) => {
    const { treatment_id, entry } = noteData;
    const statement = db2.prepare(`
        UPDATE evolution_notes 
        SET treatment_id = ?, entry = ?
        WHERE id = ?
      `);
    statement.run(treatment_id, entry, id);
    return { id, ...noteData };
  });
  ipcMain2.handle("deleteEvolutionNote", async (event, id) => {
    const statement = db2.prepare("DELETE FROM evolution_notes WHERE id = ?");
    const result = statement.run(id);
    return result.changes > 0;
  });
}
function setupTreatmentsHandler(ipcMain2, db2) {
  ipcMain2.handle("getTreatments", async () => {
    const statement = db2.prepare(`
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
  `);
    return statement.all();
  });
  ipcMain2.handle("getTreatmentsByMedicalRecord", async (event, medicalRecordId) => {
    const statement = db2.prepare(`
    SELECT t.*, 
           m.name as medication_name,
           pr.name as praxis_name
    FROM treatments t
    LEFT JOIN medications m ON t.medication_id = m.id
    LEFT JOIN praxes pr ON t.praxis_id = pr.id
    WHERE t.medical_record_id = ?
    ORDER BY t.created_at DESC
  `);
    return statement.all(medicalRecordId);
  });
  ipcMain2.handle("getTreatment", async (event, id) => {
    const statement = db2.prepare(`
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
  `);
    return statement.get(id);
  });
  ipcMain2.handle("createTreatment", async (event, treatmentData) => {
    const { medical_record_id, title, notes, medication_id, praxis_id } = treatmentData;
    const statement = db2.prepare(`
    INSERT INTO treatments (medical_record_id, title, notes, medication_id, praxis_id)
    VALUES (?, ?, ?, ?, ?)
  `);
    const result = statement.run(medical_record_id, title, notes, medication_id, praxis_id);
    return { id: result.lastInsertRowid, ...treatmentData };
  });
  ipcMain2.handle("updateTreatment", async (event, id, treatmentData) => {
    const { medical_record_id, title, notes, medication_id, praxis_id } = treatmentData;
    const statement = db2.prepare(`
    UPDATE treatments 
    SET medical_record_id = ?, title = ?, notes = ?, medication_id = ?, praxis_id = ?
    WHERE id = ?
  `);
    statement.run(medical_record_id, title, notes, medication_id, praxis_id, id);
    return { id, ...treatmentData };
  });
  ipcMain2.handle("deleteTreatment", async (event, id) => {
    const statement = db2.prepare("DELETE FROM treatments WHERE id = ?");
    const result = statement.run(id);
    return result.changes > 0;
  });
}
function setupUtilities(ipcMain2, db2) {
  ipcMain2.handle("getPatientWithAllData", async (event, patientId) => {
    const patient = db2.prepare("SELECT * FROM patients WHERE id = ?").get(patientId);
    if (!patient) return null;
    const medicalRecords = db2.prepare(`
        SELECT mr.*, 
               GROUP_CONCAT(t.title) as treatment_titles
        FROM medical_records mr
        LEFT JOIN treatments t ON mr.id = t.medical_record_id
        WHERE mr.patient_id = ?
        GROUP BY mr.id
        ORDER BY mr.created_at DESC
      `).all(patientId);
    return {
      ...patient,
      medical_records: medicalRecords
    };
  });
  ipcMain2.handle("searchPatients", async (event, searchTerm) => {
    const statement = db2.prepare(`
        SELECT * FROM patients 
        WHERE full_name LIKE ? OR dni LIKE ? OR email LIKE ?
        ORDER BY full_name ASC
      `);
    const term = `%${searchTerm}%`;
    return statement.all(term, term, term);
  });
}
const require2 = createRequire(import.meta.url);
const Database = require2("better-sqlite3");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
const dbPath = path.join(app.getPath("userData"), "patients.db");
console.log("soy dbPath", dbPath);
const db = new Database(dbPath);
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
setupPatientsHandlers(ipcMain, db);
setupMedicalRecordsHandlers(ipcMain, db);
setupMedicationsHandlers(ipcMain, db);
setupEvolutionNotesHandler(ipcMain, db);
setupTreatmentsHandler(ipcMain, db);
setupUtilities(ipcMain, db);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(
  createWindow,
  initDatabase(db)
);
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL,
  db
};
