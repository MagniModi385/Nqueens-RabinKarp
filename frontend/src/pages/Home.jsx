import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home">
            <section className="hero">
                <h1>Learn the N Queens Problem</h1>
                <p className="hero-subtitle">
                    An interactive way to understand backtracking through the classic chess puzzle
                </p>
            </section>

            <section className="modes">
                <div className="mode-card">
                    <div className="mode-icon">♛</div>
                    <h2>Play Mode</h2>
                    <p>
                        Challenge yourself to solve the N Queens puzzle. Place queens on the board
                        and learn from your mistakes as the game guides you through the solution.
                    </p>
                    <Link to="/play" className="btn btn-primary">
                        Start Playing
                    </Link>
                </div>

                <div className="mode-card">
                    <div className="mode-icon">▶</div>
                    <h2>Simulation Mode</h2>
                    <p>
                        Watch the backtracking algorithm in action. See step-by-step how the
                        computer solves the puzzle by trying positions and backtracking when needed.
                    </p>
                    <Link to="/simulation" className="btn">
                        Watch Simulation
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default Home;
