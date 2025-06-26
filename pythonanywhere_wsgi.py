"""
WSGI configuration file for PythonAnywhere deployment.
This file connects your Flask application to PythonAnywhere's WSGI server.
"""
import os
import sys

# Add your project directory to the Python path
project_home = '/home/yourusername/MPAgent_biomonitoring'
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Import your Flask app, but avoid running it
from app import app as application

# The PythonAnywhere WSGI server looks for an 'application' variable
# No need to call app.run() as PythonAnywhere handles that
