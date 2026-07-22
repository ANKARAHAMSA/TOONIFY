"""
Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import Literal

StyleKey = Literal["disney", "anime", "ghibli", "comic", "pixar"]


class StyleInfo(BaseModel):
    key: str
    label: str
    description: str
    prompt_modifier: str
    emoji: str


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    device: str
    mock_mode: bool
    ip_adapter_loaded: bool = False


class CartoonizeResponse(BaseModel):
    success: bool
    message: str
