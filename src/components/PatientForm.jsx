// src/components/PatientForm.jsx


function PatientForm({ formData, setFormData, onSubmit, selectedPatient, onCancel }) {
  return (
    <div className="col-md-6">
      <h2 className="h4 mb-3">
        {selectedPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
      </h2>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Edad</label>
          <input
            type="number"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            className="form-control"
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label">DNI</label>
          <input
            type="number"
            value={formData.dni}
            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
            className="form-control"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="form-control"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Dirección</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="form-control"
            rows="3"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <textarea
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="form-control"
            rows="3"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Notas de evolución</label>
          <textarea
            value={formData.development_notes}
            onChange={(e) => setFormData({ ...formData, development_notes: e.target.value })}
            className="form-control"
            rows="3"
          />
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary">
            {selectedPatient ? 'Actualizar' : 'Guardar'}
          </button>
          {selectedPatient && (
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default PatientForm;
