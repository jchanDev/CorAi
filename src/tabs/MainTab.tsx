//MainTab.tsx
import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrophone,
  faPause,
  faPlay,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";

import ReactQuill from "react-quill";
import { useReactMediaRecorder } from "react-media-recorder";
import "react-quill/dist/quill.snow.css";
import "../App.css";

//const mimeType = "audio/webm";
const MainTab = () => {
  const {
    status,
    startRecording,
    pauseRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({ audio: true });
  const download = () => {
    if (mediaBlobUrl) {
      var element = document.createElement("a");
      element.setAttribute("href", mediaBlobUrl);
      element.setAttribute("download", "audio.webm");
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  const [showMainTab, setShowMainTab] = useState(false);
  /*const [permission, setPermission] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const [recordingStatus, setRecordingStatus] = useState("inactive");
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audio, setAudio] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const getMicPermission = async () => {
    try {
      const streamData = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      setPermission(true);
      setStream(streamData);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Unknown error");
      }
    }
  };

  const startRecording = async () => {
    setRecordingStatus("recording");
    //create new Media recorder instance using the stream
    if (stream) {
      const media = new MediaRecorder(stream, { mimeType });
      //set the MediaRecorder instance to the mediaRecorder ref
      mediaRecorder.current = media;
      //invokes the start method to start the recording process
      mediaRecorder.current.start();
      let localAudioChunks: Blob[] = [];
      mediaRecorder.current.ondataavailable = (event) => {
        if (typeof event.data === "undefined") return;
        if (event.data.size === 0) return;
        localAudioChunks.push(event.data);
      };
      setAudioChunks(localAudioChunks);
    }
  };
  const stopRecording = () => {
    setRecordingStatus("inactive");
    //stops the recording instance
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      mediaRecorder.current.onstop = () => {
        //creates a blob file from the audiochunks data
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        //creates a playable URL from the blob file.
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudio(() => audioUrl);
        setAudioChunks([]);
      };
    }
  };*/

  const handleClick = () => {
    setShowMainTab(true);
  };
  const [text, setText] = useState("");
  console.log(text);
  const [paperOptions, setPaperOptions] = useState([
    { label: "Transcript", color: true },
    { label: "Notes", color: false },
    { label: "Review questions", color: false },
  ]);

  const changePaperContent = (index: number) => {
    const updatedOptions = paperOptions.map((option, i) => ({
      label: option.label,
      color: i === index ? true : false,
    }));
    setPaperOptions(updatedOptions);
  };
  return (
    <div className="main-tab-container">
      <button className="main-tab-button" onClick={handleClick}>
        CorAI
      </button>
      <div className="main-tab-line"></div>

      <div className="main-body-container">
        <div className="paper">
          <ReactQuill
            value={text}
            onChange={setText}
            style={{ color: "black" }}
            placeholder="Or paste your notes here"
          />
        </div>
        <div className="paper-options">
          {paperOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => changePaperContent(index)}
              style={{
                color: option.color ? "#dbdbdb" : "#fff",
                backgroundColor: option.color ? "#98a5b8" : "#647A9C",
              }}
              className="paper-option-buttons"
            >
              {option.label}
            </button>
          ))}

          <button onClick={startRecording} className="record-button">
            <div className="mic-icon">
              <FontAwesomeIcon icon={faMicrophone} />
              <div className="mic-text">Record</div>
            </div>
          </button>

          {status === "recording" && (
            <button onClick={stopRecording} className="record-button">
              <div className="mic-icon">
                <FontAwesomeIcon icon={faPause} />
                <div className="mic-text">Stop</div>
              </div>
            </button>
          )}

          {status === "stopping" ||
            (status === "stopped" && (
              <button onClick={download} className="record-button">
                <div className="mic-icon">
                  <FontAwesomeIcon icon={faDownload} />
                  <div className="mic-text">Download</div>
                </div>
              </button>
            ))}
        </div>
      </div>
      {showMainTab && <div>Main tab content</div>}
    </div>
  );
};
export default MainTab;
