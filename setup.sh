#! /bin/bash
# yes | unminimize
sudo apt update
sudo apt install python3 python3-pip git ffmpeg wget -y
git clone https://github.com/jchanDev/CorAi.git
cd CorAi
pip3 install -r requirements.txt
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
bash ./models/download-ggml-model.sh base.en
make
cd ..
python3 -m uvicorn main:app --host 0.0.0.0 --port 80