def build_outfits(clothes):

    tops = [
        item for item in clothes
        if item.get("category") == "top"
    ]

    bottoms = [
        item for item in clothes
        if item.get("category") == "bottom"
    ]

    footwear = [
        item for item in clothes
        if item.get("category") == "footwear"
    ]

    dresses = [
        item for item in clothes
        if item.get("category") == "dress"
    ]

    print("\n===== OUTFIT BUILDER =====")

    print("Tops:", len(tops))
    print("Bottoms:", len(bottoms))
    print("Footwear:", len(footwear))
    print("Dresses:", len(dresses))

    outfits = []

    # =====================================
    # TOP + BOTTOM
    # =====================================

    for top in tops:

        for bottom in bottoms:

            # Outfit without footwear
            outfits.append({
                "type": "separates",
                "top": top,
                "bottom": bottom
            })

            # Outfit with footwear
            for shoe in footwear:

                outfits.append({
                    "type": "separates",
                    "top": top,
                    "bottom": bottom,
                    "footwear": shoe
                })

    # =====================================
    # DRESS
    # =====================================

    for dress in dresses:

        # Dress without footwear
        outfits.append({
            "type": "dress",
            "dress": dress
        })

        # Dress + footwear
        for shoe in footwear:

            outfits.append({
                "type": "dress",
                "dress": dress,
                "footwear": shoe
            })

    print("Total outfits generated:", len(outfits))

    return outfits


# def build_outfits(clothes):

#     tops = [
#         item for item in clothes
#         if item.get("category") == "top"
#     ]

#     bottoms = [
#         item for item in clothes
#         if item.get("category") == "bottom"
#     ]

#     footwear = [
#         item for item in clothes
#         if item.get("category") == "footwear"
#     ]

#     dresses = [
#         item for item in clothes
#         if item.get("category") == "dress"
#     ]

#     print("\n===== OUTFIT BUILDER =====")
#     print("Tops:", len(tops))
#     print("Bottoms:", len(bottoms))
#     print("Footwear:", len(footwear))
#     print("Dresses:", len(dresses))

#     outfits = []

#     # TOP + BOTTOM

#     for top in tops:
#         for bottom in bottoms:

#             # Always create outfit without shoes
#             outfit = {
#                 "type": "separates",
#                 "top": top,
#                 "bottom": bottom
#             }

#             # Add shoes only if available
#             # if footwear:
#             for shoe in footwear:

#                 outfit_with_shoes = {
#                     "type": "separates",
#                     "top": top,
#                     "bottom": bottom,
#                     "footwear": shoe
#                 }

#                 outfits.append(outfit_with_shoes)

#             else:
#                 outfits.append(outfit)

#     # DRESS

#     for dress in dresses:

#         # Always create dress outfit
#         outfit = {
#             "type": "dress",
#             "dress": dress
#         }

#         # Add shoes only if available
#         if footwear:
#             for shoe in footwear:

#                 outfit_with_shoes = {
#                     "type": "dress",
#                     "dress": dress,
#                     "footwear": shoe
#                 }

#                 outfits.append(outfit_with_shoes)

#         else:
#             outfits.append(outfit)

#     return outfits