from fastapi import FastAPI, UploadFile, File
import subprocess
import openai
import dotenv
import os
import re

from pydantic import BaseModel

class Notes(BaseModel):
    notes: str

dotenv.load_dotenv('.env')
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    filename = file.filename.split(".")[0]
    file_path = f"temp/{filename}.mp4"
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # write to wav file
    wav_file_path = f"temp/{filename}-converted.wav"
    ffmpeg_command = ["ffmpeg", "-i", file_path, "-ar", "16000", "-vn", "-acodec",  "pcm_s16le", wav_file_path]
    subprocess.run(ffmpeg_command, check=True)
    
    # remove original file
    os.remove(file_path)

    # process with whisper
    transcript = whisper_transcribe(wav_file_path)
    notes = gpt_notes(transcript)
    review_questions = gpt_review_questions(notes)

    # remove wav file
    os.remove(wav_file_path)

    return {"transcript": transcript,
            "notes": notes,
            "review_questions": review_questions}

@app.post("/notes")
async def notes(notes: Notes):
    gpt_results = gpt_notes(notes.notes)
    return {"notes": gpt_results}

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

        reply = response['choices'][0]['message']['content']
        review_questions.append(reply)
    return '\n'.join(review_questions)