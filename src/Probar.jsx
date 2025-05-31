import { useState, useEffect } from 'react';
import endpoint from './endpoint';
import PatientForm from './components/PatientForm';
import PatientList from './components/PatientList';

function Probar() {
  const [patients, setPatients] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    dni:'',
    age: '',
    email: '',
    address: '',
    phone: '',
    development_notes: '',
  });
  

  useEffect(() => {
    loadPatients();
  }, []);

  const showForm = () => setShow(!show);

  const loadPatients = async () => {
    const result = await endpoint.getPatients();
    setPatients(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPatient) {
        const response = await endpoint.updatePatient(selectedPatient.id, formData );
        alert(response.message)
      } else {
        console.log('soy el paciente: ', formData)
        await endpoint.createPatient(formData);
      }

      resetForm();
      loadPatients();
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Error al guardar el paciente');
    }
  };

  const handleEdit = (patient) => {
    setSelectedPatient(patient);
    setFormData({
      full_name: patient.full_name || '',
      dni: patient.dni || '',
      age: patient.age || '',
      email: patient.email || '',
      address: patient.address || '',
      phone: patient.phone || '',
      development_notes: patient.development_notes || ''
    });
    setShow(true);
  };

  const handleDelete = async (id) => {
    if (confirm('¿Está seguro de eliminar este paciente?')) {
      await endpoint.deletePatient(id);
      loadPatients();
    }
  };

  const resetForm = () => {
    setFormData({
    full_name: '',
    dni:'',
    age: '',
    email: '',
    address: '',
    phone: '',
    development_notes: '',
    });
    setSelectedPatient(null);
  };

  return (
    <div className="container py-4 mt-3">
      <h1 className="text-center mb-4">Gestión de Pacientes</h1>
      <div className="row">
        <button className="btn btn-sm btn-outline-info mb-3 w-2" onClick={showForm}>
          Nuevo paciente
        </button>
        {!show ? (
          <PatientList patients={patients} onEdit={handleEdit} onDelete={handleDelete} />
        ) : (
          <PatientForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            selectedPatient={selectedPatient}
            onCancel={resetForm}
          />
        )}
      </div>
    </div>
  );
}

export default Probar;

// import { useState, useEffect } from 'react'
// import Buttons2 from './components/buttons2/Buttons2'
// import endpoint from './endpoint'

// function Probar() {
//   const [patients, setPatients] = useState([])
//   const [show, setShow] = useState(false)
//   const [selectedPatient, setSelectedPatient] = useState(null)
//   const [formData, setFormData] = useState({
//     name: '',
//     age: '',
//     email: '',
//     diagnostic: '',
//     observations: '',
//     patientDevelopment: ''
//   })

//   useEffect(() => {
//     loadPatients()
//   }, [])

