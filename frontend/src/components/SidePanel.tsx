import { Link } from "react-router-dom";
import React, { useState } from "react";
import "../css/SidePanel.css";
import { MdPersonOutline } from "react-icons/md";

interface User {
  external_urls: { spotify: string };
  profile_image?: string;
  display_name?: string;
  user_name: string;
}

interface SidePanelProps {
  user?: User;
  closeSettings: () => void;
  open: boolean;
}

const SidePanel: React.FC<SidePanelProps> = ({ user, closeSettings, open }) => {
  const signOut = () => {};
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className={`side-panel${open ? ' open' : ''}`}>
      <div className={`close-settings-button${open ? ' rotated' : ''}`} onClick={closeSettings}>&#9776;</div>
      <div className="user-container">
        {user ? (
          <div className="profile-card" title="Open Spotify Account" onClick={() => window.open(user.external_urls.spotify)}>
            {user.profile_image ? (
              <img
                className={`user-profile${imgLoaded ? ' loaded' : ''}`}
                src={user.profile_image}
                alt="profile"
                onLoad={() => setImgLoaded(true)}
              />
            ) : (
              <span className="user-profile-fallback">
                <MdPersonOutline size={48} />
              </span>
            )}
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