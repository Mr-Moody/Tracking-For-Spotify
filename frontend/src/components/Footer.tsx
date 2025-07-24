import React from "react";
import "../css/Footer.css";

function Footer() {
    return (
        <footer>
            <div id="currently_playing_box">
                <img id="current_song_image" src="" alt="Current Song" />
                <div className="name_album_text_holder">
                    <div id="current_song_name"></div>
                    <div id="current_song_album"></div>
                </div>
            </div>
            {/* <div className="filter_queue">
            <span>[icon]</span>
            </div> */}
      </footer>
    );
}

export default Footer;