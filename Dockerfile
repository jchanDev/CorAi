FROM jrottenberg/ffmpeg:3.2-ubuntu


RUN yes | unminimize
RUN apt-get update -y \
    && apt-get install -y python3 python3-pip git wget -y

WORKDIR /app

RUN git clone https://github.com/ggerganov/whisper.cpp.git
RUN cd whisper.cpp && bash ./models/download-ggml-model.sh base.en && make && cd .

COPY main.py requirements.txt /app/

# ENV PORT=8080
EXPOSE 80

ENV OPENAI_API_KEY=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

RUN pip3 install -r requirements.txt
RUN mkdir temp

# CMD ["uvicorn", "--timeout-keep-alive", "600", "--host", "0.0.0.0", "--port", $PORT, "main:app"]
# CMD ["gunicorn", "--timeout 600", "--bind 0.0.0.0:3100", "main:app" ]
CMD uvicorn --timeout-keep-alive 600 --host 0.0.0.0 --port 80 main:app