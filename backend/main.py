from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from nqueens import (
    ValidateRequest, ValidateResponse, validate_move,
    SolveRequest, SolveResponse, solve_nqueens,
    HintRequest, HintResponse, get_hint,
    SolutionCountRequest, SolutionCountResponse, get_solution_count
)

app = FastAPI(
    title="N Queens Educational Game API",
    version="1.0.0"
)

# Configure CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "N Queens Educational Game API"}


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/api/nqueens/validate", response_model=ValidateResponse)
def api_validate_move(request: ValidateRequest):
    """Validate if placing a queen at the given position is valid."""
    return validate_move(request)


@app.post("/api/nqueens/solve", response_model=SolveResponse)
def api_solve_nqueens(request: SolveRequest):
    """Solve N Queens and return all steps for visualization."""
    return solve_nqueens(request)


@app.post("/api/nqueens/hint", response_model=HintResponse)
def api_get_hint(request: HintRequest):
    """Get a hint for the next valid move."""
    return get_hint(request)


@app.post("/api/nqueens/solutions", response_model=SolutionCountResponse)
def api_get_solution_count(request: SolutionCountRequest):
    """Get the total number of solutions for a given N."""
    return get_solution_count(request)
