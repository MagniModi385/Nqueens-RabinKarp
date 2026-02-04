import { useState, useCallback, useEffect } from 'react';
import Chessboard from '../components/Chessboard';
import './Play.css';

const API_URL = 'http://localhost:8000';

// Pre-computed solution counts
const SOLUTION_COUNTS = {
    4: 2,
    5: 10,
    6: 4,
    7: 40,
    8: 92
};

function Play() {
    const [n, setN] = useState(4);
    const [board, setBoard] = useState(createEmptyBoard(4));
    const [message, setMessage] = useState({ text: '', type: '' });
    const [conflicts, setConflicts] = useState([]);
    const [queensPlaced, setQueensPlaced] = useState(0);
    const [gameWon, setGameWon] = useState(false);

    function createEmptyBoard(size) {
        return Array(size).fill(null).map(() => Array(size).fill(0));
    }

    const handleNChange = (newN) => {
        setN(newN);
        setBoard(createEmptyBoard(newN));
        setMessage({ text: '', type: '' });
        setConflicts([]);
        setQueensPlaced(0);
        setGameWon(false);
    };

    const handleCellClick = useCallback(async (row, col) => {
        if (gameWon) return;

        // If there's already a queen, remove it
        if (board[row][col] === 1) {
            const newBoard = board.map(r => [...r]);
            newBoard[row][col] = 0;
            setBoard(newBoard);
            setQueensPlaced(q => q - 1);
            setMessage({ text: 'Queen removed.', type: 'info' });
            setConflicts([]);
            return;
        }

        // Validate the move
        try {
            const response = await fetch(`${API_URL}/api/nqueens/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ n, board, row, col })
            });
            const data = await response.json();

            if (data.valid) {
                const newBoard = board.map(r => [...r]);
                newBoard[row][col] = 1;
                setBoard(newBoard);
                setConflicts([]);
                const newQueensCount = queensPlaced + 1;
                setQueensPlaced(newQueensCount);

                if (newQueensCount === n) {
                    setMessage({ text: '🎉 Congratulations! You solved it!', type: 'success' });
                    setGameWon(true);
                } else {
                    setMessage({ text: `Queen placed! ${n - newQueensCount} more to go.`, type: 'success' });
                }
            } else {
                setMessage({ text: data.message, type: 'error' });
                setConflicts(data.conflicts);

                // Clear conflict highlight after 1.5 seconds
                setTimeout(() => setConflicts([]), 1500);
            }
        } catch (error) {
            setMessage({ text: 'Error connecting to server. Make sure backend is running.', type: 'error' });
        }
    }, [board, n, queensPlaced, gameWon]);

    const handleReset = () => {
        setBoard(createEmptyBoard(n));
        setMessage({ text: '', type: '' });
        setConflicts([]);
        setQueensPlaced(0);
        setGameWon(false);
    };

    const handleHint = async () => {
        try {
            const response = await fetch(`${API_URL}/api/nqueens/hint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ n, board })
            });
            const data = await response.json();
            setMessage({ text: `💡 Hint: ${data.message}`, type: 'info' });
        } catch (error) {
            setMessage({ text: 'Error connecting to server.', type: 'error' });
        }
    };

    return (
        <div className="play-page">
            <div className="play-header">
                <h1>Play N Queens</h1>
                <p>Place {n} queens on the board so that no two queens can attack each other.</p>
            </div>

            <div className="play-controls">
                <div className="select-wrapper">
                    <label htmlFor="n-select">Board Size:</label>
                    <select
                        id="n-select"
                        className="select"
                        value={n}
                        onChange={(e) => handleNChange(Number(e.target.value))}
                    >
                        {[4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>{num} × {num}</option>
                        ))}
                    </select>
                </div>

                <div className="play-stats">
                    <span className="stat">Queens: {queensPlaced}/{n}</span>
                    <span className="stat solution-count">Possible Solutions: {SOLUTION_COUNTS[n]}</span>
                </div>
            </div>

            <div className="play-content">
                <div className="board-container">
                    <Chessboard
                        n={n}
                        board={board}
                        onCellClick={handleCellClick}
                        conflicts={conflicts}
                        disabled={gameWon}
                    />
                </div>

                <div className="play-sidebar">
                    <div className="action-buttons">
                        <button className="btn" onClick={handleHint} disabled={gameWon}>
                            Get Hint
                        </button>
                        <button className="btn" onClick={handleReset}>
                            Reset Board
                        </button>
                    </div>

                    {message.text && (
                        <div className={`message message-${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="rules-card">
                        <h3>Rules</h3>
                        <ul>
                            <li>Click a cell to place a queen</li>
                            <li>Click a queen to remove it</li>
                            <li>Queens cannot share a row, column, or diagonal</li>
                            <li>Place all {n} queens to win!</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Play;
