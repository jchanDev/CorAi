//MainTab.tsx
import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrophone } from '@fortawesome/free-solid-svg-icons';
import "../App.css";
const MainTab = () => {
    const [showMainTab, setShowMainTab] = useState(false);

    const handleClick = () => {
        setShowMainTab(true);
    };
  return (
    <div className="main-tab-container">
        <button className="main-tab-button" onClick={handleClick}>CorAi</button>
        <div className="main-tab-line"></div>
        <button className="record-button">
            <div className="mic-icon">
                <FontAwesomeIcon icon={faMicrophone}/>
                <div className="mic-text">
                Record
                </div>
            </div>
        </button>
        <div className="main-body-container">
            <div className="paper"/>
            <div className="paper-options"/>
        </div>
        {showMainTab}
    </div>
  );
};
export default MainTab;


