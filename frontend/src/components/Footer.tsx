import React, { useEffect, useRef, useState } from "react";
import "../css/Footer.css";
import { API_URL } from "../constants";

function Footer() {
    const [currentlyPlaying, setCurrentlyPlaying] = useState<any>(null);
    const [progressBarColor, setProgressBarColor] = useState<string>("#1db954");
    const imgRef = useRef<HTMLImageElement>(null);
    const [localProgressMs, setLocalProgressMs] = useState<number>(0);
    const LOADING_INTERVAL = 200;

    useEffect(() => {
        fetchCurrentlyPlaying();
    
        // update currently playing song every 10 seconds
        const interval = setInterval(() => {
            fetchCurrentlyPlaying();
        }, 10000);
    
        return () => clearInterval(interval);
    }, []);

    const fetchCurrentlyPlaying = async () => {
        try {
            const response = await fetch(`${API_URL}/api/currently-playing`, {
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();

            if (data.status === "success") {
                if (data.current) {
                    setCurrentlyPlaying(data.current);
                    setLocalProgressMs(data.current.progress_ms);
                    //average colour of the album cover when song changes
                    setProgressBarColor(data.average_colour);
                } else {
                    setCurrentlyPlaying(null);
                    setLocalProgressMs(0);
                    setProgressBarColor("#1db954")
                }
            } else {
                console.error("Error fetching current song:", data.error);
                return;
            }
        } catch (error) {
            console.error("Failed to fetch current song:", error);
        }
    };

    //locally animate progress bar
    useEffect(() => {
        if (!currentlyPlaying || !currentlyPlaying.is_playing || !currentlyPlaying.item) return;
        const duration = currentlyPlaying.item.duration_ms;
        if (localProgressMs >= duration) return;
        const interval = setInterval(() => {
            setLocalProgressMs(prev => {
                if (currentlyPlaying && currentlyPlaying.is_playing && currentlyPlaying.item && prev < duration) {
                    return prev + LOADING_INTERVAL;
                }
                return prev;
            });
        }, LOADING_INTERVAL);
        return () => clearInterval(interval);
    }, [currentlyPlaying, localProgressMs]);

    let progressPercent = 0;
    if (
        currentlyPlaying &&
        currentlyPlaying.item &&
        currentlyPlaying.item.duration_ms
    ) {
        progressPercent = (localProgressMs / currentlyPlaying.item.duration_ms) * 100;
    }

    return (
        <footer>
            {currentlyPlaying && currentlyPlaying.item ? (
            <>
                <div className="currently-playing-box">
                          
                    <img
                        ref={imgRef}
                        className="current-song-image"
                        src={currentlyPlaying.item.album.images[0].url}
                        alt="Current Song"
                    />
                    <div className="name-album-text-holder">
                        <span className="current-song-name">{currentlyPlaying.item.name}</span>
                        <span className="current-song-artist">{currentlyPlaying.item.artists.map((artist: any) => artist.name).join(", ")}</span>
                        <span className="current-song-album">{currentlyPlaying.item.album.name}</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar" style={{ width: `${progressPercent}%`, background: progressBarColor }}></div>
                    </div>
                
                </div>
            </>) : (
                <div className="currently-playing-placeholder"></div>
            )}
      </footer>
    );
}

export default Footer;