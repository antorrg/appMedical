import { ipcRenderer, contextBridge } from 'electron'


contextBridge.exposeInMainWorld('ipcRenderer', {
  on(channel, listener) {
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(channel, listener) {
    return ipcRenderer.off(channel, listener);
  },
  send(channel, ...args) {
    return ipcRenderer.send(channel, ...args);
  },
  invoke(channel, ...args) {
    return ipcRenderer.invoke(channel, ...args);
  },
  /*getPatients: () => ipcRenderer.invoke('getPatients'),
  getPatient: (id) => ipcRenderer.invoke('getPatient', id),
  addPatient: (patient) => ipcRenderer.invoke('addPatient', patient),
  updatePatient: (patient) => ipcRenderer.invoke('updatePatient', patient),
  deletePatient: (id) => ipcRenderer.invoke('deletePatient', id)
  */
   // Patients
  getPatients: () => ipcRenderer.invoke('getPatients'),
  getPatient: (id) => ipcRenderer.invoke('getPatient', id),
  createPatient: (patientData) => ipcRenderer.invoke('createPatient', patientData),
  updatePatient: (id, patientData) => ipcRenderer.invoke('updatePatient', id, patientData),
  deletePatient: (id) => ipcRenderer.invoke('deletePatient', id),
  
  // Medical Records (ejemplo)
  getMedicalRecords: (patientId) => ipcRenderer.invoke('getMedicalRecords', patientId),
  createMedicalRecord: (recordData) => ipcRenderer.invoke('createMedicalRecord', recordData),
  
  // Medications (ejemplo)
  getMedications: (patientId) => ipcRenderer.invoke('getMedications', patientId),
  createMedication: (medicationData) => ipcRenderer.invoke('createMedication', medicationData),
  
  // Evolution Notes (ejemplo)
  getEvolutionNotes: (patientId) => ipcRenderer.invoke('getEvolutionNotes', patientId),
  createEvolutionNote: (noteData) => ipcRenderer.invoke('createEvolutionNote', noteData),
  
  // Treatments (ejemplo)
  getTreatments: (patientId) => ipcRenderer.invoke('getTreatments', patientId),
  createTreatment: (treatmentData) => ipcRenderer.invoke('createTreatment', treatmentData),
  
  // Utilities (ejemplo)
  exportData: () => ipcRenderer.invoke('exportData'),
  importData: (filePath) => ipcRenderer.invoke('importData', filePath)
  // You can expose other APIs you need here.
  // ...
});
