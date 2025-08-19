import React from "react";
import * as MdIcons from "react-icons/md";

interface SongTrackingCardProps {
    id: string;
    index: number;
    cover_art: string;
    track_name: string;
    track_album: string;
    track_artists: string;
    viewTrackingHistory: (id: string) => void;
}

function SongTrackingCard(props: SongTrackingCardProps) {
    const handleRowClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        props.viewTrackingHistory(props.id);
    };

    return (
        <div className="table-row" key={props.id} onClick={handleRowClick} style={{ userSelect: "none" }}>
            <div className="song-cell">
                <div className="song-stats-graph-button">
                    <MdIcons.MdOutlineBarChart />
                </div>
            </div>
            <div className="song-cell">{props.index}</div>
            <div className="song-image-holder">
                <img src={props.cover_art} alt="cover art" className="song-cover-art" />
            </div>
            <div className="song-cell">{props.track_name}</div>
            <div className="song-cell">{props.track_album}</div>
            <div className="song-cell">{props.track_artists}</div>
        </div>
    );
}

export default SongTrackingCard;