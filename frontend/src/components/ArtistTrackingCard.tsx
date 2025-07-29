import React from "react";
import * as MdIcons from "react-icons/md";

interface ArtistTrackingCardProps {
    id: string;
    index: number;
    image: string;
    name: string;
    viewTrackingHistory: (id: string) => void;
}

const ArtistTrackingCard: React.FC<ArtistTrackingCardProps> = ({ id, index, image, name, viewTrackingHistory }) => (
    <div className="artist-holder" key={id}>
        <div className="artist-image-holder">
            <img className="artist-profile" src={image} alt={name} />
        </div>
        <div className="artist-cell">{index}. {name}</div>
        <div className="artist-stats-graph-button" id={id} onClick={() => viewTrackingHistory(id)}>
            <MdIcons.MdOutlineBarChart />
        </div>
    </div>
);

export default ArtistTrackingCard; 