import { NavLink } from 'react-router-dom';

function Header() {
  return (
    <header style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '20px',
      marginBottom: '20px'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <h1 style={{ margin: 0 }}>
          <NavLink to="/" style={{ color: 'white', textDecoration: 'none' }}>
            📝 My Blog
          </NavLink>
        </h1>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <NavLink 
            to="/"
            style={({ isActive }) => ({
              color: isActive ? '#f1c40f' : 'white',
              textDecoration: 'none'
            })}
          >
            Home
          </NavLink>
          
          <NavLink 
            to="/create"
            style={({ isActive }) => ({
              color: isActive ? '#f1c40f' : 'white',
              textDecoration: 'none'
            })}
          >
            Create Post
          </NavLink>
          
          <NavLink 
            to="/about"
            style={({ isActive }) => ({
              color: isActive ? '#f1c40f' : 'white',
              textDecoration: 'none'
            })}
          >
            About
          </NavLink>
        </div>
      </nav>
    </header>
  );
}

export default Header;