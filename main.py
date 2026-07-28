"""
SalesGenie AI — Full Intelligence Pipeline
Entry point with professional Rich-powered CLI output.
"""

import sys
from typing import Optional

from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from rich.rule import Rule
from rich.columns import Columns
from rich import box
from rich.progress import Progress, SpinnerColumn, TextColumn, BarColumn, TimeElapsedColumn
from rich.align import Align
import io

from models.lead_model import Lead
from engines.company_analysis import analyse_company
from engines.lead_scorer import score_lead
from engines.outreach_engine import generate_outreach
from engines.conversation_intelligence import analyse_conversation
from engines.followup_engine import generate_followup
from utils.logger import logger

# ── Colour Palette ─────────────────────────────────────────────────────────
BRAND_TEAL   = "#00C9A7"
BRAND_PURPLE = "#845EC2"
BRAND_BLUE   = "#0081CF"
BRAND_GOLD   = "#F9C846"
BRAND_RED    = "#FF6B6B"
BRAND_GREEN  = "#06D6A0"
BRAND_DARK   = "#1E1E2E"
BRAND_GREY   = "#6E6E8A"

console = Console(force_terminal=True, highlight=False)


# ─────────────────────────────────────────────────────────────────────────────
# Helper renderers
# ─────────────────────────────────────────────────────────────────────────────

def _priority_badge(priority: str) -> Text:
    colours = {"Hot": BRAND_RED, "Warm": BRAND_GOLD, "Cold": BRAND_BLUE}
    return Text(f"  {priority.upper()}  ", style=f"bold white on {colours.get(priority, BRAND_GREY)}")


def _risk_badge(risk: str) -> Text:
    colours = {"High": BRAND_RED, "Medium": BRAND_GOLD, "Low": BRAND_GREEN}
    return Text(f"  {risk.upper()} RISK  ", style=f"bold white on {colours.get(risk, BRAND_GREY)}")


def _score_bar(score: int, width: int = 20) -> str:
    filled = int((score / 100) * width)
    bar    = "█" * filled + "░" * (width - filled)
    colour = BRAND_GREEN if score >= 70 else BRAND_GOLD if score >= 40 else BRAND_RED
    return f"[{colour}]{bar}[/] [bold]{score}/100[/]"


def _sentiment_colour(sentiment: str) -> str:
    return {
        "Positive": BRAND_GREEN,
        "Neutral":  BRAND_GOLD,
        "Negative": BRAND_RED,
    }.get(sentiment, BRAND_GREY)


# ─────────────────────────────────────────────────────────────────────────────
# Banner
# ─────────────────────────────────────────────────────────────────────────────

def _print_banner() -> None:
    lines = [
        (" SALESGENIE AI ", f"bold white on {BRAND_TEAL}"),
        (" AI Sales Intelligence Platform ", f"bold {BRAND_TEAL}"),
        (" Powered by Google Gemini 2.0 ", BRAND_GREY),
        (" v1.0.0  --  Production ", BRAND_GREY),
    ]
    banner = Text(justify="center")
    for text, style in lines:
        banner.append(text + "\n", style=style)

    console.print(Panel(
        Align.center(banner),
        border_style=BRAND_TEAL,
        padding=(1, 4),
    ))


# ─────────────────────────────────────────────────────────────────────────────
# Section printers
# ─────────────────────────────────────────────────────────────────────────────

def _print_lead_card(lead: Lead) -> None:
    table = Table(box=box.ROUNDED, border_style=BRAND_BLUE, show_header=False, padding=(0, 1))
    table.add_column("Field",  style=f"bold {BRAND_GREY}", width=22)
    table.add_column("Value",  style="white")

    table.add_row("🏢  Company",        lead.company_name)
    table.add_row("🌐  Industry",        lead.industry)
    table.add_row("👤  Contact",         lead.contact_name)
    table.add_row("📧  Email",           lead.email)
    table.add_row("📍  Location",        lead.location or "—")
    table.add_row("💰  Revenue",         lead.annual_revenue or "—")
    table.add_row("🚀  Funding Stage",   lead.funding_stage or "—")
    table.add_row("👥  Company Size",    lead.company_size or "—")
    table.add_row("⚙️   Tech Stack",      lead.technology_stack or "—")

    console.print(Panel(table, title=f"[bold {BRAND_BLUE}]📋  Lead Profile[/]", border_style=BRAND_BLUE))


def _print_company_insight(insight) -> None:
    table = Table(box=box.SIMPLE_HEAVY, border_style=BRAND_PURPLE, show_header=False, padding=(0, 1))
    table.add_column("", style=f"bold {BRAND_GREY}", width=24)
    table.add_column("", style="white")

    table.add_row("🎯  Qualification Score",  _score_bar(insight.qualification_score))
    table.add_row("📊  Business Needs",        insight.business_needs)
    table.add_row("💡  Opportunities",         insight.opportunities)
    table.add_row("🏭  Industry Analysis",     insight.industry_analysis)
    table.add_row("📝  Reasoning",             insight.qualification_reasoning)

    console.print(Panel(
        table,
        title=f"[bold {BRAND_PURPLE}]🔍  Company Intelligence[/]",
        border_style=BRAND_PURPLE,
    ))


