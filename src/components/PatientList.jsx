import PatientCard from './PatientCard';

function PatientList({ patients, onEdit, onDelete }) {
  return (
    <div className="col-lg-10 col-md-12 col-sm-12">
      <h2 className="h4 mb-3">Lista de Pacientes</h2>
      <div className="list-group">
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default PatientList;
