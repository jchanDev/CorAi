FROM ubuntu:latest

RUN apt-get update \
    && apt-get install -y python3 python3-pip git ffmpeg wget

WORKDIR /app

COPY main.py requirements.txt /app/
COPY whisper.cpp /app/whisper.cpp/

EXPOSE 80

RUN cd whisper.cpp && make && cd ..
RUN pip3 install -r requirements.txt
RUN mkdir temp

CMD ["uvicorn", "--timeout-keep-alive", "600", "--host", "0.0.0.0", "--port", "80", "main:app"]
# CMD ["gunicorn", "--timeout 600", "--bind 0.0.0.0:3100", "main:app" ]