def _print_lead_score(score) -> None:
    prob_pct = f"{score.conversion_probability * 100:.0f}%"

    meta = Table(box=None, show_header=False, padding=(0, 2))
    meta.add_column("", justify="center")
    meta.add_column("", justify="center")
    meta.add_column("", justify="center")

    meta.add_row(
        Panel(f"[bold white]{score.lead_score}[/]\n[{BRAND_GREY}]/ 100[/]",
              title="Score", border_style=BRAND_TEAL, padding=(0, 3)),
        Panel(f"[bold white]{prob_pct}[/]\n[{BRAND_GREY}]conversion[/]",
              title="Probability", border_style=BRAND_GOLD, padding=(0, 3)),
        Panel(_priority_badge(score.priority_level),
              title="Priority", border_style=BRAND_RED, padding=(0, 2)),
    )

    detail = Table(box=box.SIMPLE_HEAVY, show_header=False, padding=(0, 1))
    detail.add_column("", style=f"bold {BRAND_GREY}", width=22)
    detail.add_column("", style="white")
    detail.add_row("📈  Score Bar",         _score_bar(score.lead_score))
    detail.add_row("🔑  Scoring Factors",   score.scoring_factors)
    detail.add_row("✅  Recommended Action", score.recommended_action)

    console.print(Panel(
        Columns([meta, detail]),
        title=f"[bold {BRAND_TEAL}]📊  Lead Score[/]",
        border_style=BRAND_TEAL,
    ))


def _print_outreach_email(email) -> None:
    subject_text = Text(email.subject, style=f"bold {BRAND_GOLD}")
    body_text    = Text(email.body, style="white")

    meta = Table(box=None, show_header=False, padding=(0, 1))
    meta.add_column("", style=f"bold {BRAND_GREY}", width=22)
    meta.add_column("", style="white")
    meta.add_row("📬  Follow-Up Timing",      email.follow_up_timing)
    meta.add_row("📡  Channel",                email.channel_recommendation)

    content = Table(box=box.SIMPLE_HEAVY, show_header=False, padding=(0, 1))
    content.add_column("", style=f"bold {BRAND_GREY}", width=10)
    content.add_column("", style="white")
    content.add_row("Subject", subject_text)
    content.add_row("Body",    body_text)

    console.print(Panel(
        Columns([content, meta]),
        title=f"[bold {BRAND_GOLD}]✉️  Outreach Email[/]",
        border_style=BRAND_GOLD,
    ))


def _print_conversation(conversation) -> None:
    sentiment_col = _sentiment_colour(conversation.sentiment)

    table = Table(box=box.SIMPLE_HEAVY, show_header=False, padding=(0, 1))
    table.add_column("", style=f"bold {BRAND_GREY}", width=24)
    table.add_column("", style="white")

    table.add_row(
        "💬  Sentiment",
        Text(f"  {conversation.sentiment}  ",
             style=f"bold white on {sentiment_col}"),
    )
    table.add_row("📝  Summary", conversation.summary)
    table.add_row("🔑  Key Points",
                  "\n".join(f"• {p}" for p in conversation.key_discussion_points))
    table.add_row("✅  Action Items",
                  "\n".join(f"• {a}" for a in conversation.action_items))
    table.add_row("📅  Next Steps", conversation.next_steps)

    console.print(Panel(
        table,
        title=f"[bold {BRAND_GREEN}]🗣️  Conversation Intelligence[/]",
        border_style=BRAND_GREEN,
    ))


def _print_followup(followup) -> None:
    table = Table(box=box.SIMPLE_HEAVY, show_header=False, padding=(0, 1))
    table.add_column("", style=f"bold {BRAND_GREY}", width=24)
    table.add_column("", style="white")

    table.add_row("⚠️   Deal Risk",    _risk_badge(followup.deal_risk))
    table.add_row("🧠  Risk Reasoning", followup.deal_risk_reasoning)
    table.add_row("⏰  Timing",         followup.timing)
    table.add_row("📡  Channel",        followup.channel)
    table.add_row("💬  Message",        followup.follow_up_message)
    table.add_row("🗝️   Talking Points",
                  "\n".join(f"• {p}" for p in followup.talking_points))

    console.print(Panel(
        table,
        title=f"[bold {BRAND_RED}]🎯  Follow-Up Recommendation[/]",
        border_style=BRAND_RED,
    ))


# ─────────────────────────────────────────────────────────────────────────────
# Pipeline runner
# ─────────────────────────────────────────────────────────────────────────────

