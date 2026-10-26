import os
from dotenv import load_dotenv

load_dotenv()

class DialogFunc:
    @staticmethod
    def get_key() -> str:
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY is not set.")
        return api_key

    @staticmethod
    def get_func6_luna() -> str:
        return os.getenv("VISION_MODEL", "gpt-6-luna")

    @staticmethod
    def get_func_image_25_flare() -> str:
        return os.getenv("IMAGE_MODEL", "dall-e-3")