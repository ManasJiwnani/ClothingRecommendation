# workflows/app_support_flow.py
from typing import Dict, Any, TypedDict
from langgraph.graph import StateGraph, START, END

from agentic.fashion_prompt_agents import AppSupportAgent
from agentic.framework_func import DialogFunc
from agentic.framework_orchestrate import AgentOrchestrator


class SupportState(TypedDict, total=False):
    query: str
    answer: str
    time_taken: float | None


class AppSupportGraphFlow:
    """Graph flow for resolving user FAQs and app usability queries."""

    def __init__(self) -> None:
        graph = StateGraph(SupportState)
        graph.add_node("answer_faq", self.answer_faq)
        graph.add_edge(START, "answer_faq")
        graph.add_edge("answer_faq", END)
        self.graph = graph.compile()

    def answer_faq(self, state: SupportState) -> SupportState:
        query = state.get("query")
        if not query:
            raise ValueError("Query string must be provided.")

        prompt_agent = AppSupportAgent()
        orchestrator = AgentOrchestrator(
            dialog_func=prompt_agent.prompt_func,
            format_func=lambda: True,
            dialog_max_tokens=512,
            dialog_temperature=0.2,
            gpt_func=DialogFunc.get_func6_luna,
        )

        result = orchestrator.run_inference(
            user_query=query,
            gpt_token=DialogFunc.get_key(),
        )

        return {
            "answer": result["answer"],
            "time_taken": result.get("time_taken"),
        }