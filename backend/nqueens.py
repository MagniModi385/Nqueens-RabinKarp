from typing import List, Tuple, Optional
from pydantic import BaseModel
from enum import Enum


class StepType(str, Enum):
    PLACE = "place"
    BACKTRACK = "backtrack"
    SOLUTION = "solution"


class SolveStep(BaseModel):
    step_type: StepType
    row: int
    col: int
    board: List[List[int]]
    message: str


class ValidateRequest(BaseModel):
    n: int
    board: List[List[int]]
    row: int
    col: int


class ValidateResponse(BaseModel):
    valid: bool
    message: str
    conflicts: List[Tuple[int, int]]


class SolveRequest(BaseModel):
    n: int
    solution_index: int = 0  # Which solution to show (0-indexed)


class SolveResponse(BaseModel):
    steps: List[SolveStep]
    total_solutions: int
    current_solution: int


class SolutionCountRequest(BaseModel):
    n: int


class SolutionCountResponse(BaseModel):
    n: int
    total_solutions: int


class HintRequest(BaseModel):
    n: int
    board: List[List[int]]


class HintResponse(BaseModel):
    has_hint: bool
    row: Optional[int] = None
    col: Optional[int] = None
    message: str


# Pre-computed solution counts for N Queens (well-known values)
SOLUTION_COUNTS = {
    4: 2,
    5: 10,
    6: 4,
    7: 40,
    8: 92
}


class NQueensSolver:
    """N Queens solver with step-by-step tracking for visualization."""
    
    def __init__(self, n: int):
        self.n = n
        self.board = [[0] * n for _ in range(n)]
        self.steps: List[SolveStep] = []
        self.solutions_found = 0
        self.all_solutions: List[List[List[int]]] = []
    
    def is_safe(self, row: int, col: int, board: List[List[int]] = None) -> Tuple[bool, List[Tuple[int, int]]]:
        """Check if placing a queen at (row, col) is safe. Returns (is_safe, conflicts)."""
        if board is None:
            board = self.board
        
        conflicts = []
        
        # Check column above
        for i in range(row):
            if board[i][col] == 1:
                conflicts.append((i, col))
        
        # Check upper-left diagonal
        i, j = row - 1, col - 1
        while i >= 0 and j >= 0:
            if board[i][j] == 1:
                conflicts.append((i, j))
            i -= 1
            j -= 1
        
        # Check upper-right diagonal
        i, j = row - 1, col + 1
        while i >= 0 and j < self.n:
            if board[i][j] == 1:
                conflicts.append((i, j))
            i -= 1
            j += 1
        
        return len(conflicts) == 0, conflicts
    
    def get_board_copy(self) -> List[List[int]]:
        """Return a copy of the current board state."""
        return [row[:] for row in self.board]
    
    def count_solutions(self, row: int = 0) -> int:
        """Count total solutions without tracking steps."""
        if row == self.n:
            self.all_solutions.append(self.get_board_copy())
            return 1
        
        count = 0
        for col in range(self.n):
            is_safe, _ = self.is_safe(row, col)
            if is_safe:
                self.board[row][col] = 1
                count += self.count_solutions(row + 1)
                self.board[row][col] = 0
        
        return count
    
    def solve_for_solution(self, target_solution: int, row: int = 0) -> bool:
        """Solve and record steps for a specific solution number."""
        if row == self.n:
            self.solutions_found += 1
            self.steps.append(SolveStep(
                step_type=StepType.SOLUTION,
                row=-1,
                col=-1,
                board=self.get_board_copy(),
                message=f"Solution #{self.solutions_found} found!"
            ))
            return self.solutions_found > target_solution
        
        for col in range(self.n):
            is_safe, _ = self.is_safe(row, col)
            if is_safe:
                self.board[row][col] = 1
                self.steps.append(SolveStep(
                    step_type=StepType.PLACE,
                    row=row,
                    col=col,
                    board=self.get_board_copy(),
                    message=f"Placing queen at row {row + 1}, column {col + 1}"
                ))
                
                if self.solve_for_solution(target_solution, row + 1):
                    return True
                
                self.board[row][col] = 0
                self.steps.append(SolveStep(
                    step_type=StepType.BACKTRACK,
                    row=row,
                    col=col,
                    board=self.get_board_copy(),
                    message=f"Backtracking from row {row + 1}, column {col + 1}"
                ))
        
        return False
    
    def get_hint(self, current_board: List[List[int]]) -> HintResponse:
        """Get a hint for the next valid move based on current board state."""
        first_empty_row = -1
        for row in range(self.n):
            if sum(current_board[row]) == 0:
                first_empty_row = row
                break
        
        if first_empty_row == -1:
            return HintResponse(
                has_hint=False,
                message="All queens are placed! Check if it's a valid solution."
            )
        
        for row in range(first_empty_row):
            if sum(current_board[row]) != 1:
                return HintResponse(
                    has_hint=False,
                    message=f"Row {row + 1} needs exactly one queen before placing in row {first_empty_row + 1}."
                )
        
        for col in range(self.n):
            is_safe, _ = self.is_safe(first_empty_row, col, current_board)
            if is_safe:
                return HintResponse(
                    has_hint=True,
                    row=first_empty_row,
                    col=col,
                    message=f"Try placing a queen at row {first_empty_row + 1}, column {col + 1}."
                )
        
        return HintResponse(
            has_hint=False,
            message="No valid moves in current row. You may need to backtrack!"
        )


def validate_move(request: ValidateRequest) -> ValidateResponse:
    """Validate if placing a queen at the given position is valid."""
    solver = NQueensSolver(request.n)
    
    if request.board[request.row][request.col] == 1:
        return ValidateResponse(
            valid=False,
            message="There's already a queen at this position!",
            conflicts=[]
        )
    
    is_safe, conflicts = solver.is_safe(request.row, request.col, request.board)
    
    if is_safe:
        return ValidateResponse(
            valid=True,
            message="Valid move! Queen placed successfully.",
            conflicts=[]
        )
    else:
        conflict_desc = ", ".join([f"({r+1}, {c+1})" for r, c in conflicts])
        return ValidateResponse(
            valid=False,
            message=f"Invalid move! Conflicts with queens at: {conflict_desc}",
            conflicts=conflicts
        )


def solve_nqueens(request: SolveRequest) -> SolveResponse:
    """Solve N Queens and return steps for a specific solution."""
    solver = NQueensSolver(request.n)
    total = SOLUTION_COUNTS.get(request.n, 0)
    
    # Ensure solution_index is valid
    solution_index = max(0, min(request.solution_index, total - 1)) if total > 0 else 0
    
    solver.solve_for_solution(solution_index)
    
    return SolveResponse(
        steps=solver.steps,
        total_solutions=total,
        current_solution=solution_index + 1
    )


def get_solution_count(request: SolutionCountRequest) -> SolutionCountResponse:
    """Get the total number of solutions for a given N."""
    return SolutionCountResponse(
        n=request.n,
        total_solutions=SOLUTION_COUNTS.get(request.n, 0)
    )


def get_hint(request: HintRequest) -> HintResponse:
    """Get a hint for the next valid move."""
    solver = NQueensSolver(request.n)
    return solver.get_hint(request.board)
