"""LangGraph execution graphs for fashion workflows."""

import json
from typing import Any, Dict, TypedDict
from langgraph.graph import END, START, StateGraph

from fashion_prompt_agents import ClothingTaggingAgent, QueryIntentAgent
from framework_func import DialogFunc
from framework_orchestrate import AgentOrchestrator


class ClothingIntentState(TypedDict, total=False):
    query: str
    intent: Dict[str, Any]
    usage: Dict[str, Any]
    time_taken: float | None


class ClothingTaggingState(TypedDict, total=False):
    image_data_url: str
    attributes: Dict[str, Any]
    usage: Dict[str, Any]
    time_taken: float | None


class FashionIntentGraphFlow:
    """Graph flow for parsing user queries into structured fashion constraints."""

    def __init__(self) -> None:
        graph = StateGraph(ClothingIntentState)
        graph.add_node("parse_intent", self.parse_intent)
        graph.add_edge(START, "parse_intent")
        graph.add_edge("parse_intent", END)
        self.graph = graph.compile()

    def parse_intent(self, state: ClothingIntentState) -> ClothingIntentState:
        query = state.get("query")
        if not query:
            raise ValueError("Query string must be provided.")

        prompt_agent = QueryIntentAgent()
        orchestrator = AgentOrchestrator(
            dailog_func=prompt_agent.prompt_func,
            format_func=lambda: True,
            dialog_max_tokens=1024,
            dialog_temperature=0,
            gpt_func=DialogFunc.get_func6_luna,
        )

        result = orchestrator.run_inference(
            user_query=query,
            gpt_token=DialogFunc.get_key(),
        )

        intent_data = json.loads(result["answer"])

        return {
            "intent": intent_data,
            "usage": result.get("usage", {}),
            "time_taken": result.get("time_taken"),
        }


class ClothingTaggingGraphFlow:
    """Graph flow for vision-based clothing metadata extraction."""

    def __init__(self) -> None:
        graph = StateGraph(ClothingTaggingState)
        graph.add_node("tag_garment", self.tag_garment)
        graph.add_edge(START, "tag_garment")
        graph.add_edge("tag_garment", END)
        self.graph = graph.compile()

    def tag_garment(self, state: ClothingTaggingState) -> ClothingTaggingState:
        image_data_url = state.get("image_data_url")
        if not image_data_url:
            raise ValueError("image_data_url must be provided.")

        prompt_agent = ClothingTaggingAgent()
        orchestrator = AgentOrchestrator(
            dailog_func=prompt_agent.prompt_func,
            format_func=lambda: True,
            dialog_max_tokens=1024,
            dialog_temperature=0,
            gpt_func=DialogFunc.get_func6_luna,
        )

        result = orchestrator.run_inference(
            user_query="",
            gpt_token=DialogFunc.get_key(),
            extra_inputs={"image_data_urls": [image_data_url]},
        )

        attributes = json.loads(result["answer"])

        return {
            "attributes": attributes,
            "usage": result.get("usage", {}),
            "time_taken": result.get("time_taken"),
        }