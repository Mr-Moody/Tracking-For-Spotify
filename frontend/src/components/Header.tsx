import React from "react";
import "../css/Header.css";

interface HeaderProps {
  openSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({ openSettings }) => {
  return (
    <header>
      <img
        className="spotify_logo"
        src="/static/imgs/logos/Spotify_Logo_RGB_Green.png"
        title="Open Spotify"
        alt="Spotify Logo"
      />
      <button className="open-settings-button" onClick={openSettings}>&#9776;</button>
    </header>
  );
};

export default Header;