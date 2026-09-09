from services.query_analyzer_service import analyze_query


queries = [
    "I have a job interview tomorrow",
    "Give me something cute for a brunch date",
    "I want an old money outfit for a wedding",
    "I want something comfortable but stylish for college",
    "Give me a black outfit for a party",
    "I don't want jeans, something formal for my presentation"
]


for query in queries:

    print("\nUSER:")
    print(query)

    intent = analyze_query(query)

    print("\nINTENT:")
    print(intent.model_dump())