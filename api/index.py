import sys
import os

# Point Python to the backend directory so main.py can locate database.py and gameApp.py
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from main import app
