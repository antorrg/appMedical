# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list


<hr>

## Intento con prisma

Sí, después de cualquier cambio en el schema de Prisma necesitas generar el cliente Prisma. El orden completo sería:

1. Después del `prisma init`:
```bash
npx prisma generate
```

2. Luego de crear o modificar el schema:
```bash
npx prisma migrate dev --name init
```
Esto creará la migración y volverá a generar el cliente automáticamente.

3. Si solo modificas el schema y quieres actualizar la base de datos en desarrollo:
```bash
npx prisma db push
```

En producción, usarías:
```bash
npx prisma migrate deploy
```

El comando `generate` es crucial porque:
- Genera el cliente de Prisma con los tipos TypeScript
- Crea las definiciones de tipos basadas en tu schema
- Prepara el cliente para ser usado en tu aplicación

Sin el `generate`, obtendrás errores al intentar usar el cliente de Prisma en tu aplicación. ¿Quieres que te muestre cómo integrar esto en tu flujo de desarrollo con Electron?


<hr>
Perfecto. Tu aplicación se parece a un **sistema de gestión de pacientes**, con fichas clínicas/historial, y al parecer se trata de una **aplicación de escritorio (Electron)**, así que lo ideal es que todo sea fluido y ordenado dentro de una sola ventana, estilo SPA (single-page application).

Basado en lo que mencionas, aquí va una orientación sobre **cómo deberías estructurar tus rutas**, qué vistas necesitas y cómo podrías nombrarlas.

---

## 🧠 Concepto clave: Fichas clínicas digitales

Tu app tiene al menos estas entidades:

* Pacientes
* Fichas clínicas o historial médico (por fecha, o por evento)
* Posiblemente profesionales que atienden (o uno único)
* Posiblemente diagnósticos, recetas, archivos, etc.

---

## 🗺️ Propuesta de rutas (SPA estilo `react-router-dom`)

| Ruta                          | Propósito                                           |
| ----------------------------- | --------------------------------------------------- |
| `/`                           | Página principal (puede ser un dashboard o resumen) |
| `/pacientes`                  | Lista de pacientes                                  |
| `/pacientes/nuevo`            | Formulario para registrar un nuevo paciente         |
| `/pacientes/:id`              | Vista del perfil de un paciente específico          |
| `/pacientes/:id/editar`       | Editar los datos del paciente                       |
| `/pacientes/:id/fichas`       | Lista de fichas/historial clínico del paciente      |
| `/pacientes/:id/fichas/nueva` | Crear nueva ficha clínica para el paciente          |
| `/fichas/:id`                 | Ver ficha clínica específica                        |
| `/fichas/:id/editar`          | Editar ficha clínica                                |
| `/configuracion`              | Configuración del sistema o del usuario             |

> Puedes agregar también una ruta como `/buscar` para una búsqueda general por paciente, ficha, etc.

---

## 🧱 Estructura de componentes sugerida

```
src/
├── App.jsx
├── main.jsx
├── components/
│   ├── PacienteForm.jsx
│   ├── FichaForm.jsx
│   ├── Sidebar.jsx
│   └── Header.jsx
├── pages/
│   ├── Dashboard.jsx
│   ├── PacienteList.jsx
│   ├── PacienteDetail.jsx
│   ├── FichaList.jsx
│   ├── FichaDetail.jsx
│   ├── FichaEdit.jsx
│   └── Configuracion.jsx
```

---

## 🧭 Ejemplo con `react-router-dom`

```jsx
import { HashRouter, Routes, Route } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import PacienteList from './pages/PacienteList';
import PacienteDetail from './pages/PacienteDetail';
import FichaList from './pages/FichaList';
import FichaDetail from './pages/FichaDetail';
import Configuracion from './pages/Configuracion';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/pacientes" element={<PacienteList />} />
        <Route path="/pacientes/nuevo" element={<PacienteForm />} />
        <Route path="/pacientes/:id" element={<PacienteDetail />} />
        <Route path="/pacientes/:id/editar" element={<PacienteForm edit />} />
        <Route path="/pacientes/:id/fichas" element={<FichaList />} />
        <Route path="/pacientes/:id/fichas/nueva" element={<FichaForm />} />
        <Route path="/fichas/:id" element={<FichaDetail />} />
        <Route path="/fichas/:id/editar" element={<FichaForm edit />} />
        <Route path="/configuracion" element={<Configuracion />} />
      </Routes>
    </HashRouter>
  );
}
```

---

## 🛠️ Bonus: cómo navegar

* Desde la lista de pacientes → clic en uno → `/pacientes/123`
* Desde la ficha del paciente → clic en "Ver historial" → `/pacientes/123/fichas`
* Desde allí → clic en ficha → `/fichas/456`

---

## 💾 Base de datos SQLite

Ya que tienes tu base de datos SQLite, puedes usarla directamente en el proceso principal de Electron. Si quieres, te puedo ayudar también a:

* Leer y escribir pacientes y fichas con SQLite
* Conectar la lógica a tus rutas React
* Usar algo como **`better-sqlite3`** o **`sqlite3`** en el proceso main y exponer funciones con `ipcRenderer`

---

## ¿Quieres que te prepare una estructura base de React + Electron con estas rutas y navegación? ¿O una pequeña demo de cómo conectar tu base de datos SQLite con React usando IPC?
