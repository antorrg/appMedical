//import { ipcRenderer } from 'electron';

const endpoint = {
    getPatients: () => window.ipcRenderer.invoke('getPatients'),
    getPatient: (id) => window.ipcRenderer.invoke('getPatient', id),
    createPatient: (patient) => window.ipcRenderer.invoke('createPatient', patient),
    updatePatient: (id, patientData) => window.ipcRenderer.invoke('updatePatient', id, patientData),
    deletePatient: (id) => window.ipcRenderer.invoke('deletePatient', id)
  };
  
  export default endpoint;