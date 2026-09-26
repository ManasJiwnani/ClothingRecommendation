from services.color_matcher import colors_compatible

# try:
#     import truststore

#     truststore.inject_into_ssl()

# except Exception:
#     pass

def score_swap_candidate(candidate, locked_items):
    """
    Score how well a replacement item works
    with the items the user decided to keep.
    """

    score = 0

    candidate_color = candidate.get("color", "").lower()

    for item in locked_items:

        locked_color = item.get("color", "").lower()

        # Color compatibility
        if colors_compatible(candidate_color, locked_color):
            score += 3

        # Style compatibility
        if (
            candidate.get("style")
            and item.get("style")
            and candidate["style"].lower()
            == item["style"].lower()
        ):
            score += 2

        # Formality compatibility
        candidate_formality = candidate.get("formality")
        item_formality = item.get("formality")

        if (
            candidate_formality is not None
            and item_formality is not None
            and abs(candidate_formality - item_formality) <= 1
        ):
            score += 2

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