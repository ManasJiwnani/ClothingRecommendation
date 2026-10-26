import time
import importlib
from typing import Any, Callable, Dict, Optional

class AgentOrchestrator:
    def __init__(
        self,
        dialog_func: Optional[Callable] = None,
        format_func: Optional[Callable] = None,
        dialog_max_tokens: int = 1024,
        dialog_temperature: float = 0,
        dialog_top_p: float = 1,
        gpt_func: Optional[Callable] = None,
        image_func: Optional[Callable] = None,
    ):
        self.dialog_func = dialog_func
        self.format_func = format_func
        self.max_tokens = dialog_max_tokens
        self.temperature = dialog_temperature
        self.top_p = dialog_top_p
        self.gpt_func = gpt_func
        self.image_func = image_func

    def run_inference(
        self,
        user_query: str,
        gpt_token: str,
        extra_inputs: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        OpenAI = importlib.import_module("openai").OpenAI
        client = OpenAI(api_key=gpt_token)
        model = self.gpt_func() if callable(self.gpt_func) else "gpt-6-luna"
        
        # Prepare prompt payload using the agent's prompt_func
        payload = {}
        if self.dialog_func:
            payload = self.dialog_func(
                user_query=user_query,
                relevant_items={"extra_inputs": extra_inputs or {}}
            )

        prompt_text = payload.get("prompt", user_query)
        image_data_urls = payload.get("image_data_urls", [])

        # Build message content
        content = [{"type": "text", "text": prompt_text}]
        for url in image_data_urls:
            content.append({"type": "image_url", "image_url": {"url": url}})

        start_time = time.time()
        
        kwargs = {
            "model": model,
            "messages": [{"role": "user", "content": content}],
            "max_completion_tokens": self.max_tokens,
            # "temperature": self.temperature,
        }
        
        if payload.get("response_format") == "json_object":
            kwargs["response_format"] = {"type": "json_object"}

        response = client.chat.completions.create(**kwargs)
        time_taken = round(time.time() - start_time, 2)

        answer = response.choices[0].message.content or ""
        usage = {
            "prompt_tokens": response.usage.prompt_tokens if response.usage else 0,
            "completion_tokens": response.usage.completion_tokens if response.usage else 0,
            "total_tokens": response.usage.total_tokens if response.usage else 0,
        }

        return {
            "answer": answer,
            "usage": usage,
            "time_taken": time_taken,
        }