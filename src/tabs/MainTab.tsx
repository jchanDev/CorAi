//MainTab.tsx
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrophone } from "@fortawesome/free-solid-svg-icons";
import "../App.css";
const MainTab = () => {
  const [showMainTab, setShowMainTab] = useState(false);

  const handleClick = () => {
    setShowMainTab(true);
  };
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
        <div className="paper" />
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

          <button className="record-button">
            <div className="mic-icon">
              <FontAwesomeIcon icon={faMicrophone} />
              <div className="mic-text">Record</div>
            </div>
          </button>
        </div>
      </div>
      {showMainTab && <div>Main tab content</div>}
    </div>
  );
};
export default MainTab;
