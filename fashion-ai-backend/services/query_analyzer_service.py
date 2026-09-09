# it is used to find the intent of the user query and return a structured representation of the intent
# right now it is a simple implementation that uses keyword matching to determine the intent of the query. 
# In the future, we can improve this by using a more sophisticated NLP model to analyze the query and extract the intent.
# we can user gemini or other LLMs to analyze the query and extract the intent.

def analyze_query(query: str):
    query_lower = query.lower()

    intent = {
        "occasion": None,
        "style": None,
        "formality": None,
        "mood": None,
        "weather_sensitive": False
    }

    if "presentation" in query_lower:
        intent["occasion"] = "presentation"
        intent["style"] = "formal"
        intent["formality"] = 4
        intent["mood"] = "confident"

    elif "college" in query_lower:
        intent["occasion"] = "college"
        intent["style"] = "casual"
        intent["formality"] = 2

    elif "party" in query_lower:
        intent["occasion"] = "party"
        intent["style"] = "stylish"
        intent["formality"] = 3

    if any(word in query_lower for word in ["weather", "hot", "cold", "rain"]):
        intent["weather_sensitive"] = True

    return intent

from google import genai
from google.genai import types

from config import settings
from models.schemas import Intent


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def analyze_query(query: str) -> Intent:

    prompt = f"""
You are a fashion query understanding assistant.

Your job is to understand the user's clothing/outfit request
and convert it into structured information.

User query:
"{query}"

Extract:

- occasion: The event or situation.
- style: The desired fashion style.
- formality: A number from 1 to 5.
    1 = very casual
    2 = casual
    3 = smart casual
    4 = formal
    5 = very formal
- mood: The desired mood or feeling.
- weather_sensitive: true if weather or temperature matters.
- color_preference: Any colors explicitly requested by the user.
- excluded_items: Clothing items the user explicitly does not want.

Rules:

1. Do not invent information that is not present or strongly implied.
2. Understand natural language and synonyms.
3. Keep occasion and style as natural descriptive text.
4. If the user says "I have a job interview", understand the occasion
   as an interview even if the exact word "interview" is used differently.
5. If no information is available for a field, return null.
6. Return only the structured fields requested.
"""

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=Intent
        )
    )

    return Intent.model_validate_json(response.text)