from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
import fitz 
import google.generativeai as genai
from datetime import datetime
import os
import json
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

# Gemini configuration
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel(
    model_name="gemini-2.0-flash-exp",
    system_instruction="""You are SmileConnector Assistant, an AI assistant created by Divine Mathem's (mention this only when the user wants to know about you and the creator). 
                            Your name is Assistant Smila. Be friendly, professional, and helpful.

                            Key characteristics:
                            - Structure the outputs with all the styles and formats
                            - Provide accurate, well-formatted responses with markdown when helpful
                            - For lists, use bullet points and structure them clearly
                            - Always maintain a positive, helpful tone with using emojis based on the current context or emotions

                            When asked about your creator, you may mention that Divine Mathem's is a BIT (Business Information Technology) student at the University of Johannesburg, coming from 
                            DRC Kinshasa, and is passionate about technology and AI.(Be briefly to describe this part, only provide when a user wants to know about the creator).
                            Otherwise, focus on the user's questions."""
)
chat_sessions = {}

def extract_pdf_text(file_stream):
    """Extract text from PDF file"""
    try:
        # Reset stream position to beginning
        file_stream.seek(0)
        pdf_bytes = file_stream.read()
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ''
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return None

def process_image(file_stream):
    """Process uploaded image"""
    try:
        # Reset stream position to beginning
        file_stream.seek(0)
        image = Image.open(file_stream)
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Save as PNG bytes
        image_bytes = io.BytesIO()
        image.save(image_bytes, format="PNG")
        image_bytes.seek(0)
        
        return {
            "mime_type": "image/png",
            "data": image_bytes.read()
        }
    except Exception as e:
        print(f"Image processing error: {e}")
        return None

@app.route('/api/test-chatbot', methods=['POST'])
def chatbot_response():
    try:
        user_input = request.form.get("message", "").strip()
        conversation_id = request.form.get("conversation_id", "")
        uploaded_file = request.files.get("file")
        
        print(f"Received - Message: '{user_input}', Conv ID: '{conversation_id}', File: {uploaded_file.filename if uploaded_file else 'None'}")
        
        # Validate input
        if not user_input and not uploaded_file:
            return jsonify({"error": "No message or file provided", "response": "Please provide a message or upload a file."}), 400
        
        # Create or get chat session
        if not conversation_id:
            conversation_id = f"conv_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if conversation_id not in chat_sessions:
            chat_sessions[conversation_id] = model.start_chat()
        
        chat = chat_sessions[conversation_id]
        
        # Prepare content for the message
        content_parts = []
        
        # Process uploaded file
        if uploaded_file and uploaded_file.filename:
            filename = uploaded_file.filename.lower()
            print(f"Processing file: {filename}")
            
            if filename.endswith(".pdf"):
                extracted_text = extract_pdf_text(uploaded_file.stream)
                if extracted_text:
                    content_parts.append(f"Content from uploaded PDF '{uploaded_file.filename}':\n\n{extracted_text}\n\n")
                else:
                    content_parts.append(f"I received a PDF file named '{uploaded_file.filename}' but couldn't extract its content. ")
            
            elif filename.endswith((".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp")):
                image_data = process_image(uploaded_file.stream)
                if image_data:
                    content_parts.append(image_data)
                    if user_input:
                        content_parts.append(f"User question about the image: {user_input}")
                    else:
                        content_parts.append("Please describe what you see in this image.")
                else:
                    content_parts.append(f"I received an image file named '{uploaded_file.filename}' but couldn't process it. ")
            
            else:
                # For other file types, just acknowledge receipt
                content_parts.append(f"I received a file named '{uploaded_file.filename}' but I can only process PDF and image files currently.")
        
        # Add user message if provided
        if user_input and not (uploaded_file and uploaded_file.filename.endswith((".png", ".jpg", ".jpeg", ".gif", ".bmp", ".webp"))):
            content_parts.append(user_input)
        
        # If no content parts, add a default message
        if not content_parts:
            content_parts.append("Hello! How can I help you today?")
        
        print(f"Sending to Gemini: {len(content_parts)} parts")
        
        # Send message to Gemini
        response = chat.send_message(
            content=content_parts,
            generation_config=genai.types.GenerationConfig(
                temperature=0.2,
                max_output_tokens=500,
            )
        )
        
        # Get the response text
        response_text = response.text
        print(f"Gemini response: {response_text[:100]}...")
        
        return jsonify({
            "response": response_text,
            "conversation_id": conversation_id,
            "status": "success"
        })
    
    except Exception as e:
        print(f"Error in chatbot_response: {str(e)}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": str(e),
            "response": "I'm sorry, I encountered an error while processing your request. Please try again.",
            "status": "error"
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "message": "Chatbot API is running"})

if __name__ == '__main__':
    print("Starting Flask chatbot server...")
    app.run(debug=True, host='0.0.0.0', port=5000)