import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import NotFoundPage from './components/NotFoundPage';
import SongTrackingPage from './components/SongTrackingPage';
import ArtistTrackingPage from './components/ArtistTrackingPage';
import GenreTrackingPage from './components/GenreTrackingPage';
import TagEditorPage from './components/TagEditorPage';
import LoginPage from './components/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/song-tracking" element={<SongTrackingPage />} />
        <Route path="/artist-tracking" element={<ArtistTrackingPage />} />
        <Route path="/genre-tracking" element={<GenreTrackingPage />} />
        <Route path="/tag-editor" element={<TagEditorPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
