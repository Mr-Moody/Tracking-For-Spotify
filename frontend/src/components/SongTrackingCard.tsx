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
    return (
        <tr key={props.id}>
            <td className="song-cell">
                <div className="song-stats-graph-button" id={props.id} onClick={() => props.viewTrackingHistory(props.id)}>
                    <MdIcons.MdOutlineBarChart />
                </div>
            </td>
            <td className="song-cell">{props.index}</td>
            <td className="song-image-holder">
                <img src={props.cover_art} alt="cover art" className="song-cover-art" />
            </td>
            <td className="song-cell">{props.track_name}</td>
            <td className="song-cell">{props.track_album}</td>
            <td className="song-cell">{props.track_artists}</td>
        </tr>
    );
}

export default SongTrackingCard;