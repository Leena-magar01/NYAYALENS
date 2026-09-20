import time
from typing import Dict, List
from fastapi import Request, HTTPException, status

class SimpleRateLimiter:
    """
    In-memory rate limiter using sliding window log algorithm.
    """
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = 60
        self.client_requests: Dict[str, List[float]] = {}

    def is_rate_limited(self, client_ip: str) -> bool:
        now = time.time()
        window_start = now - self.window_seconds
        
        if client_ip not in self.client_requests:
            self.client_requests[client_ip] = [now]
            return False
            
        # Filter out requests older than 1 minute
        requests_in_window = [t for t in self.client_requests[client_ip] if t > window_start]
        requests_in_window.append(now)
        self.client_requests[client_ip] = requests_in_window
        
        return len(requests_in_window) > self.requests_per_minute

rate_limiter = SimpleRateLimiter(requests_per_minute=100)

def check_rate_limit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    if rate_limiter.is_rate_limited(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please wait a moment before sending more requests."
        )
