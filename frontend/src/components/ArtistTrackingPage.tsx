import React, { useState } from 'react';
import SidePanel from './SidePanel';
import Header from './Header';
import Footer from './Footer';

const user = {
  external_urls: { spotify: '#' },
  images: [{}, { url: undefined }],
  display_name: 'Display Name',
  user_name: 'Username',
};

const ArtistTrackingPage: React.FC = () => {
  const [sidePanelOpen, setSidePanelOpen] = useState(false);

  const openSettings = () => setSidePanelOpen(true);
  const closeSettings = () => setSidePanelOpen(false);
  const updateTracking = (e: React.MouseEvent<HTMLButtonElement>) => {};
  const closeGraph = () => {};

  return (
    <div>
      <SidePanel open={sidePanelOpen} closeSettings={closeSettings} user={user} />

      <div id="graph_holder">
        <div id="close_graph_button" onClick={closeGraph}>x</div>
        <canvas id="graph_canvas"></canvas>
      </div>

      <Header openSettings={openSettings} sidePanelOpen={sidePanelOpen} />

      <div className="button_holder">
            <button className="time_selector" id="short_term" onClick={updateTracking}>Previous 4 Weeks</button>
            <button className="time_selector" id="medium_term" onClick={updateTracking}>Previous 6 Months</button>
            <button className="time_selector" id="long_term" onClick={updateTracking}>All Time</button>
      </div>

      <div id="table_body"></div>

      <Footer />
    </div>
  );
};

export default ArtistTrackingPage; 