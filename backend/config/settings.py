import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# App Configuration
PAGE_TITLE = "ScanSense AI"
LAYOUT = "wide"
INITIAL_SIDEBAR_STATE = "collapsed"

# Model configuration
MODEL_NAME = "meta-llama/llama-4-scout-17b-16e-instruct"

# API Configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Prompts
SYSTEM_PROMPT = """You are a helpful and professional medical assistant. 
Your role is to assist with medical analysis, health inquiries, and understanding medical documents or images.
You must STRICTLY REFUSE to answer any questions that are not related to the medical or health field (e.g., recipes, coding, general trivia, entertainment, etc.).
If a user asks a non-medical question, politely decline and state that you are a specialized medical AI analyzer designed to help with health-related queries only.
"""