def run_sales_pipeline(lead: Lead, transcript: Optional[str] = None) -> dict:
    """
    Execute the full SalesGenie AI pipeline for a given lead.

    Steps:
      1. Company Analysis
      2. Lead Scoring
      3. Outreach Generation
      4. (Optional) Conversation Intelligence + Follow-Up

    Args:
        lead:       Validated Lead object.
        transcript: Optional meeting transcript string.

    Returns:
        dict with keys: lead, insight, score, email, conversation, followup
    """
    _print_banner()
    console.print(Rule(f"[bold {BRAND_TEAL}]Processing: {lead.company_name}[/]", style=BRAND_TEAL))
    console.print()

    _print_lead_card(lead)
    console.print()

    steps = ["🔍 Analysing company profile", "📊 Scoring lead", "✉️  Generating outreach email"]
    if transcript:
        steps += ["🗣️  Analysing conversation", "🎯 Generating follow-up"]

    results: dict = {"lead": lead}

    with Progress(
        SpinnerColumn(spinner_name="dots", style=f"bold {BRAND_TEAL}"),
        TextColumn("[progress.description]{task.description}"),
        BarColumn(bar_width=30, style=BRAND_PURPLE, complete_style=BRAND_TEAL),
        TimeElapsedColumn(),
        console=console,
        transient=True,
    ) as progress:
        task = progress.add_task("", total=len(steps))

        # Step 1: Company Analysis
        progress.update(task, description=f"[bold {BRAND_TEAL}]{steps[0]}[/]")
        insight = analyse_company(lead)
        results["insight"] = insight
        progress.advance(task)

        # Step 2: Lead Scoring
        progress.update(task, description=f"[bold {BRAND_PURPLE}]{steps[1]}[/]")
        score = score_lead(lead, insight)
        results["score"] = score
        progress.advance(task)

        # Step 3: Outreach Generation
        progress.update(task, description=f"[bold {BRAND_GOLD}]{steps[2]}[/]")
        email = generate_outreach(lead, insight, score)
        results["email"] = email
        progress.advance(task)

        conversation = None
        followup     = None

        if transcript:
            # Step 4: Conversation Intelligence
            progress.update(task, description=f"[bold {BRAND_GREEN}]{steps[3]}[/]")
            conversation = analyse_conversation(transcript)
            results["conversation"] = conversation
            progress.advance(task)

            # Step 5: Follow-Up Recommendation
            progress.update(task, description=f"[bold {BRAND_RED}]{steps[4]}[/]")
            followup = generate_followup(lead, score, conversation)
            results["followup"] = followup
            progress.advance(task)

    results.setdefault("conversation", None)
    results.setdefault("followup", None)

    return results


def display_results(results: dict) -> None:
    """Render all pipeline results to the terminal with rich formatting."""
    console.print()
    console.print(Rule(f"[bold white]📈  FULL INTELLIGENCE REPORT[/]", style=BRAND_TEAL))
    console.print()

    _print_company_insight(results["insight"])
    console.print()
    _print_lead_score(results["score"])
    console.print()
    _print_outreach_email(results["email"])

    if results.get("conversation"):
        console.print()
        _print_conversation(results["conversation"])

    if results.get("followup"):
        console.print()
        _print_followup(results["followup"])

    console.print()
    console.print(Rule(
        f"[bold {BRAND_TEAL}]✅  Pipeline Complete[/]",
        style=BRAND_TEAL,
    ))
    console.print()


# ─────────────────────────────────────────────────────────────────────────────
# Entry point
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    lead = Lead(
        company_name="InnovateAI Labs",
        industry="Artificial Intelligence",
        contact_name="Mark Chen",
        email="mark@innovateai.com",
        company_size="50-100 employees",
        funding_stage="Series B",
        location="New York, NY",
        annual_revenue="$10M - $20M",
        technology_stack="Python, TensorFlow, AWS, FastAPI",
    )

    transcript = """
    Mark: We're growing fast but our sales process is completely manual.
    We have no system for qualifying inbound leads efficiently.

    Alex: That's exactly our sweet spot. We automate the entire
    qualification workflow using AI. Your team only touches
    the leads that matter.

    Mark: How does pricing work for a team our size?

    Alex: For 50-100 employees we have a growth tier.
    I can put together a custom quote this week.

    Mark: That works. Send it over and we can discuss next Friday.
    """

    try:
        results = run_sales_pipeline(lead, transcript)
        display_results(results)
    except EnvironmentError as e:
        console.print(Panel(str(e), title="[bold red]Configuration Error[/]", border_style="red"))
        sys.exit(1)
    except Exception as e:
        logger.exception(f"Pipeline failed: {e}")
        console.print(Panel(
            f"[bold red]An unexpected error occurred:[/]\n{e}",
            title="[bold red]Pipeline Error[/]",
            border_style="red",
        ))
        sys.exit(1)