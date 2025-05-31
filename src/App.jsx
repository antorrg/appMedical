import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Probar from "./Probar";
import TabsLayout from "./TabsConfiguration/TabsLayout";
import TabsPage from "./TabsConfiguration/TabsPage";
import UiPage from "./Ui/UiPage";

function App() {
  //Funciones cambio de darkMode
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    //localStorage.getItem('theme')
    localStorage.setItem("theme", newTheme);
  };
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
    //localStorage.setItem('theme', theme);
    localStorage.getItem("theme");
  }, [theme]);

  return (
    <div className={`app ${theme}-mode`}>
      <div className="container-sm coverComponent">
      <button
        onClick={toggleTheme}
        className="btn btn-sm btn-outline-secondary position-fixed top-0 end-0 m-3"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>
        <Routes>
          <Route path='/' element={<UiPage/>}/>
          <Route path='/home' element={<TabsPage/>}/>
        </Routes>
      </div>
    </div>
  );
}

export default App;
