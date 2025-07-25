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
            <td>
                <div
                    className="stats-graph-button"
                    id={props.id}
                    onClick={() => props.viewTrackingHistory(props.id)}
                >
                    <MdIcons.MdOutlineBarChart />
                </div>
            </td>
            <td className="cell">{props.index}</td>
            <td className="image-holder">
                <img src={props.cover_art} alt="cover art" id="cover-art" />
            </td>
            <td className="cell">{props.track_name}</td>
            <td className="cell">{props.track_album}</td>
            <td className="cell">{props.track_artists}</td>
        </tr>
    );
}

export default SongTrackingCard;