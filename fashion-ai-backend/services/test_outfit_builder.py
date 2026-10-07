import unittest

from services.outfit_builder import build_outfits


class BuildOutfitsTests(unittest.TestCase):
    def test_builds_separates_from_plural_categories(self):
        top = {"id": "top-1", "category": "Tops"}
        bottom = {"id": "bottom-1", "category": "Bottoms"}

        outfits = build_outfits([top, bottom])

        self.assertEqual(len(outfits), 1)
        self.assertEqual(outfits[0]["top"], top)
        self.assertEqual(outfits[0]["bottom"], bottom)

    def test_uses_clothing_type_when_category_is_not_a_clothing_slot(self):
        top = {"id": "top-1", "category": "Clothing", "clothing_type": "top"}
        bottom = {
            "id": "bottom-1",
            "category": "Clothing",
            "clothing_type": "bottom",
        }

        outfits = build_outfits([top, bottom])

        self.assertEqual(len(outfits), 1)
        self.assertEqual(outfits[0]["top"], top)
        self.assertEqual(outfits[0]["bottom"], bottom)

    def test_builds_dress_outfit_from_plural_category(self):
        dress = {"id": "dress-1", "category": "Dresses"}

        outfits = build_outfits([dress])

        self.assertTrue(any(outfit.get("dress") == dress for outfit in outfits))

    def test_builds_bottom_outfits_from_jeans_and_skirt_categories(self):
        top = {"id": "top-1", "category": "top"}
        jeans = {"id": "jeans-1", "category": "Jeans"}
        skirt = {"id": "skirt-1", "category": "Skirt"}

        outfits = build_outfits([top, jeans, skirt])

        bottoms = {outfit["bottom"]["id"] for outfit in outfits}
        self.assertEqual(bottoms, {"jeans-1", "skirt-1"})


if __name__ == "__main__":
    unittest.main()

if __name__ == "__main__":
    unittest.main()
