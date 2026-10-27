from services.color_matcher import score_color_pair
from services.outfit_scorer import STYLE_COMPATIBILITY


def _normalize_style(style):
    return str(style or "").casefold().replace("-", "_").replace(" ", "_").strip()

def score_swap_candidate(candidate, locked_items):
    """
    Score a replacement against the garment(s) that remain in the outfit.
    """
    score = 0
    candidate_color = candidate.get("color")
    candidate_style = _normalize_style(candidate.get("style"))
    candidate_formality = candidate.get("formality")

    for item in locked_items:
        locked_color = item.get("color")
        if candidate_color and locked_color:
            score += score_color_pair(candidate_color, locked_color)

        locked_style = _normalize_style(item.get("style"))
        if candidate_style and locked_style:
            if candidate_style == locked_style:
                score += 5
            elif (
                locked_style in STYLE_COMPATIBILITY.get(candidate_style, set())
                or candidate_style in STYLE_COMPATIBILITY.get(locked_style, set())
            ):
                score += 3
            else:
                score -= 3

        item_formality = item.get("formality")
        if candidate_formality is not None and item_formality is not None:
            score += 2 if abs(candidate_formality - item_formality) <= 1 else -2

    return score


def rank_swap_candidates(
    candidates,
    locked_items,
    current_item_id=None,
    limit=5
):

    ranked = []

    for candidate in candidates:

        # Don't show the item the user disliked
        if (
            current_item_id
            and str(candidate.get("id")) == str(current_item_id)
        ):
            continue

        score = score_swap_candidate(
            candidate,
            locked_items
        )

        ranked.append({
            **candidate,
            "swap_score": score
        })

    ranked.sort(
        key=lambda item: item["swap_score"],
        reverse=True
    )

    return ranked[:limit]