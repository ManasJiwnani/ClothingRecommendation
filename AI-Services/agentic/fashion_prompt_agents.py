"""Fashion Agent Prompt Classes for Tagging, Intent Analysis, and Flat-lay Generation."""

from typing import Any, Dict, List, Optional


class ClothingTaggingAgent:
    """Agent prompt for identifying structured clothing metadata from an image."""

    SYSTEM_INSTRUCTIONS = """You are an expert fashion cataloging assistant with deep knowledge of global,
Western, and Indian ethnic fashion traditions.

Analyze this garment image and identify its attributes with precision.
The background has already been removed.

Return ONLY valid JSON matching this exact structure:

{
    "category": "top | bottom | dress | footwear | outerwear | accessory",
    "subcategory": "specific garment type (e.g., choli, blouse, crop top, lehenga skirt, ghagra, flared skirt, trousers, jeans, kurta, saree, jacket)",
    "cultural_domain": "indian_ethnic | western | indo_western | fusion",
    "color": "primary dominant color",
    "secondary_colors": ["accent color 1", "accent color 2"],
    "pattern": "solid | printed | floral | striped | geometric | ethnic_motif | abstract",
    "embellishment": ["mirror_work", "gota_patti", "zari", "sequins", "embroidery", "none"],
    "material": "fabric guess such as cotton, silk, chiffon, georgette, velvet, denim, wool, or null if unclear",
    "sleeve_type": "full | half | sleeveless | three-quarter | strappy | null",
    "neckline": "sweetheart | deep-neck | round | v-neck | boat | collar | null",
    "fit": "fitted | regular | flared | loose | oversized",
    "style": "descriptive style (e.g., traditional festive, garba wear, minimalist, formal, boho, streetwear)",
    "formality": 4,
    "season": ["summer", "winter", "monsoon", "festive_season", "all-season"],
    "occasions": [
        "navratri", "wedding", "sangeet", "diwali", "puja", "festive", 
        "office", "formal", "casual", "party", "date", "college"
    ]
}

Rules:
1. Distinguish Indian ethnic garments accurately:
   - Traditional cropped/corset tops with ethnic embroidery, borders, or tassels must have subcategory "choli" and cultural_domain "indian_ethnic".
   - Flared skirts with ethnic borders or latkans must have subcategory "lehenga skirt" or "ghagra" and cultural_domain "indian_ethnic".
2. Western garments (like pencil skirts, tailored trousers, blazers) must have cultural_domain "western".
3. "formality" must be an integer from 1 (very casual) to 5 (very formal).
4. Do not invent details not visible in the image.
5. Return ONLY a valid JSON object without markdown fences, explanation, or extra text."""

    def prompt_func(
        self,
        user_query: Optional[str] = None,
        relevant_items: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        extra_inputs = (relevant_items or {}).get("extra_inputs", {})
        image_data_urls = extra_inputs.get("image_data_urls", [])

        return {
            "prompt": self.SYSTEM_INSTRUCTIONS,
            "image_data_urls": image_data_urls,
            "response_format": "json_object",
        }


class QueryIntentAgent:
    """Agent prompt for parsing outfit search queries into hard and soft filtering constraints."""

    SYSTEM_INSTRUCTIONS = """You are a fashion query understanding assistant.

Your job is to analyze the user's clothing or outfit search query
and extract structured constraints.

User query:
{query}

Extract and return ONLY a valid JSON object with these keys:

{{
    "occasion": "event or situation (e.g., Navratri, wedding, interview, beach vacation)",
    "category_preference": ["specific garments explicitly requested, e.g., 'lehenga', 'choli', 'trousers'"],
    "item_constraints": [
        {{"category": "requested category", "color": "requested color or null", "garment": "requested garment or null"}}
    ],
    "cultural_aesthetic": "Indian Ethnic | Western | Indo-Western | null if not specified",
    "style": "desired vibe or aesthetic (e.g., traditional festive, minimalist, sharp formal)",
    "formality": 4,
    "mood": "emotional vibe (e.g., vibrant, energetic, subtle)",
    "weather_sensitive": false,
    "color_preference": ["requested colors or empty list"],
    "excluded_items": ["items to exclude, e.g., 'pants', 'western wear' if strictly traditional"],
    "is_strictly_traditional": true
}}

Rules:
1. A query for Navratri, garba, or dandiya outfits implies Indian festive attire even when the user does not name a garment. Set is_strictly_traditional to true, cultural_aesthetic to 'Indian Ethnic', and add 'western wear' to excluded_items.
2. Also set those traditional constraints when the user explicitly requests ethnic attire such as a lehenga choli, saree, or kurta pajama.
3. Honor an explicit request for Western, Indo-Western, or fusion clothing instead of applying the traditional constraints.
4. For each explicitly requested garment, add one item_constraints entry. Put a color constraint on the garment it describes, not on every item. For example, "red tops with jeans" means a red top constraint and a jeans bottom constraint. Do not substitute skirts for jeans or other garments for explicitly requested types.
5. Use an empty item_constraints list when no garment or item-specific color is explicitly requested.
6. Formality must be an integer from 1 (very casual) to 5 (very formal), or null when unspecified.
7. Do not assume or invent information not supported by the query.
8. Return ONLY valid JSON without markdown wrapping."""

    def prompt_func(
        self,
        user_query: str,
        relevant_items: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        prompt_text = self.SYSTEM_INSTRUCTIONS.format(query=user_query.strip())
        return {
            "prompt": prompt_text,
            "response_format": "json_object",
        }


class WholeOutfitExtractionAgent:
    """Agent prompt for detecting visible clothing items from a user photo."""

    SYSTEM_INSTRUCTIONS = """You are a fashion cataloguer.

Look at the person in this image and identify ONLY the clothing garments they are wearing.

Include:
- tops, shirts, t-shirts, sweaters, jackets, coats, dresses, skirts, pants, jeans, shorts, other visible garments

Do NOT include:
- shoes, bags, watches, jewelry, glasses, phones, belts, hats, hands, face, body, background

Return ONLY valid JSON in this exact format:
{
    "items": [
        {
            "label": "White Cotton T-Shirt",
            "details": "short sleeve crew neck plain white cotton t-shirt",
            "group": "clothing"
        }
    ]
}

Only include garments that are clearly visible."""

    def prompt_func(
        self,
        user_query: Optional[str] = None,
        relevant_items: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        extra_inputs = (relevant_items or {}).get("extra_inputs", {})
        return {
            "prompt": self.SYSTEM_INSTRUCTIONS,
            "image_data_urls": extra_inputs.get("image_data_urls", []),
            "response_format": "json_object",
        }


class FlatLayGenerationAgent:
    """Agent prompt for synthesizing a clean flat-lay board image from detected garments."""

    def prompt_func(
        self,
        user_query: str,
        relevant_items: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        user_query: formatted clothing_description (e.g. "- White T-Shirt: cotton crew neck")
        """
        extra_inputs = (relevant_items or {}).get("extra_inputs", {})
        has_style_ref = extra_inputs.get("has_style_ref", False)

        style_prefix = (
            "Match the reference background color and lighting exactly, ignoring any text in it.\n\n"
            if has_style_ref
            else ""
        )

        prompt_text = f"""Create ONE vertical flat-lay fashion product image.
{style_prefix}
The image must contain ONLY these garments:

{user_query}

IMPORTANT:
- Show ONLY the garments.
- No person, face, body, mannequin, hands, shoes, bags, jewelry, watches, phone, or accessories.
- No extra objects, text, labels, captions, logos, or watermarks.

Lay every garment completely flat and photograph everything from directly above.
Arrange the garments neatly with clear separation between each item.

Use:
- minimalist warm beige/taupe background
- clean editorial fashion-board composition
- generous spacing
- soft studio lighting
- subtle natural shadows
- realistic fabric texture
- accurate garment colors and shapes
- photorealistic appearance and e-commerce catalog quality

Create EXACTLY ONE image containing all garments."""

        return {
            "prompt": prompt_text.strip(),
            "image_data_urls": extra_inputs.get("image_data_urls", []),
        }