import { useState, useEffect, useRef } from 'react';
import Chessboard from '../components/Chessboard';
import './Simulation.css';

const API_URL = 'http://localhost:8000';

// Pre-computed solution counts
const SOLUTION_COUNTS = {
    4: 2,
    5: 10,
    6: 4,
    7: 40,
    8: 92
};

function Simulation() {
    const [n, setN] = useState(4);
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const speed = 1000; // Fixed slow speed
    const [loading, setLoading] = useState(false);
    const [highlightedCell, setHighlightedCell] = useState(null);
    const [currentSolution, setCurrentSolution] = useState(0);
    const [showNextPrompt, setShowNextPrompt] = useState(false);
    const intervalRef = useRef(null);

    const totalSolutions = SOLUTION_COUNTS[n] || 0;
    const canShowMultipleSolutions = n <= 6;

    const createEmptyBoard = (size) => {
        return Array(size).fill(null).map(() => Array(size).fill(0));
    };

    const fetchSteps = async (boardSize, solutionIndex = 0) => {
        setLoading(true);
        setIsPlaying(false);
        setCurrentStep(0);
        setHighlightedCell(null);
        setShowNextPrompt(false);

        try {
            const response = await fetch(`${API_URL}/api/nqueens/solve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ n: boardSize, solution_index: solutionIndex })
            });
            const data = await response.json();
            setSteps(data.steps);
        } catch (error) {
            console.error('Error fetching solution:', error);
            setSteps([]);
        }

        setLoading(false);
    };

    useEffect(() => {
        setCurrentSolution(0);
        fetchSteps(n, 0);
    }, [n]);

    useEffect(() => {
        if (isPlaying && steps.length > 0) {
            intervalRef.current = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= steps.length - 1) {
                        setIsPlaying(false);
                        // Show next solution prompt if applicable
                        if (canShowMultipleSolutions && currentSolution < totalSolutions - 1) {
                            setShowNextPrompt(true);
                        }
                        return prev;
                    }
                    return prev + 1;
                });
            }, speed);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPlaying, steps.length, canShowMultipleSolutions, currentSolution, totalSolutions]);

    useEffect(() => {
        if (steps[currentStep]) {
            const step = steps[currentStep];
            if (step.row >= 0 && step.col >= 0) {
                setHighlightedCell([step.row, step.col]);
            } else {
                setHighlightedCell(null);
            }
        }
    }, [currentStep, steps]);

    const handleNChange = (newN) => {
        setN(newN);
        setIsPlaying(false);
        setCurrentSolution(0);
        fetchSteps(newN, 0);
    };

    const handlePlayPause = () => {
        if (currentStep >= steps.length - 1) {
            setCurrentStep(0);
            setShowNextPrompt(false);
        }
        setIsPlaying(!isPlaying);
    };

    const handleStepForward = () => {
        setIsPlaying(false);
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else if (canShowMultipleSolutions && currentSolution < totalSolutions - 1) {
            setShowNextPrompt(true);
        }
    };

    const handleStepBackward = () => {
        setIsPlaying(false);
        setShowNextPrompt(false);
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleReset = () => {
        setIsPlaying(false);
        setCurrentStep(0);
        setHighlightedCell(null);
        setShowNextPrompt(false);
    };

    const handleNextSolution = () => {
        const nextSolution = currentSolution + 1;
        setCurrentSolution(nextSolution);
        setShowNextPrompt(false);
        fetchSteps(n, nextSolution);
    };

    const handlePrevSolution = () => {
        if (currentSolution > 0) {
            const prevSolution = currentSolution - 1;
            setCurrentSolution(prevSolution);
            setShowNextPrompt(false);
            fetchSteps(n, prevSolution);
        }
    };

    const currentBoard = steps[currentStep]?.board || createEmptyBoard(n);
    const currentMessage = steps[currentStep]?.message || 'Load a simulation to begin.';
    const currentStepType = steps[currentStep]?.step_type || '';

    const getStepTypeLabel = (type) => {
        switch (type) {
            case 'place': return 'PLACING';
            case 'backtrack': return 'BACKTRACKING';
            case 'solution': return 'SOLVED!';
            default: return '';
        }
    };

    return (
        <div className="simulation-page">
            <div className="simulation-header">
                <h1>Backtracking Simulation</h1>
                <p>Watch how the algorithm solves the N Queens problem step by step.</p>
            </div>

            <div className="simulation-controls">
                <div className="select-wrapper">
                    <label htmlFor="n-select">Board Size:</label>
                    <select
                        id="n-select"
                        className="select"
                        value={n}
                        onChange={(e) => handleNChange(Number(e.target.value))}
                        disabled={loading}
                    >
                        {[4, 5, 6, 7, 8].map(num => (
                            <option key={num} value={num}>{num} × {num}</option>
                        ))}
                    </select>
                </div>

                <div className="solution-info">
                    <span className="solution-count">Possible Solutions: {totalSolutions}</span>
                </div>
            </div>

            <div className="simulation-content">
                <div className="board-container">
                    <Chessboard
                        n={n}
                        board={currentBoard}
                        highlightedCell={highlightedCell}
                        disabled={true}
                    />
                </div>

                <div className="simulation-sidebar">
                    <div className="playback-controls">
                        <button
                            className="btn btn-sm"
                            onClick={handleStepBackward}
                            disabled={currentStep === 0 || loading}
                        >
                            ◀ Prev
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handlePlayPause}
                            disabled={loading || steps.length === 0}
                        >
                            {isPlaying ? '⏸ Pause' : '▶ Play'}
                        </button>
                        <button
                            className="btn btn-sm"
                            onClick={handleStepForward}
                            disabled={currentStep >= steps.length - 1 || loading}
                        >
                            Next ▶
                        </button>
                    </div>

                    <button
                        className="btn"
                        onClick={handleReset}
                        disabled={loading}
                        style={{ width: '100%', marginTop: 'var(--space-sm)' }}
                    >
                        Reset
                    </button>

                    {canShowMultipleSolutions && (
                        <div className="solution-navigation">
                            <span className="solution-label">
                                Solution {currentSolution + 1} of {totalSolutions}
                            </span>
                            <div className="solution-buttons">
                                <button
                                    className="btn btn-sm"
                                    onClick={handlePrevSolution}
                                    disabled={currentSolution === 0 || loading}
                                >
                                    ◀ Prev Solution
                                </button>
                                <button
                                    className="btn btn-sm"
                                    onClick={handleNextSolution}
                                    disabled={currentSolution >= totalSolutions - 1 || loading}
                                >
                                    Next Solution ▶
                                </button>
                            </div>
                        </div>
                    )}

                    {showNextPrompt && canShowMultipleSolutions && currentSolution < totalSolutions - 1 && (
                        <div className="next-solution-prompt">
                            <p>Solution complete! Would you like to see the next one?</p>
                            <button className="btn btn-primary" onClick={handleNextSolution}>
                                Show Next Solution
                            </button>
                        </div>
                    )}

                    <div className="step-info">
                        <div className="step-counter">
                            Step {currentStep + 1} of {steps.length}
                        </div>
                        <div className="total-moves">
                            Total Moves: {steps.length}
                        </div>
                    </div>

                    {currentStepType && (
                        <div className={`step-type step-type-${currentStepType}`}>
                            {getStepTypeLabel(currentStepType)}
                        </div>
                    )}

                    <div className="step-message">
                        {loading ? 'Loading simulation...' : currentMessage}
                    </div>

                    <div className="legend">
                        <h3>Legend</h3>
                        <div className="legend-item">
                            <span className="legend-color legend-place"></span>
                            <span>Placing queen</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color legend-backtrack"></span>
                            <span>Backtracking</span>
                        </div>
                        <div className="legend-item">
                            <span className="legend-color legend-solution"></span>
                            <span>Solution found</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="algorithm-explanation">
                <h2>How Backtracking Works</h2>
                <div className="explanation-content">
                    <ol>
                        <li><strong>Start at row 0:</strong> Try to place a queen in the first valid column.</li>
                        <li><strong>Move to next row:</strong> After placing a queen, move to the next row and repeat.</li>
                        <li><strong>Check validity:</strong> A position is valid if no other queen can attack it.</li>
                        <li><strong>Backtrack:</strong> If no valid position exists in the current row, remove the last queen and try the next column in the previous row.</li>
                        <li><strong>Solution:</strong> When all N queens are placed successfully, we have a solution!</li>
                    </ol>
                </div>
            </div>
        </div>
    );
}

export default Simulation;
