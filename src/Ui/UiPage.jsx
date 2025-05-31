import {useState} from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { showSuccess } from "../Utils/toastify";
import UiLayout from "./UiLayout";
import Config from "../TabsConfiguration/TabsComponents/Config";
import Portada from "../TabsConfiguration/TabsComponents/Portada";
import Usuario from "../TabsConfiguration/TabsComponents/Usuario";
import Probar from "../Probar"
import Probar2 from "./tabComponents/Probar2";
import DetallePaciente from "./tabComponents/DetallePaciente"; // 👈 supongamos que es tu componente de detalle

const UiPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  const [tabs, setTabs] = useState([
    {
      id: "pacientes",
      label: "Pacientes",
      component: <Probar2 openPaciente={handleOpenPaciente} />, // 👈 función pasada como prop
      closable: false,
    },
    {
      id: "portada",
      label: "Portada",
      component: <Portada />,
      closable: false,
    },
    {
      id: "users",
      label: "Usuarios",
      component: <Usuario />,
      closable: false,
    },
    {
      id: "imagenes",
      label: "Imágenes",
      component: <Config />,
      closable: false,
    },
    {
      id: "videos",
      label: "Videos",
      component: <Config />,
      closable: false,
    },
    {
      id: "config",
      label: "Configuración",
      component: <Config />,
      closable: false,
    },
  ]);

  const [activeTabId, setActiveTabId] = useState("pacientes");

  const handleTabChange = (tabId) => {
    setActiveTabId(tabId);
    navigate(`/#?tab=${tabId}`);
  };

  function handleOpenPaciente(paciente) {
  const newTabId = `paciente-${paciente.id}`;

  setTabs(prevTabs => {
    // Elimina si ya existe, para evitar duplicados y reordenar
    const filtered = prevTabs.filter(tab => tab.id !== newTabId);
    return [
      ...filtered,
      {
        id: newTabId,
        label: `Paciente ${paciente.nombre}`,
        component: <DetallePaciente paciente={paciente} onClose={handleCloseTab} />,
        closable: true,
      }
    ];
  });

  setActiveTabId(newTabId);
}

  const handleCloseTab = (tabId) => {
    const newTabs = tabs.filter((tab) => tab.id !== tabId);
    setTabs(newTabs);

    // Si cierran el tab activo, volver a "pacientes"
    if (tabId === activeTabId) {
      setActiveTabId("pacientes");
    }
  };

  const sessionCleaner = async () => {
    if (isLoading) return;
    setIsLoading(true);
    alert("Cerramos...");
    showSuccess("Sesión cerrada");
    navigate("/");
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <div>...Loading</div>}
      <UiLayout
        tabs={tabs}
        activeTabId={activeTabId}
        setActiveTab={handleTabChange}
        closeTab={handleCloseTab}
        sessionCleaner={sessionCleaner}
        isLoading={isLoading}
      />
      <Probar/>
    </>
  );
};

export default UiPage;
