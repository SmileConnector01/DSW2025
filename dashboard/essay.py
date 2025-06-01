# # For system instructions and configurations (comment also where I can add more data to configure the ai provided from the documentation)
# # (From the documentation) --> You can guide the behavior of Gemini models with system instructions. To do so, pass a GenerateContentConfig object.
# from google import genai
# from google.genai import types

# client = genai.Client(api_key="GEMINI_API_KEY")

# response = client.models.generate_content(
#     model="gemini-2.0-flash",
#     config=types.GenerateContentConfig(
#         system_instruction="You are SmileConnector Assistant. Your name is Assistant Smila."),
#     contents="Hello there" #example for testing
# )

# print(response.text)

# # (From the documentation) --> The GenerateContentConfig object also lets you override default generation parameters, such as temperature.
# # I need this ppart also to manage the ouptut of the AI based on the temperature, you can make it and use the default mostly used on real world AI
# from google import genai
# from google.genai import types

# client = genai.Client(api_key="GEMINI_API_KEY")

# response = client.models.generate_content(
#     model="gemini-2.0-flash",
#     contents=["Explain how AI works"],
#     config=types.GenerateContentConfig(
#         max_output_tokens=500,
#         temperature=0.1
#     )
# )
# print(response.text)

# # Multimodal inputs (I will need this part for managing the modal to understand the prompt text and files upload such as pdf, images and all types of files the modal could be able to understand)
# # (From the documentation)--> The Gemini API supports multimodal inputs, allowing you to combine text with media files. The following example demonstrates providing an image:

# from PIL import Image
# from google import genai

# client = genai.Client(api_key="GEMINI_API_KEY")

# image = Image.open("/path/to/organ.png")
# response = client.models.generate_content(
#     model="gemini-2.0-flash",
#     contents=[image, "Tell me about this instrument"]
# )
# print(response.text)

# # Multi-turn conversations (Chat) # I need this part for the Ai to actively track conversation ongoing from the current user and to stream the output instead of waiting for the modal to finish, it's much better to have real time typing
# # (From the documentation)--> Our SDKs provide functionality to collect multiple rounds of prompts and responses into a chat, giving you an easy way to keep track of the conversation history.
# # Streaming can also be used for multi-turn conversations.

# from google import genai

# client = genai.Client(api_key="GEMINI_API_KEY")
# chat = client.chats.create(model="gemini-2.0-flash")

# response = chat.send_message_stream("I have 2 dogs in my house.")
# for chunk in response:
#     print(chunk.text, end="")

# response = chat.send_message_stream("How many paws are in my house?")
# for chunk in response:
#     print(chunk.text, end="")

# for message in chat.get_history():
#     print(f'role - {message.role}', end=": ")
#     print(message.parts[0].text)

# # Upload an image file (From the documentation)--> The Gemini API supports uploading image files. You can use the Files API to upload an image file)
# # You can use the Files API to upload an image file. Always use the Files API when the total request size (including the file, text prompt, system instructions, etc.) is larger than 20 MB, or if you intend to use the same image in multiple prompts.

# # The following code uploads an image file and then uses the file in a call to generateContent.

# from google import genai

# client = genai.Client(api_key="GOOGLE_API_KEY")

# my_file = client.files.upload(file="path/to/sample.jpg")

# response = client.models.generate_content(
#     model="gemini-2.0-flash",
#     contents=[my_file, "Caption this image."],
# )

# print(response.text)

# #Upload a file (this one is for general files upload) I feel it's better but just use the best approcah to handle the process
# #You can use the Files API to upload a media file. Always use the Files API when the total request size (including the files, text prompt, system instructions, etc.) is larger than 20 MB.

# #The following code uploads a file and then uses the file in a call to generateContent.

# from google import genai

# client = genai.Client(api_key="GOOGLE_API_KEY")

# myfile = client.files.upload(file="path/to/sample.mp3")

# response = client.models.generate_content(
#     model="gemini-2.0-flash", contents=["Describe this audio clip", myfile] # just an example
# )

# print(response.text)


# You are SmileConnector Assistant, an AI assistant created by Divine Mathem's. 
# Your name is Assistant Smila. Be friendly, professional, and helpful.

# Key characteristics:
# - Specialized in dental health, nutrition, programming, and travel advice
# - Provide accurate, well-formatted responses with markdown when helpful
# - For code, use proper syntax highlighting
# - For lists, use bullet points
# - Always maintain a positive, helpful tone

# When asked about your creator, you may mention:
# "I was created by Divine Mathem's, a computer science student at the University of Johannesburg."
# Otherwise, focus on the user's questions.