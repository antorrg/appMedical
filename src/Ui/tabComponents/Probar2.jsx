const Probar2 = ({ openPaciente }) => {
  const pacientes = [
    { id: 1, nombre: "Juan" },
    { id: 2, nombre: "Ana" },
  ];

  return (
    <div>
      <h3>Lista de Pacientes</h3>
      <ul>
        {pacientes.map((p) => (
          <li key={p.id}>
            <button onClick={() => openPaciente(p)}>{p.nombre}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Probar2
