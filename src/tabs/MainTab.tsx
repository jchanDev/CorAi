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
      setPaperOptions(paperOptions => paperOptions.map((option, i) => {
        if (i === 1) {
          return {
            ...option,
            displayTab: true,
            color: true,
          };
        } else {
            return {...option, color: false};
        }
      }));
      setTranscribed(true);
      var element = document.createElement("a");
      element.setAttribute("href", mediaBlobUrl);
      element.setAttribute("download", "audio.mp3");
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return fetch(mediaBlobUrl)
        .then((response) => response.blob())
        .then((blob) => {
          return {
            blob: blob,
            filename: "audio.mp3",
          };
        });
    }
  };

  const transcript = "This is a transcript";
  const notes = "These are notes";
  const reviewQuestions = "These are review questions";

  const [showMainTab, setShowMainTab] = useState(false);
  const [transcribed, setTranscribed] = useState(false);
  const [notesTab, setnotesTab] = useState(false);
  const [reviewQuesTab, setQuesTab] = useState(false);

  const handleClick = () => {
    setShowMainTab(true);
  };
  const [text, setText] = useState("");
  console.log(text);
  /*const [paperOptions, setPaperOptions] = useState([
    { label: "Transcript", color: true, text: { transcript } },
    { label: "Notes", color: false, text: { notes } },
    { label: "Review questions", color: false, text: { reviewQuestions } },
  ]);*/

  type PaperOption = {
    displayTab: boolean;
    label: string;
    color: boolean;
    text:
      | { transcript: string }
      | { notes: string }
      | { reviewQuestions: string };
  };

  const [paperOptions, setPaperOptions] = useState<PaperOption[]>([
    {
      displayTab: false,
      label: "Transcript",
      color: false,
      text: { transcript: "transcript text" },
    },
    {
      displayTab: false,
      label: "Notes",
      color: false,
      text: { notes: "notes text" },
    },
    {
      displayTab: false,
      label: "Review questions",
      color: false,
      text: { reviewQuestions: "review questions text" },
    },
  ]);

  async function callTranscribeEndpoint(file: File): Promise<any> {
    const url = "http://20.124.194.25:80/transcribe";

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error calling API endpoint");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  async function callNotesEndpoint(text: string): Promise<any> {
    const url = "http://20.124.194.25:80/notes";

    const formData = new FormData();
    formData.append("text", text);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error calling API endpoint");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  const changePaperContent = (index: number) => {
    const updatedOptions = paperOptions.map((option, i) => ({
      label: option.label,
      displayTab: transcribed && (i === index) ? true : false,
      color: i === index ? true : false,
      text: option.text,
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
          {transcribed === false ? (
            <ReactQuill
              value={text}
              onChange={setText}
              style={{ color: "black" }}
              placeholder="Or paste your notes here"
            />
          ) : Object.values(paperOptions.find((option) => option.displayTab === true)?.text || {})[0]} 

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

          {status === "stopping" || status === "stopped" || text !== "" ? (
            <button onClick={download} className="record-button">
              <div className="mic-icon">
                <FontAwesomeIcon icon={faDownload} />
                <div className="mic-text">Transcribe</div>
              </div>
            </button>
          ) : null}
        </div>
      </div>
      {showMainTab && <div>Main tab content</div>}
    </div>
  );
};
export default MainTab;
