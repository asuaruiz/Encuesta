import React from 'react';
import logo from './images/logo.png'; // Ajusta la ruta de importación según la ubicación de tu archivo de imagen

function Header() {
  return (
    <header>
      {/* Agrega contenido del encabezado, como un título o un menú de navegación */}
      
      <nav className="navbar navbar-expand-lg navbar-light">
        <div className="container-fluid">
        <img className='logo' src={logo} alt="Marketing Mind" />
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link active" aria-current="page" href="/">Home</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/encuesta">Encuesta</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/download">Download</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
