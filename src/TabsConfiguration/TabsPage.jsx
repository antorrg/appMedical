import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { showSuccess } from "../Utils/toastify";
//import showConfirmationDialog from '../../Utils/sweetalert';
import TabsLayout from "./TabsLayout";
import Config from "./TabsComponents/Config";
import Portada from "./TabsComponents/Portada"
//import Loading from "../Loading";
import Usuario from "./TabsComponents/Usuario";
import Probar from "../Probar";

const TabsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  // Lee el parámetro "tab" de la URL. Si no existe, usa un valor predeterminado.
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get("tab") || "producto";

  const [activeTab, setActiveTab] = useState(initialTab);

  function handleTabChange (activeTab) {
    activeTab === "videos"
      ? navigate(`/#?tab=videos&subtab=facebook`)
      : navigate(`/#?tab=${activeTab}`); // Actualiza la URL.
    setActiveTab(activeTab);
  };
  
  const sessionCleaner = async () => {
    // const confirmed = await showConfirmationDialog(
    //   "¿Está seguro de cerrar sesión?"
    // );
    // if (confirmed) {
    // Si el usuario hace clic en "Aceptar", ejecutar la funcion:

    if (isLoading) return; // Prevenir múltiples clics
    setIsLoading(true);
    const response = alert('Cerramos...');
    if (response) {
      showSuccess("Sesión cerrada");
     navigate('/');
    }
    setIsLoading(false);
  };

  return (
    <>
      {isLoading ? <div>...Loading</div> : null}
      <TabsLayout
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        sessionCleaner={sessionCleaner}
        isLoading={isLoading}
      >
        {activeTab === "pacientes" && <Probar />}
        {activeTab === "portada" && <Portada />}
        {activeTab === "users" && <Usuario />}
        {activeTab === "imagenes" && <Config />}
        {activeTab === "videos" && <Config />}
        {activeTab === "config" && <Config />}
      </TabsLayout>
    </>
  );
};

export default TabsPage;
