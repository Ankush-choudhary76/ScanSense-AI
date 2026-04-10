from typing import TypedDict, Annotated, Sequence
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, AIMessage
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from config.settings import GROQ_API_KEY, MODEL_NAME, SYSTEM_PROMPT

def get_llm(temperature=0.0):
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not found in environment variables.")
    return ChatGroq(model=MODEL_NAME, api_key=GROQ_API_KEY, temperature=temperature)

def is_medical_content(content, content_type):
    # Langchain run for content validation
    llm = get_llm(temperature=0.0)
    
    if content_type == 'image':
        msg = HumanMessage(
            content=[
                {"type": "text", "text": "Is this image related to the medical field (e.g., X-ray, MRI, medical report, prescription, symptoms, anatomy)? Answer strictly with 'YES' or 'NO'."},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{content}"}}
            ]
        )
    elif content_type == 'pdf':
        sample_text = content[:2000]
        msg = HumanMessage(
            content=f"Is this text from a medical document? Answer strictly with 'YES' or 'NO'.\n\nText:\n{sample_text}"
        )
    else:
        return False

    try:
        response = llm.invoke([msg])
        return "YES" in str(response.content).strip().upper()
    except Exception as e:
        print(f"Validation Error: {e}")
        return False

# LangGraph State
class ChatState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    context: str
    content_type: str

def call_model_node(state: ChatState):
    messages = list(state["messages"])
    llm = get_llm(temperature=0.7)
    response = llm.invoke(messages)
    return {"messages": [response]}

# Build the LangGraph workflow
workflow = StateGraph(ChatState)
workflow.add_node("call_model", call_model_node)
workflow.add_edge(START, "call_model")
workflow.add_edge("call_model", END)
chatbot_app = workflow.compile()

def stream_chat_response(chat_history, context, content_type, user_text):
    """
    Generator that streams the response from the LangGraph execution.
    """
    messages = [SystemMessage(content=SYSTEM_PROMPT)]
    
    if content_type == "pdf" and context:
        messages.append(SystemMessage(content=f"Use this document context to answer:\n\n{context}"))
        
    for msg in chat_history[:-1]:
        if msg["role"] == "user":
            messages.append(HumanMessage(content=msg["content"]))
        elif msg["role"] == "assistant":
            messages.append(AIMessage(content=msg["content"]))
            
    if content_type == "image" and context:
        messages.append(HumanMessage(
            content=[
                {"type": "text", "text": user_text},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{context}"}}
            ]
        ))
    else:
        messages.append(HumanMessage(content=user_text))
        
    state = {
        "messages": messages,
        "context": context,
        "content_type": content_type
    }
    
    try:
        for event in chatbot_app.stream(state, stream_mode="messages"):
            chunk, metadata = event
            if chunk.content and isinstance(chunk.content, str):
                yield chunk.content
    except Exception as e:
        yield f"\nAPI Error: {e}"
