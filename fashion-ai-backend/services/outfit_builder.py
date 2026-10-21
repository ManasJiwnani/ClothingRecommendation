def build_outfits(clothes):
    tops = [item for item in clothes if item.get("category") == "top"]
    bottoms = [item for item in clothes if item.get("category") == "bottom"]
    dresses = [item for item in clothes if item.get("category") == "dress"]

    outfits = []

    # =====================================
    # TOP + BOTTOM
    # =====================================
    for top in tops:
        for bottom in bottoms:
        
            outfits.append({
                "type": "separates",
                "top": top,
                "bottom": bottom
            })

    # =====================================
    # DRESS
    # =====================================
    for dress in dresses:
        outfits.append({
                "type": "dress",
                "dress": dress
            })

    return outfits