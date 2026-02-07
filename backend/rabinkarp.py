from typing import List, Optional
from pydantic import BaseModel
from enum import Enum


class RKStepType(str, Enum):
    COMPUTE_PATTERN_HASH = "compute_pattern_hash"
    COMPUTE_WINDOW_HASH = "compute_window_hash"
    COMPARE_HASH = "compare_hash"
    HASH_MATCH = "hash_match"
    VERIFY_MATCH = "verify_match"
    MATCH_FOUND = "match_found"
    NO_MATCH = "no_match"
    SLIDE_WINDOW = "slide_window"


class RKStep(BaseModel):
    step_type: RKStepType
    window_start: int
    window_end: int
    pattern_hash: int
    window_hash: int
    message: str
    is_match: bool = False
    highlight_indices: List[int] = []


class RKSearchRequest(BaseModel):
    text: str
    pattern: str


class RKSearchResponse(BaseModel):
    steps: List[RKStep]
    matches: List[int]
    text: str
    pattern: str


class RabinKarpVisualizer:
    """Rabin-Karp algorithm with step-by-step visualization."""
    
    def __init__(self, text: str, pattern: str, base: int = 256, prime: int = 101):
        self.text = text
        self.pattern = pattern
        self.base = base
        self.prime = prime
        self.steps: List[RKStep] = []
        self.matches: List[int] = []
        self.n = len(text)
        self.m = len(pattern)
    
    def compute_hash(self, s: str) -> int:
        """Compute hash value for a string."""
        h = 0
        for char in s:
            h = (self.base * h + ord(char)) % self.prime
        return h
    
    def search(self) -> List[int]:
        """Perform Rabin-Karp search with step tracking."""
        if self.m > self.n or self.m == 0:
            return []
        
        # Compute hash of pattern
        pattern_hash = self.compute_hash(self.pattern)
        self.steps.append(RKStep(
            step_type=RKStepType.COMPUTE_PATTERN_HASH,
            window_start=-1,
            window_end=-1,
            pattern_hash=pattern_hash,
            window_hash=0,
            message=f"Computing pattern hash: '{self.pattern}' → {pattern_hash}",
            highlight_indices=[]
        ))
        
        # Compute hash of first window
        window_hash = self.compute_hash(self.text[:self.m])
        self.steps.append(RKStep(
            step_type=RKStepType.COMPUTE_WINDOW_HASH,
            window_start=0,
            window_end=self.m - 1,
            pattern_hash=pattern_hash,
            window_hash=window_hash,
            message=f"Computing first window hash: '{self.text[:self.m]}' → {window_hash}",
            highlight_indices=list(range(self.m))
        ))
        
        # Precompute base^(m-1) for rolling hash
        h = pow(self.base, self.m - 1, self.prime)
        
        # Slide the window
        for i in range(self.n - self.m + 1):
            # Compare hashes
            self.steps.append(RKStep(
                step_type=RKStepType.COMPARE_HASH,
                window_start=i,
                window_end=i + self.m - 1,
                pattern_hash=pattern_hash,
                window_hash=window_hash,
                message=f"Comparing hashes: pattern={pattern_hash}, window={window_hash}",
                highlight_indices=list(range(i, i + self.m))
            ))
            
            if pattern_hash == window_hash:
                # Hash match - verify character by character
                self.steps.append(RKStep(
                    step_type=RKStepType.HASH_MATCH,
                    window_start=i,
                    window_end=i + self.m - 1,
                    pattern_hash=pattern_hash,
                    window_hash=window_hash,
                    message=f"Hash match! Verifying characters...",
                    highlight_indices=list(range(i, i + self.m))
                ))
                
                # Check actual match
                if self.text[i:i + self.m] == self.pattern:
                    self.matches.append(i)
                    self.steps.append(RKStep(
                        step_type=RKStepType.MATCH_FOUND,
                        window_start=i,
                        window_end=i + self.m - 1,
                        pattern_hash=pattern_hash,
                        window_hash=window_hash,
                        message=f"✓ Pattern found at index {i}!",
                        is_match=True,
                        highlight_indices=list(range(i, i + self.m))
                    ))
                else:
                    self.steps.append(RKStep(
                        step_type=RKStepType.NO_MATCH,
                        window_start=i,
                        window_end=i + self.m - 1,
                        pattern_hash=pattern_hash,
                        window_hash=window_hash,
                        message=f"Hash collision - characters don't match",
                        highlight_indices=list(range(i, i + self.m))
                    ))
            
            # Compute hash of next window using rolling hash
            if i < self.n - self.m:
                old_char = self.text[i]
                new_char = self.text[i + self.m]
                window_hash = (self.base * (window_hash - ord(old_char) * h) + ord(new_char)) % self.prime
                if window_hash < 0:
                    window_hash += self.prime
                
                self.steps.append(RKStep(
                    step_type=RKStepType.SLIDE_WINDOW,
                    window_start=i + 1,
                    window_end=i + self.m,
                    pattern_hash=pattern_hash,
                    window_hash=window_hash,
                    message=f"Sliding window: remove '{old_char}', add '{new_char}' → hash={window_hash}",
                    highlight_indices=list(range(i + 1, i + self.m + 1))
                ))
        
        return self.matches


def search_rabin_karp(request: RKSearchRequest) -> RKSearchResponse:
    """Perform Rabin-Karp search and return visualization steps."""
    visualizer = RabinKarpVisualizer(request.text, request.pattern)
    visualizer.search()
    
    return RKSearchResponse(
        steps=visualizer.steps,
        matches=visualizer.matches,
        text=request.text,
        pattern=request.pattern
    )
