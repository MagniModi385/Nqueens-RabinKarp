import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
    const location = useLocation();
    const isRabinKarp = location.pathname === '/rabinkarp';

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`navbar ${isRabinKarp ? 'navbar-dark' : ''}`}>
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Algorithm Visualizer
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
                        N-Queens
                    </Link>
                    <Link
                        to="/simulation"
                        className={`navbar-link ${isActive('/simulation') ? 'active' : ''}`}
                    >
                        Simulation
                    </Link>
                    <Link
                        to="/rabinkarp"
                        className={`navbar-link ${isActive('/rabinkarp') ? 'active' : ''}`}
                    >
                        Rabin-Karp
                    </Link>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
