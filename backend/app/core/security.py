"""
core/security.py — Boomi shared-secret validation + UKG OAuth2 token helper
"""
from fastapi import HTTPException, Security, status
from fastapi.security import APIKeyHeader
from app.core.config import get_settings
import httpx

settings = get_settings()

# ── Boomi Header Auth ─────────────────────────────────────────────────────────
boomi_secret_header = APIKeyHeader(name="X-Boomi-Secret", auto_error=False)


def verify_boomi_secret(api_key: str = Security(boomi_secret_header)) -> str:
    """Validate the X-Boomi-Secret header for Boomi ingest endpoint."""
    if not api_key or api_key != settings.BOOMI_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing X-Boomi-Secret header.",
        )
    return api_key


# ── UKG OAuth2 Token Helper (mockable for POC) ────────────────────────────────
async def get_ukg_access_token() -> str:
    """
    Fetches a UKG Pro WFM OAuth2 access token using client credentials flow.
    Returns a mock token when UKG credentials are not configured (POC mode).
    """
    if not settings.UKG_CLIENT_ID:
        # POC / Demo mode — return a mock token
        return "mock-ukg-access-token-poc"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                settings.UKG_TOKEN_URL,
                data={
                    "grant_type": "client_credentials",
                    "client_id": settings.UKG_CLIENT_ID,
                    "client_secret": settings.UKG_CLIENT_SECRET,
                    "audience": settings.UKG_BASE_URL,
                },
                timeout=15.0,
            )
            response.raise_for_status()
            return response.json()["access_token"]
        except httpx.HTTPError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=f"Failed to obtain UKG token: {exc}",
            )
