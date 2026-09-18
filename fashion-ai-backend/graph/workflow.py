from langgraph.graph import (
    StateGraph,
    START,
    END
)

from graph.state import RecommendationState

from graph.nodes import (
    prepare_intent_node,
    weather_node,
    retrieval_node,
    outfit_builder_node,
    ranking_node,
    finalize_node
)


# =========================================================
# CREATE GRAPH
# =========================================================

builder = StateGraph(
    RecommendationState
)


# =========================================================
# ADD NODES
# =========================================================

builder.add_node(
    "prepare_intent",
    prepare_intent_node
)

builder.add_node(
    "get_weather",
    weather_node
)

builder.add_node(
    "retrieve_clothes",
    retrieval_node
)

builder.add_node(
    "build_outfits",
    outfit_builder_node
)

builder.add_node(
    "rank_outfits",
    ranking_node
)

builder.add_node(
    "finalize",
    finalize_node
)


# =========================================================
# CONNECT NODES
# =========================================================

builder.add_edge(
    START,
    "prepare_intent"
)

builder.add_edge(
    "prepare_intent",
    "get_weather"
)

builder.add_edge(
    "get_weather",
    "retrieve_clothes"
)

builder.add_edge(
    "retrieve_clothes",
    "build_outfits"
)

builder.add_edge(
    "build_outfits",
    "rank_outfits"
)

builder.add_edge(
    "rank_outfits",
    "finalize"
)

builder.add_edge(
    "finalize",
    END
)


# =========================================================
# COMPILE GRAPH
# =========================================================

recommendation_graph = builder.compile()