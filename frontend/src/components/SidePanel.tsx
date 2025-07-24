import { Link } from "react-router-dom";
import React from "react";
import "../css/SidePanel.css";

interface User {
  external_urls: { spotify: string };
  profile_image?: string;
  display_name?: string;
  user_name: string;
}

interface SidePanelProps {
  user?: User;
  closeSettings: () => void;
}



const SidePanel: React.FC<SidePanelProps> = ({ user, closeSettings}) => {
  const signOut = () => {};

  return (
    <div className="side-panel">
      <div className="close-settings-button" onClick={closeSettings}>&#9776;</div>
      <div className="user-container">
        {user ? (
          <div className="current-user" title="Open Spotify Account" onClick={() => window.open(user.external_urls.spotify)}>
            <img className="user-profile" src={user.profile_image} alt="profile" />
            <span className="user-name">
              {user.display_name ? user.display_name : user.user_name}
            </span>
          </div>
        ) : (
          // TODO: Replace with a React icon component for person-outline
          <span className="empty-profile">[icon]</span>
        )}
      </div>
      <div className="page-locator-box">
        <Link className="page-locator" id="song-tracking" to="/song-tracking">Song Tracking</Link>
        <Link className="page-locator" id="artist-tracking" to="/artist-tracking">Artist Tracking</Link>
        <Link className="page-locator" id="genre-tracking" to="/genre-tracking">Genre Tracking</Link>
        <Link className="page-locator" id="tag-editor" to="/tag-editor">Tag Editor</Link>
      </div>
      <button className="sign-out-button" onClick={signOut}>Sign Out</button>
    </div>
  );
};

export default SidePanel;