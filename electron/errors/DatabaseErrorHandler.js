
class DatabaseErrorHandler {
  constructor(enableLogging = true) {
    this.enableLogging = enableLogging
  }

  /**
   * Procesa errores de base de datos y los convierte en errores más específicos
   */
  handleDatabaseError(error, operation = 'Database operation') {
    let userMessage = ''
    let errorCode = 'DB_ERROR'

    // Errores específicos de SQLite
    switch (error.code) {
      case 'SQLITE_CONSTRAINT_UNIQUE':
        userMessage = 'Ya existe un registro con esos datos'
        errorCode = 'DUPLICATE_ENTRY'
        break
      case 'SQLITE_CONSTRAINT_FOREIGNKEY':
        userMessage = 'No se puede realizar la operación: referencia inválida'
        errorCode = 'INVALID_REFERENCE'
        break
      case 'SQLITE_BUSY':
        userMessage = 'Base de datos ocupada, intente nuevamente'
        errorCode = 'DB_BUSY'
        break
      case 'SQLITE_READONLY':
        userMessage = 'No se puede escribir en la base de datos'
        errorCode = 'DB_READONLY'
        break
      default:
        userMessage = 'Error en la base de datos'
        errorCode = 'DB_ERROR'
    }

    // Log del error si está habilitado
    if (this.enableLogging) {
      console.error(`[${operation}] Database Error:`, {
        code: error.code,
        message: error.message,
        operation,
        timestamp: new Date().toISOString()
      })
    }

    // Crear y lanzar error customizado
    const customError = new Error(`${operation}: ${userMessage}`)
    customError.code = errorCode
    customError.originalError = error
    
    throw customError
  }

  /**
   * Valida datos de entrada y lanza errores específicos
   */
  validatePatientData(patientData) {
    if (!patientData) {
      throw new Error('Patient data is required')
    }

    if (!patientData.full_name?.trim()) {
      throw new Error('Patient name is required')
    }

    if (!patientData.age || patientData.age < 0 || patientData.age > 150) {
      throw new Error('Valid age is required (0-150)')
    }

    // Validar DNI si está presente
    if (patientData.dni && !/^\d{7,8}$/.test(patientData.dni)) {
      throw new Error('DNI must be 7-8 digits')
    }

    // Validar email si está presente
    if (patientData.email && !/\S+@\S+\.\S+/.test(patientData.email)) {
      throw new Error('Invalid email format')
    }
  }

  /**
   * Valida ID
   */
  validateId(id, entityName = 'Entity') {
    if (!id || !Number.isInteger(Number(id)) || Number(id) <= 0) {
      throw new Error(`Invalid ${entityName.toLowerCase()} ID`)
    }
  }
}

// Instancia singleton
const dbErrorHandler = new DatabaseErrorHandler()
export default dbErrorHandler