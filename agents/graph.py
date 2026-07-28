from langgraph.graph import StateGraph, END
from agents.state import SalesGenieState
from agents.research_agent import research_agent
from agents.qualification_agent import qualification_agent
from agents.outreach_agent import outreach_agent
from agents.followup_agent import followup_agent
from agents.crm_agent import crm_agent

def build_graph():
    graph = StateGraph(SalesGenieState)
    
    graph.add_node("research", research_agent)
    graph.add_node("qualification", qualification_agent)
    graph.add_node("outreach", outreach_agent)
    graph.add_node("followup", followup_agent)
    graph.add_node("crm", crm_agent)
    
    graph.set_entry_point("research")
    
    graph.add_edge("research", "qualification")
    graph.add_edge("qualification", "outreach")
    graph.add_edge("outreach", "followup")
    graph.add_edge("followup", "crm")
    graph.add_edge("crm", END)
    
    return graph.compile()