//   const showForm = () => {
//     setShow(!show)
//   }
//   const loadPatients = async () => {
//     const result = await endpoint.getPatients()
//     setPatients(result)
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     try {
//       if (selectedPatient) {
//         await endpoint.updatePatient({
//           id: selectedPatient.id,
//           ...formData
//         })
//       } else {
//         const newPatient = await endpoint.addPatient(formData)
//         console.log('Nuevo paciente:', newPatient)
        
        
//       }
      
//       setFormData({
//         name: '',
//         age: '',
//         email: '',
//         diagnostic: '',
//         observations: '',
//         patientDevelopment: ''
//       })
//       setSelectedPatient(null)
//       loadPatients()
//     } catch (error) {
//       console.error('Error saving patient:', error)
//       alert('Error al guardar el paciente')
//     }
//   }

//   const handleEdit = (patient) => {
//     setSelectedPatient(patient)
//     showForm()
//     setFormData({
//       name: patient.name,
//       age: patient.age,
//       email: patient.email || '',
//       diagnostic: patient.diagnostic || '',
//       observations: patient.observations || '',
//       patientDevelopment: patient.patientDevelopment || ''
//     })
//   }

//   const handleDelete = async (id) => {
//     if (confirm('¿Está seguro de eliminar este paciente?')) {
//       await endpoint.deletePatient(id)
//       loadPatients()
//     }
//   }

//   return (
//     <div className="container py-4 mt-3">
//       <h1 className="text-center mb-4">Gestión de Pacientes</h1>
  
//       <div className="row">
//         <button className='btn btn-sm btn-outline-info mb-3 w-2' onClick={showForm}>Nuevo paciente</button>
//         {!show ?
//       <div className="col-lg-6 col-md-8 col-sm-12">
//           <h2 className="h4 mb-3">Lista de Pacientes</h2>
//           <div className="list-group">
//             {patients.map((patient) => (
//               <div key={patient.id} className="card mb-3">
//                 <div className="card-body">
//                   <div className="d-flex justify-content-between align-items-start">
//                     <div>
//                       <h5 className="card-title">{patient.name}</h5>
//                       <p className="card-text text-muted">
//                         Edad: {patient.age} | Email: {patient.email || 'No especificado'}
//                       </p>
//                     </div>
//                     <Buttons2 
//                     onClick1={() => handleEdit(patient)}
//                     style1={'btn btn-sm btn-outline-primary'}
//                     text1='Editar'
//                     onClick2={() => handleDelete(patient.id)}
//                     style2={"btn btn-sm btn-outline-danger"}
//                     text2='Eliminar'
//                     />
  
//                   </div>
  
//                   {patient.diagnostic && (
//                     <div className="mt-2">
//                       <p className="fw-semibold">Diagnóstico:</p>
//                       <p className="text-muted">{patient.diagnostic}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//         :
//         <div className="col-md-6">
//           <h2 className="h4 mb-3">
//             {selectedPatient ? 'Editar Paciente' : 'Nuevo Paciente'}
//           </h2>
//           <form onSubmit={handleSubmit}>
//             <div className="mb-3">
//               <label className="form-label">Nombre</label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 className="form-control"
//                 required
//               />
//             </div>
  
//             <div className="mb-3">
//               <label className="form-label">Edad</label>
//               <input
//                 type="number"
//                 value={formData.age}
//                 onChange={(e) => setFormData({ ...formData, age: e.target.value })}
//                 className="form-control"
//                 required
//               />
//             </div>
  
//             <div className="mb-3">
//               <label className="form-label">Email</label>
//               <input
//                 type="email"
//                 value={formData.email}
//                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 className="form-control"
//               />
//             </div>
  
//             <div className="mb-3">
//               <label className="form-label">Diagnóstico</label>
//               <textarea
//                 value={formData.diagnostic}
//                 onChange={(e) => setFormData({ ...formData, diagnostic: e.target.value })}
//                 className="form-control"
//                 rows="3"
//               />
//             </div>
  
//             <div className="mb-3">
//               <label className="form-label">Observaciones</label>
//               <textarea
//                 value={formData.observations}
//                 onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
//                 className="form-control"
//                 rows="3"
//               />
//             </div>
  
//             <div className="mb-3">
//               <label className="form-label">Desarrollo del Paciente</label>
//               <textarea
//                 value={formData.patientDevelopment}
//                 onChange={(e) => setFormData({ ...formData, patientDevelopment: e.target.value })}
//                 className="form-control"
//                 rows="3"
//               />
//             </div>
  
//             <div className="d-flex gap-2">
//               <button type="submit" className="btn btn-primary">
//                 {selectedPatient ? 'Actualizar' : 'Guardar'}
//               </button>
  
//               {selectedPatient && (
//                 <button
//                   type="button"
//                   onClick={() => {
//                     setSelectedPatient(null);
//                     setFormData({
//                       name: '',
//                       age: '',
//                       email: '',
//                       diagnostic: '',
//                       observations: '',
//                       patientDevelopment: '',
//                     });
//                   }}
//                   className="btn btn-secondary"
//                 >
//                   Cancelar
//                 </button>
//               )}
//             </div>
//           </form>
//         </div>
  
//        }
//       </div>
//     </div>
//   );
  
// }
// export default Probar