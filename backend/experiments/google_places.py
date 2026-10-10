import os
import re
import uuid

import httpx
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

load_dotenv()

app = FastAPI(title="Parkour API")

API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")
GOOGLE_BASE = "https://places.googleapis.com/v1"

UCF_LAT = 28.6024
UCF_LNG = -81.2001


class AutocompleteRequest(BaseModel):
    query: str = Field(min_length=2, max_length=150)
    session_token: str = Field(min_length=1, max_length=36)


class PlaceDetailsRequest(BaseModel):
    place_id: str = Field(min_length=1, max_length=255)
    session_token: str = Field(min_length=1, max_length=36)


def google_headers(field_mask: str):
    if not API_KEY or API_KEY == "PASTE_YOUR_API_KEY_HERE":
        raise HTTPException(
            status_code=500,
            detail="Google Places API key is not configured",
        )

    return {
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": field_mask,
        "Content-Type": "application/json",
    }


async def google_request(method, url, **kwargs):
    try:
        async with httpx.AsyncClient(timeout=12) as client:
            response = await client.request(
                method, url, **kwargs
            )
        response.raise_for_status()
        return response.json()

    except httpx.HTTPStatusError as error:
        print(
            "Google API error:",
            error.response.status_code,
            error.response.text[:500],
        )
        raise HTTPException(
            status_code=502,
            detail="Google Places request failed. Check API configuration.",
        )

    except httpx.RequestError:
        raise HTTPException(
            status_code=503,
            detail="Could not reach Google Places",
        )


@app.get("/")
def home():
    return {"message": "Parkour API is running"}


@app.get("/session")
def new_session():
    return {"session_token": str(uuid.uuid4())}


@app.post("/autocomplete")
async def autocomplete(request: AutocompleteRequest):
    data = await google_request(
        "POST",
        f"{GOOGLE_BASE}/places:autocomplete",
        headers=google_headers(
            "suggestions.placePrediction.placeId,"
            "suggestions.placePrediction.structuredFormat,"
            "suggestions.placePrediction.text"
        ),
        json={
            "input": request.query.strip(),
            "sessionToken": request.session_token,
            "locationBias": {
                "circle": {
                    "center": {
                        "latitude": UCF_LAT,
                        "longitude": UCF_LNG,
                    },
                    "radius": 10000.0,
                }
            },
            "regionCode": "us",
            "languageCode": "en",
        },
    )

    results = []
    for item in data.get("suggestions", []):
        prediction = item.get("placePrediction")
        if not prediction:
            continue

        formatted = prediction.get("structuredFormat", {})

        results.append({
            "place_id": prediction.get("placeId"),
            "name": formatted.get("mainText", {}).get("text", ""),
            "address": formatted.get("secondaryText", {}).get("text", ""),
            "description": prediction.get("text", {}).get("text", ""),
        })

    return {"predictions": results}


@app.post("/place-details")
async def place_details(request: PlaceDetailsRequest):
    if not re.fullmatch(r"[A-Za-z0-9_-]+", request.place_id):
        raise HTTPException(
            status_code=400,
            detail="Invalid place ID",
        )

    data = await google_request(
        "GET",
        f"{GOOGLE_BASE}/places/{request.place_id}",
        headers=google_headers(
            "id,displayName,formattedAddress,location"
        ),
        params={"sessionToken": request.session_token},
    )

    location = data.get("location", {})

    if "latitude" not in location or "longitude" not in location:
        raise HTTPException(
            status_code=502,
            detail="Google did not return coordinates",
        )

    return {
        "place_id": data.get("id"),
        "name": data.get("displayName", {}).get("text", ""),
        "address": data.get("formattedAddress", ""),
        "latitude": location["latitude"],
        "longitude": location["longitude"],
    }
