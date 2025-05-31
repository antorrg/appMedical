export default function initDatabase(db) {
  try {
    // const dbPath = path.join(app.getPath('userData'), 'patients.db');
    // console.log(dbPath);
    // db = new Database(dbPath);
    // console.log('Database connected');

    db.exec(`
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

    console.log('All tables created successfully');
  } catch (err) {
    console.log('Database error:', err);
  }
}