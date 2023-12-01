import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CSVProcessor from './encuesta';
import Home from './Home';
import 'bootstrap/dist/js/bootstrap.bundle.min';

import Header from './Header'; // Importa el componente de encabezado

function App() {
  return (
    <Router>
      <div className="App">
        {/* Renderiza el componente de encabezado */}
        <Header />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/encuesta" element={<CSVProcessor />} />
          {/* Definir otras rutas y componentes aquí */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
