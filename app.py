from fastapi import FastAPI, UploadFile, File
import subprocess
import openai
import dotenv
import os
import re

dotenv.load_dotenv('.env')
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

"""
Todo: regex parse out whisper_full_with_state: progress =   5% stuff
Full whisper.cpp command: ./whisper.cpp/main -m ./whisper.cpp/models/ggml-base.en.bin -f {FILE} --no-timestamps -pp
"""

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    file_path = f"temp/{file.filename}"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # write to wav file
    wav_file_path = f"temp/{file.filename}.wav"
    ffmpeg_command = ["ffmpeg", "-i", file_path, "-ar", "16000", wav_file_path]
    subprocess.run(ffmpeg_command, check=True)

    # process with whisper
    transcript = whisper_transcribe(wav_file_path)
    notes = gpt_notes(transcript)
    review_questions = gpt_review_questions(notes)

    return {"transcript": transcript,
            "notes": notes,
            "review_questions": review_questions}

def clean_string(string):
    rgx_list = [r'\(.*\)']
    new_text = string
    for rgx_match in rgx_list:
        new_text = re.sub(rgx_match, '', new_text)
    return new_text

def whisper_transcribe(wav_file_path):
    command = ['./whisper.cpp/main', '-m', './whisper.cpp/models/ggml-base.en.bin', 
               '-f', wav_file_path, '--no-timestamps']

    process = subprocess.run(command, capture_output=True)
    string = process.stdout.decode('utf-8')
    string = clean_string(string)
    return string

def gpt_notes(transcript):
    # for every 4000 words in transcript, encode it into a new message
    transcript = transcript.split()
    transcript = [transcript[i:i+4000] for i in range(0, len(transcript), 4000)]
    transcript = [' '.join(x) for x in transcript]

    notes = []
    for message in transcript:
        response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{'role':'user', 
                    'content':'You are a helpful and knowledgable AI system.'
                              ' This is a partial recording of a lecture.'
                              ' Convert them into informative notes for a student.'
                              ' Start your notes immediately and terminate without '
                              ' a newline. Format the notes with'
                              ' bullet points using "*" for unindented points and'
                              ' "-" for indented points.\n\n' + message}])
        
        gpt_reply = response['choices'][0]['message']['content']
        notes.append(gpt_reply)
    
        return '\n'.join(notes)
    
def gpt_review_questions(notes):
    # chunk notes into 4000 word segments
    notes = notes.split()
    notes = [notes[i:i+4000] for i in range(0, len(notes), 4000)]
    notes = [' '.join(x) for x in notes]

    review_questions = []
    for message in notes:
        response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[{'role':'user', 
                    'content':'You are a helpful and knowledgable AI system.'
                              ' These are notes generated from a lecture. Convert'
                              ' them into a set of useful, challenging, and insightful'
                              ' review questions based on the material and the lectures.'
                              ' Start each question with a "*" and end without a newline:\n\n' + message}])


    """
    * Bullet Point
        - Indented bullet point
    * Other bullet
        - Indent 1
        - Indent 2
    """