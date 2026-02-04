import './Chessboard.css';

function Chessboard({
    n,
    board,
    onCellClick,
    conflicts = [],
    highlightedCell = null,
    disabled = false
}) {
    const isConflict = (row, col) => {
        return conflicts.some(([r, c]) => r === row && c === col);
    };

    const isHighlighted = (row, col) => {
        return highlightedCell && highlightedCell[0] === row && highlightedCell[1] === col;
    };

    const getCellClass = (row, col) => {
        const isLight = (row + col) % 2 === 0;
        let classes = ['cell', isLight ? 'cell-light' : 'cell-dark'];

        if (isConflict(row, col)) {
            classes.push('cell-conflict');
        }
        if (isHighlighted(row, col)) {
            classes.push('cell-highlighted');
        }
        if (board[row][col] === 1) {
            classes.push('cell-queen');
        }
        if (disabled) {
            classes.push('cell-disabled');
        }

        return classes.join(' ');
    };

    return (
        <div className="chessboard-wrapper">
            <div className="row-labels">
                {Array.from({ length: n }, (_, i) => (
                    <span key={i} className="label">{i + 1}</span>
                ))}
            </div>
            <div
                className="chessboard"
                style={{
                    gridTemplateColumns: `repeat(${n}, 1fr)`,
                    gridTemplateRows: `repeat(${n}, 1fr)`
                }}
            >
                {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={getCellClass(rowIndex, colIndex)}
                            onClick={() => !disabled && onCellClick && onCellClick(rowIndex, colIndex)}
                        >
                            {cell === 1 && <span className="queen">♛</span>}
                        </div>
                    ))
                )}
            </div>
            <div className="col-labels">
                {Array.from({ length: n }, (_, i) => (
                    <span key={i} className="label">{String.fromCharCode(65 + i)}</span>
                ))}
            </div>
        </div>
    );
}

export default Chessboard;
