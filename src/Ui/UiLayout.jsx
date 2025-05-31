import { Nav, Container, Row, Button } from 'react-bootstrap';

const TabsLayout = ({
  tabs,
  activeTabId,
  setActiveTab,
  closeTab,
  sessionCleaner,
  isLoading,
}) => {
  return (
    <Container fluid>
      <Row>
        <Nav variant="tabs" className="ms-2" id="nav-tab">
          {tabs.map((tab) => (
            <Nav.Item key={tab.id}>
              <Nav.Link
                active={activeTabId === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
                {tab.closable && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    style={{ marginLeft: 8, cursor: "pointer", color: "red" }}
                  >
                    &times;
                  </span>
                )}
              </Nav.Link>
            </Nav.Item>
          ))}
        </Nav>
      </Row>
      <Row className="mt-3 px-3">
        {tabs.find((tab) => tab.id === activeTabId)?.component || null}
      </Row>
    </Container>
  );
};

export default TabsLayout;
