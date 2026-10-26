def build_outfits(clothes):
    tops = [item for item in clothes if item.get("category") == "top"]
    bottoms = [item for item in clothes if item.get("category") == "bottom"]
    dresses = [item for item in clothes if item.get("category") == "dress"]
    footwear = [item for item in clothes if item.get("category") == "footwear"]

    outfits = []

    # =====================================
    # TOP + BOTTOM
    # =====================================
    for index, top in enumerate(tops):
        for bottom_index, bottom in enumerate(bottoms):
            outfit = {
                "type": "separates",
                "top": top,
                "bottom": bottom,
            }
            if footwear:
                outfit["footwear"] = footwear[(index + bottom_index) % len(footwear)]
            outfits.append(outfit)

    # =====================================
    # DRESS
    # =====================================
    for index, dress in enumerate(dresses):
        outfit = {
            "type": "dress",
            "dress": dress,
        }
        if footwear:
            outfit["footwear"] = footwear[index % len(footwear)]
        outfits.append(outfit)

    return outfits