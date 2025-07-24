import React, { useState, useEffect } from "react";
import SidePanel from "./SidePanel";
import Header from "./Header";
import Footer from "./Footer";
// import any icon library as needed

// Placeholder for song data
const mockSongs = [
  {
    id: "1",
    index: 1,
    cover_art: "https://via.placeholder.com/50",
    track_name: "Song 1",
    track_album: "Album 1",
    track_artists: "Artist 1",
  },
  {
    id: "2",
    index: 2,
    cover_art: "https://via.placeholder.com/50",
    track_name: "Song 2",
    track_album: "Album 2",
    track_artists: "Artist 2",
  },
];

const SongTrackingPage: React.FC = () => {
  const [songs, setSongs] = useState(mockSongs);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const openSettings = () => setSidePanelOpen(true);
  const closeSettings = () => setSidePanelOpen(false);

  const updateTracking = (e: React.MouseEvent<HTMLButtonElement>) => {
    // TODO: Implement API call to update songs based on time range
  };

  const viewTrackingHistory = (id: string) => {
    // TODO: Implement graph modal logic
  };

  return (
    <div>
      {sidePanelOpen && <SidePanel closeSettings={closeSettings} user={undefined} />}
      <Header openSettings={openSettings} />
      <div className="button_holder">
        <button className="time_selector" id="short_term" onClick={updateTracking}>Previous 4 Weeks</button>
        <button className="time_selector" id="medium_term" onClick={updateTracking}>Previous 6 Months</button>
        <button className="time_selector" id="long_term" onClick={updateTracking}>Previous Year</button>
      </div>
      <table>
        <tbody id="table_body">
          {songs.map((item) => (
            <tr key={item.id}>
              <th>
                <div className="stats_graph_button" id={item.id} onClick={() => viewTrackingHistory(item.id)}>
                  {/* TODO: Add icon */}
                  [icon]
                </div>
              </th>
              <th className="cell">{item.index}</th>
              <th className="image_holder">
                <img src={item.cover_art} alt="cover art" id="cover_art" />
              </th>
              <th className="cell">{item.track_name}</th>
              <th className="cell">{item.track_album}</th>
              <th className="cell">{item.track_artists}</th>
            </tr>
          ))}
        </tbody>
      </table>
      <Footer />
    </div>
  );
};

export default SongTrackingPage;