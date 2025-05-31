"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(channel, listener) {
    return electron.ipcRenderer.on(channel, (event, ...args) => listener(event, ...args));
  },
  off(channel, listener) {
    return electron.ipcRenderer.off(channel, listener);
  },
  send(channel, ...args) {
    return electron.ipcRenderer.send(channel, ...args);
  },
  invoke(channel, ...args) {
    return electron.ipcRenderer.invoke(channel, ...args);
  },
  /*getPatients: () => ipcRenderer.invoke('getPatients'),
  getPatient: (id) => ipcRenderer.invoke('getPatient', id),
  addPatient: (patient) => ipcRenderer.invoke('addPatient', patient),
  updatePatient: (patient) => ipcRenderer.invoke('updatePatient', patient),
  deletePatient: (id) => ipcRenderer.invoke('deletePatient', id)
  */
  // Patients
  getPatients: () => electron.ipcRenderer.invoke("getPatients"),
  getPatient: (id) => electron.ipcRenderer.invoke("getPatient", id),
  createPatient: (patientData) => electron.ipcRenderer.invoke("createPatient", patientData),
  updatePatient: (id, patientData) => electron.ipcRenderer.invoke("updatePatient", id, patientData),
  deletePatient: (id) => electron.ipcRenderer.invoke("deletePatient", id),
  // Medical Records (ejemplo)
  getMedicalRecords: (patientId) => electron.ipcRenderer.invoke("getMedicalRecords", patientId),
  createMedicalRecord: (recordData) => electron.ipcRenderer.invoke("createMedicalRecord", recordData),
  // Medications (ejemplo)
  getMedications: (patientId) => electron.ipcRenderer.invoke("getMedications", patientId),
  createMedication: (medicationData) => electron.ipcRenderer.invoke("createMedication", medicationData),
  // Evolution Notes (ejemplo)
  getEvolutionNotes: (patientId) => electron.ipcRenderer.invoke("getEvolutionNotes", patientId),
  createEvolutionNote: (noteData) => electron.ipcRenderer.invoke("createEvolutionNote", noteData),
  // Treatments (ejemplo)
  getTreatments: (patientId) => electron.ipcRenderer.invoke("getTreatments", patientId),
  createTreatment: (treatmentData) => electron.ipcRenderer.invoke("createTreatment", treatmentData),
  // Utilities (ejemplo)
  exportData: () => electron.ipcRenderer.invoke("exportData"),
  importData: (filePath) => electron.ipcRenderer.invoke("importData", filePath)
  // You can expose other APIs you need here.
  // ...
});
