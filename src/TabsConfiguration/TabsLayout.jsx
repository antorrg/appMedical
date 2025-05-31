import { Nav, Container, Row } from 'react-bootstrap';


const TabsLayout = ({ activeTab, handleTabChange, sessionCleaner, isLoading, children }) => {
 
  return (
    <div>
      <div className="">
        <Container className="coverAdmin pb-3">
          <Row>
            {/* Navegación por tabs */}
            <Nav variant="tabs" className="ms-2 mb-0" id="nav-tab" role="tablist">
            <Nav.Item>
                <Nav.Link onClick={() => handleTabChange('pacientes')} active={activeTab === 'pacientes'}>
                  Pacientes
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => handleTabChange('portada')} active={activeTab === 'portada'}>
                  Portada
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => handleTabChange('users')} active={activeTab === 'users'}>
                  Usuarios
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => handleTabChange('imagenes')} active={activeTab === 'imagenes'}>
                  Imágenes
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => handleTabChange('videos')} active={activeTab === 'videos'}>
                  Videos
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={() => handleTabChange('config')} active={activeTab === 'config'}>
                  Configuración
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link onClick={sessionCleaner} active={activeTab === 'logout'} disabled={isLoading}>
                  Cerrar sesión
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Row>
          <Container fluid className="d-flex flex-nowrap backgroundFormColor ">
            {/* Contenido dinámico */}
            {children}
          </Container>
        </Container>
      </div>
    </div>
  );
};

export default TabsLayout;
