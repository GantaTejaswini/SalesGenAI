"""
Structured logging for SalesGenie AI using Rich.
Provides a project-wide logger with coloured console output.
"""

import logging
from rich.logging import RichHandler
from rich.console import Console
from utils.config import config

console = Console()

logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL, logging.INFO),
    format="%(message)s",
    datefmt="[%X]",
    handlers=[
        RichHandler(
            console=console,
            rich_tracebacks=True,
            show_path=False,
            markup=True,
        )
    ],
)

logger = logging.getLogger("salesgenie")
