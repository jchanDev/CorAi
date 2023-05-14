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
import ReactMarkdown from "react-markdown";

const MainTab = () => {
  var transcriptText = "";
  var notesText = "";
  var reviewText = "";

  const {
    status,
    startRecording,
    pauseRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    blobPropertyBag: { type: "audio/mp3" },
  });
  const [text, setText] = useState("");
  const transcriber = async () => {
    if (text) {
      var data = await callNotesEndpoint(text);
    } else {
      const audioBlob = await fetch(mediaBlobUrl!!).then((r) => r.blob());
      const audio = new File([audioBlob], "audio.mp3", { type: "audio/mp3" });
      const formData = new FormData();
      formData.append("file", audio);
      var data = await callTranscribeEndpoint(formData);
    }
    setPaperOptions((paperOptions) => [
      {
        displayTab: false,
        label: "Transcript",
        color: false,
        text: { transcript: data.transcript },
      },
      {
        displayTab: true,
        label: "Notes",
        color: true,
        text: { notes: data.notes },
      },
      {
        displayTab: false,
        label: "Review questions",
        color: false,
        text: { reviewQuestions: data.review_questions },
      },
    ]);
    transcriptText = data.transcript;
    notesText = data.notes;
    reviewText = data.reviewQuestions;
    setTranscribed(true);

    /*var element = document.createElement("a");
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
        });*/
  };

  const transcript = "This is a transcript";
  const notes = "These are notes";
  const reviewQuestions = "These are review questions";

  const [showMainTab, setShowMainTab] = useState(false);
  const [transcribed, setTranscribed] = useState(false);
  const handleClick = () => {
    setShowMainTab(true);
  };
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
      text: { transcript: transcriptText },
    },
    {
      displayTab: false,
      label: "Notes",
      color: false,
      text: { notes: notesText },
    },
    {
      displayTab: false,
      label: "Review questions",
      color: false,
      text: { reviewQuestions: reviewText },
    },
  ]);

  async function callTranscribeEndpoint(formdata: FormData): Promise<any> {
    const url = "http://localhost:3000/transcribe";

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formdata,
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
    const url = "http://localhost:3000/notes";

    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({ notes: text }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Error calling API endpoint");
      }

      const data = await response.json();
      return { ...data, transcript: text };
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  }

  const changePaperContent = (index: number) => {
    const updatedOptions = paperOptions.map((option, i) => ({
      label: option.label,
      displayTab: transcribed && i === index ? true : false,
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
          ) : (
            <ReactMarkdown>
              {
                Object.values(
                  paperOptions.find((option) => option.displayTab === true)
                    ?.text || {}
                )[0]
              }
            </ReactMarkdown>
          )}
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
            <button onClick={transcriber} className="record-button">
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
