import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Logo from './movie.png'
import './Navbar.css'

function BasicExample() {
  return (
    <Navbar expand="lg" className="navbar">
      <Container>
        <Navbar.Brand href="/" className='p-2' style={{fontWeight:'500'}}><img src={Logo} alt="" style={{width:'2rem'}}/>&nbsp; Recommender AI</Navbar.Brand> 
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto icons">
            <Nav.Link href="https://www.linkedin.com/in/halilfurkankarademir/"><i className="bi bi-linkedin"></i></Nav.Link>
            <Nav.Link href="https://github.com/halilfurkankarademir"><i className="bi bi-github"></i></Nav.Link>
            <Nav.Link href="https://www.instagram.com/halilfurkankarademir/"><i className="bi bi-instagram"></i></Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default BasicExample;