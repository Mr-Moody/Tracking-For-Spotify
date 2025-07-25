import React from "react";
import "../css/Header.css";

interface HeaderProps {
  openSettings: () => void;
  sidePanelOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ openSettings, sidePanelOpen }) => {
  return (
    <header>
      <img
        className="spotify_logo"
        src="/static/imgs/logos/Spotify_Logo_RGB_Green.png"
        title="Open Spotify"
        alt="Spotify Logo"
      />
      <button
        className={`open-settings-button${sidePanelOpen ? ' rotated' : ''}`}
        onClick={openSettings}
        aria-label="Open settings"
      >
        &#9776;
      </button>
    </header>
  );
};

export default Header;