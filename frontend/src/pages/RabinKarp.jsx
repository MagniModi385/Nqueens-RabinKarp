import { useState, useEffect, useRef } from 'react';
import './RabinKarp.css';

const API_URL = 'http://localhost:8000';

function RabinKarp() {
    const [text, setText] = useState('ABABDABACDABABCABAB');
    const [pattern, setPattern] = useState('ABABC');
    const [steps, setSteps] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState([]);
    const [hasSearched, setHasSearched] = useState(false);
    const intervalRef = useRef(null);
    const speed = 800;

    const handleSearch = async () => {
        if (!text || !pattern) return;

        setLoading(true);
        setIsPlaying(false);
        setCurrentStep(0);
        setHasSearched(true);

        try {
            const response = await fetch(`${API_URL}/api/rabinkarp/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, pattern })
            });
            const data = await response.json();
            setSteps(data.steps);
            setMatches(data.matches);
        } catch (error) {
            console.error('Error:', error);
            setSteps([]);
            setMatches([]);
        }

        setLoading(false);
    };

    useEffect(() => {
        if (isPlaying && steps.length > 0) {
            intervalRef.current = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= steps.length - 1) {
                        setIsPlaying(false);
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
    }, [isPlaying, steps.length]);

    const handlePlayPause = () => {
        if (currentStep >= steps.length - 1) {
            setCurrentStep(0);
        }
        setIsPlaying(!isPlaying);
    };

    const handleStepForward = () => {
        setIsPlaying(false);
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleStepBackward = () => {
        setIsPlaying(false);
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleReset = () => {
        setIsPlaying(false);
        setCurrentStep(0);
    };

    const currentStepData = steps[currentStep];
    const highlightIndices = currentStepData?.highlight_indices || [];

    const getCharClass = (index) => {
        let classes = ['char'];
        if (highlightIndices.includes(index)) {
            classes.push('char-highlight');
            if (currentStepData?.is_match) {
                classes.push('char-match');
            }
        }
        return classes.join(' ');
    };

    const getStepTypeClass = (stepType) => {
        switch (stepType) {
            case 'match_found': return 'step-match';
            case 'hash_match': return 'step-hash-match';
            case 'no_match': return 'step-no-match';
            case 'slide_window': return 'step-slide';
            default: return 'step-default';
        }
    };

    return (
        <div className="rabinkarp-page">
            <div className="rk-header">
                <h1>Rabin-Karp Algorithm</h1>
                <p>Pattern matching using rolling hash</p>
            </div>

            <div className="rk-input-section">
                <div className="input-group">
                    <label htmlFor="text-input">Text:</label>
                    <input
                        id="text-input"
                        type="text"
                        className="rk-input"
                        value={text}
                        onChange={(e) => setText(e.target.value.toUpperCase())}
                        placeholder="Enter text to search in..."
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="pattern-input">Pattern:</label>
                    <input
                        id="pattern-input"
                        type="text"
                        className="rk-input"
                        value={pattern}
                        onChange={(e) => setPattern(e.target.value.toUpperCase())}
                        placeholder="Enter pattern to find..."
                    />
                </div>
                <button
                    className="rk-btn rk-btn-primary"
                    onClick={handleSearch}
                    disabled={loading || !text || !pattern}
                >
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </div>

            {hasSearched && steps.length > 0 && (
                <>
                    <div className="rk-visualization">
                        <div className="text-display">
                            <div className="text-label">Text:</div>
                            <div className="text-chars">
                                {text.split('').map((char, index) => (
                                    <span
                                        key={index}
                                        className={getCharClass(index)}
                                        data-index={index}
                                    >
                                        {char}
                                    </span>
                                ))}
                            </div>
                            <div className="index-labels">
                                {text.split('').map((_, index) => (
                                    <span key={index} className="index-label">{index}</span>
                                ))}
                            </div>
                        </div>

                        <div className="pattern-display">
                            <div className="text-label">Pattern:</div>
                            <div className="text-chars pattern-chars">
                                {pattern.split('').map((char, index) => (
                                    <span key={index} className="char char-pattern">{char}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="rk-controls">
                        <div className="playback-controls">
                            <button
                                className="rk-btn rk-btn-sm"
                                onClick={handleStepBackward}
                                disabled={currentStep === 0 || loading}
                            >
                                ◀ Prev
                            </button>
                            <button
                                className="rk-btn rk-btn-primary"
                                onClick={handlePlayPause}
                                disabled={loading || steps.length === 0}
                            >
                                {isPlaying ? '⏸ Pause' : '▶ Play'}
                            </button>
                            <button
                                className="rk-btn rk-btn-sm"
                                onClick={handleStepForward}
                                disabled={currentStep >= steps.length - 1 || loading}
                            >
                                Next ▶
                            </button>
                            <button
                                className="rk-btn"
                                onClick={handleReset}
                                disabled={loading}
                            >
                                Reset
                            </button>
                        </div>
                    </div>

                    <div className="rk-info-panel">
                        <div className="step-counter">
                            Step {currentStep + 1} of {steps.length}
                        </div>

                        {currentStepData && (
                            <>
                                <div className="hash-display">
                                    <div className="hash-item">
                                        <span className="hash-label">Pattern Hash:</span>
                                        <span className="hash-value">{currentStepData.pattern_hash}</span>
                                    </div>
                                    <div className="hash-item">
                                        <span className="hash-label">Window Hash:</span>
                                        <span className="hash-value">{currentStepData.window_hash}</span>
                                    </div>
                                </div>

                                <div className={`step-message ${getStepTypeClass(currentStepData.step_type)}`}>
                                    {currentStepData.message}
                                </div>
                            </>
                        )}

                        {currentStep === steps.length - 1 && (
                            matches.length > 0 ? (
                                <div className="matches-summary">
                                    <strong>Matches found at indices:</strong> {matches.join(', ')}
                                </div>
                            ) : (
                                <div className="no-match-found">
                                    <strong>No matching string found!</strong> The pattern "{pattern}" does not exist in the given text.
                                </div>
                            )
                        )}
                    </div>

                    <div className="rk-hash-formula">
                        <h2>📐 Pattern Hash Calculation</h2>
                        <div className="formula-box">
                            hash(s) = (s[0]×d^(m-1) + s[1]×d^(m-2) + ... + s[m-1]×d^0) mod q
                        </div>
                        <div className="formula-explanation">
                            <p><strong>Where:</strong></p>
                            <p>• <code>s[i]</code> = ASCII value of character at position i</p>
                            <p>• <code>d</code> = Number of characters in the alphabet (typically 256 for ASCII)</p>
                            <p>• <code>m</code> = Length of the pattern</p>
                            <p>• <code>q</code> = A prime number to reduce hash collisions (e.g., 101)</p>
                            <p><strong>Rolling Hash Update:</strong> When sliding the window, the new hash is computed as:</p>
                            <p><code>new_hash = (d × (old_hash - s[i]×d^(m-1)) + s[i+m]) mod q</code></p>
                        </div>
                    </div>

                    <div className="rk-complexity">
                        <h2>⏱️ Time Complexity</h2>
                        <div className="complexity-grid">
                            <div className="complexity-item">
                                <div className="complexity-label">Best Case</div>
                                <div className="complexity-value">O(n + m)</div>
                                <div className="complexity-desc">When no hash collisions occur</div>
                            </div>
                            <div className="complexity-item">
                                <div className="complexity-label">Average Case</div>
                                <div className="complexity-value">O(n + m)</div>
                                <div className="complexity-desc">With good hash function, few collisions</div>
                            </div>
                            <div className="complexity-item">
                                <div className="complexity-label">Worst Case</div>
                                <div className="complexity-value">O(n × m)</div>
                                <div className="complexity-desc">When all hash values match (spurious hits)</div>
                            </div>
                        </div>
                    </div>

                    <div className="rk-explanation">
                        <h2>How Rabin-Karp Works</h2>
                        <ol>
                            <li><strong>Compute Pattern Hash:</strong> Calculate a hash value for the pattern using the polynomial rolling hash formula.</li>
                            <li><strong>Compute Window Hash:</strong> Calculate hash for each window of text (same length as pattern).</li>
                            <li><strong>Compare Hashes:</strong> If hashes match, verify characters to avoid false positives (spurious hits).</li>
                            <li><strong>Rolling Hash:</strong> Efficiently compute next window's hash using previous hash in O(1) time.</li>
                        </ol>
                    </div>
                </>
            )}

            {hasSearched && steps.length === 0 && !loading && (
                <div className="no-results">
                    Pattern is longer than text or empty. Please check your inputs.
                </div>
            )}
        </div>
    );
}

export default RabinKarp;
