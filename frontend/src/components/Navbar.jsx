import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    N Queens
                </Link>
                <div className="navbar-links">
                    <Link
                        to="/"
                        className={`navbar-link ${isActive('/') ? 'active' : ''}`}
                    >
                        Home
                    </Link>
                    <Link
                        to="/play"
                        className={`navbar-link ${isActive('/play') ? 'active' : ''}`}
                    >
                        Play
                    </Link>
                    <Link
                        to="/simulation"
                        className={`navbar-link ${isActive('/simulation') ? 'active' : ''}`}
                    >
                        Simulation
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
