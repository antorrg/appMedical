// src/DetallePaciente.jsx
import React from "react";

const DetallePaciente = ({ pacienteId, onClose }) => {
  // Simulación de datos del paciente. En una app real, fetch por ID.
  const paciente = {
    id: pacienteId,
    nombre: "Juan Pérez",
    edad: 35,
    diagnostico: "Hipertensión",
  };

  return (
    <div className="p-3">
      <h4>Detalle del Paciente</h4>
      <p><strong>ID:</strong> {paciente.id}</p>
      <p><strong>Nombre:</strong> {paciente.nombre}</p>
      <p><strong>Edad:</strong> {paciente.edad}</p>
      <p><strong>Diagnóstico:</strong> {paciente.diagnostico}</p>
      <button className="btn btn-sm btn-danger mt-2" onClick={() => onClose(pacienteId)}>
        Cerrar
      </button>
    </div>
  );
};

export default DetallePaciente;
