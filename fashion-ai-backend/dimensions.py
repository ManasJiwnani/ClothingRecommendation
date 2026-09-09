from transformers import AutoConfig

# Load the configuration of a model
config = AutoConfig.from_pretrained("patrickjohncyh/fashion-clip")

print(f"Embedding Dimension: {config.projection_dim}")
print(f"Text Hidden Dimension: {config.text_config.hidden_size}")
print(f"Vision Hidden Dimension: {config.vision_config.hidden_size}")