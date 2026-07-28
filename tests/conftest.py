"""pytest configuration — ensures the project root is on sys.path."""
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
