import sys
import os

# Add the backend directory to Python's module path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from app.main import app
