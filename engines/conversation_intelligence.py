import json
from models.conversation_model import ConversationSummary
from utils.llm_client import ask_llm
from prompts.analysis_prompts import get_conversation_analysis_prompt

def analyse_conversation(transcript: str) -> ConversationSummary:
    prompt = get_conversation_analysis_prompt(transcript)
    response = ask_llm(prompt)
    data = json.loads(response)
    return ConversationSummary(**data)