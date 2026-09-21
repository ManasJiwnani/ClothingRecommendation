"""
CLOSET - FASHN clothing background removal.

Uses:
    fashn-ai/fashn-human-parser

Input:
    User uploaded clothing/model image.

Output:
    Transparent PNG bytes containing the detected fashion item.
"""

import io
from typing import Dict

import numpy as np
import torch
import truststore

truststore.inject_into_ssl()

from PIL import Image, ImageFilter
from transformers import (
    SegformerForSemanticSegmentation,
    SegformerImageProcessor,
)


# ============================================================
# MODEL
# ============================================================

MODEL_NAME = "fashn-ai/fashn-human-parser"

# FASHN Human Parser class IDs
FASHION_CLASSES = {
    3: "top",
    4: "dress",
    5: "skirt",
    6: "pants",
    7: "belt",
    8: "bag",
    9: "hat",
    10: "scarf",
    11: "glasses",
    17: "jewelry",
}

ITEM_PADDING = 24
MAX_OUTPUT_SIZE = (900, 1100)


# ============================================================
# MODEL CACHE
# ============================================================

_processor = None
_model = None


def _load_model():
    """
    Load FASHN model only once.

    The first request downloads the model.
    Subsequent requests reuse the loaded model.
    """

    global _processor, _model

    if _processor is None or _model is None:

        print(
            f"Loading FASHN Human Parser: {MODEL_NAME}"
        )

        _processor = SegformerImageProcessor.from_pretrained(
            MODEL_NAME
        )

        _model = SegformerForSemanticSegmentation.from_pretrained(
            MODEL_NAME
        )

        _model.eval()

        print("FASHN Human Parser loaded successfully.")

    return _processor, _model


# ============================================================
# CREATE TRANSPARENT CUTOUT
# ============================================================

def _render_cutout(
    source: Image.Image,
    mask: Image.Image,
    padding: int = ITEM_PADDING,
) -> bytes:
    """
    Apply segmentation mask to original image.

    Pixels outside the clothing item become transparent.

    Returns:
        Transparent PNG bytes.
    """

    # Make mask binary
    mask = mask.point(
        lambda value: 255 if value >= 128 else 0
    )

    bounds = mask.getbbox()

    if bounds is None:
        raise ValueError(
            "Detected clothing mask is empty."
        )

    # Add padding around detected item
    bounds = (
        max(0, bounds[0] - padding),
        max(0, bounds[1] - padding),
        min(source.width, bounds[2] + padding),
        min(source.height, bounds[3] + padding),
    )

    # Convert source image to RGBA
    garment = source.convert("RGBA")

    # Use segmentation mask as alpha channel
    garment.putalpha(mask)

    # Crop around garment
    garment = garment.crop(bounds)

    # Resize while preserving aspect ratio
    garment.thumbnail(
        MAX_OUTPUT_SIZE,
        Image.Resampling.LANCZOS,
    )

    output = io.BytesIO()

    garment.save(
        output,
        format="PNG",
    )

    return output.getvalue()


# ============================================================
# DETECT FASHION ITEMS
# ============================================================

def make_fashion_item_cutouts_from_bytes(
    raw_bytes: bytes,
) -> Dict[str, bytes]:
    """
    Detect supported fashion items from an image.

    Returns:

        {
            "top": transparent_png_bytes,
            "pants": transparent_png_bytes,
            ...
        }
    """

    processor, model = _load_model()

    # --------------------------------------------------------
    # Load image
    # --------------------------------------------------------

    try:
        source = Image.open(
            io.BytesIO(raw_bytes)
        ).convert("RGB")
    except Exception as error:
        raise ValueError(
            "Uploaded file is not a valid image."
        ) from error

    # --------------------------------------------------------
    # Prepare image
    # --------------------------------------------------------

    inputs = processor(
        images=source,
        return_tensors="pt",
    )

    # --------------------------------------------------------
    # Run FASHN
    # --------------------------------------------------------

    with torch.no_grad():

        logits = model(
            **inputs
        ).logits

    # --------------------------------------------------------
    # Resize segmentation output
    # --------------------------------------------------------

    logits = torch.nn.functional.interpolate(
        logits,
        size=source.size[::-1],
        mode="bilinear",
        align_corners=False,
    )

    # --------------------------------------------------------
    # Get class for each pixel
    # --------------------------------------------------------

    labels = (
        logits
        .argmax(dim=1)[0]
        .cpu()
        .numpy()
    )

    # --------------------------------------------------------
    # Create transparent cutouts
    # --------------------------------------------------------

    cutouts = {}

    for class_id, item_name in FASHION_CLASSES.items():

        # Create mask for current class
        item_mask = Image.fromarray(
            (
                (labels == class_id) * 255
            ).astype("uint8"),
            mode="L",
        )

        # Skip if item does not exist
        if item_mask.getbbox() is None:
            continue

        # Smooth edges
        item_mask = item_mask.filter(
            ImageFilter.GaussianBlur(1.2)
        )

        # Create transparent PNG
        cutouts[item_name] = _render_cutout(
            source,
            item_mask,
            padding=(
                0
                if item_name == "pants"
                else ITEM_PADDING
            ),
        )

    # --------------------------------------------------------
    # Nothing detected
    # --------------------------------------------------------

    if not cutouts:

        raise ValueError(
            "No supported fashion items were detected "
            "in the uploaded image."
        )

    return cutouts


# ============================================================
# SINGLE ITEM API
# ============================================================

def make_fashion_cutout_from_bytes(
    raw_bytes: bytes,
) -> bytes:
    """
    Return the first detected fashion item.

    This is used by the current CLOSET API because:

        1 uploaded image
        =
        1 wardrobe item
    """

    cutouts = make_fashion_item_cutouts_from_bytes(
        raw_bytes
    )

    return next(iter(cutouts.values()))