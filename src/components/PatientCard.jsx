// src/components/PatientCard.jsx
import Buttons2 from './buttons2/Buttons2';

function PatientCard({ patient, onEdit, onDelete }) {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title">{patient.full_name}</h5>
            <p className="card-text text-muted">
              Edad: {patient.age} | Email: {patient.email || 'No especificado'}
            </p>
          </div>
          <Buttons2
            onClick1={() => onEdit(patient)}
            style1="btn btn-sm btn-outline-primary"
            text1="Editar"
            onClick2={() => onDelete(patient.id)}
            style2="btn btn-sm btn-outline-danger"
            text2="Eliminar"
          />

        {patient.diagnostic && (
          <div className="mt-2">
            <p className="fw-semibold">Notas de evolucion:</p>
            <p className="text-muted">{patient.development_notes}</p>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default PatientCard;
