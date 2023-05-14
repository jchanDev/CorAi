yes | unminimize
apt update
apt install python3 python3-pip git ffmpeg wget -y
git clone https://github.com/jchanDev/CorAi.git
cd CorAi
pip3 install -r requirements.txt
git clone https://github.com/ggerganov/whisper.cpp.git
cd whisper.cpp
bash ./models/download-ggml-model.sh base.en
make
cd ..

