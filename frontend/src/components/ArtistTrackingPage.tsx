import React, { useEffect, useState } from "react";
import SidePanel from "./SidePanel";
import Header from "./Header";
import Footer from "./Footer";
import ArtistTrackingCard from "./ArtistTrackingCard";
import { API_URL } from "../constants";
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import "../css/ArtistTrackingPage.css";
import { useUser } from "../UserContext";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface Artist {
    id: string;
    index: number;
    name: string;
    image: string;
}

const ArtistTrackingPage: React.FC = () => {
    const [sidePanelOpen, setSidePanelOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState("short_term");
    const [artists, setArtists] = useState<Artist[]>([]);
    const [graphData, setGraphData] = useState<{dates: string[], ranks: number[]} | null>(null);
    const [graphArtistId, setGraphArtistId] = useState<string | null>(null);
    const { user } = useUser();

    useEffect(() => {
        fetchArtists(selectedTerm);
    }, [selectedTerm]);

    const fetchArtists = async (term: string) => {
        try {
            const response = await fetch(`${API_URL}/api/get-artist-tracking/${term}`, {
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();
            if (data.status === "success") {
                setArtists(data.tracking_table || []);
            } else {
                setArtists([]);
            }
        } catch (error) {
            setArtists([]);
        }
    };

    const openSettings = () => setSidePanelOpen(true);
    const closeSettings = () => setSidePanelOpen(false);

    const handleTermClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setSelectedTerm(e.currentTarget.id);
    };

    const viewTrackingHistory = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/tracking-graph`, {
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: "artist", term: selectedTerm, id })
            });
            const data = await response.json();
            setGraphData({ dates: data.dates, ranks: data.ranks });
            setGraphArtistId(id);
        } catch (error) {
            console.error("Failed to fetch graph data:", error);
        }
    };

    const closeGraph = () => {
        setGraphData(null);
        setGraphArtistId(null);
    };

    const chartData = graphData ? {
        labels: graphData.dates,
        datasets: [
            {
                label: "Rank",
                data: graphData.ranks,
                fill: false,
                backgroundColor: "#1DB954",
                borderColor: "#1DB954",
                tension: 0.2,
            },
        ],
    } : undefined;

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: "Artist Tracking History" },
        },
        scales: {
            y: {
                beginAtZero: true,
                min: 1,
                reverse: true,
                ticks: {
                    stepSize: 1,
                    callback: function(tickValue: string | number) {
                        if (typeof tickValue === "number" && Number.isInteger(tickValue)) {
                            return tickValue;
                        }
                        return null;
                    }
                }
            },
            x: {
                ticks: {
                    maxTicksLimit: 8
                }
            }
        }
    };

    return (
        <div>
            <SidePanel open={sidePanelOpen} closeSettings={closeSettings} user={user || undefined} />
            <Header openSettings={openSettings} sidePanelOpen={sidePanelOpen} />
            <div className="artist-button-holder">
                <button className="artist-time-selector" id="short_term" onClick={handleTermClick}>Previous 4 Weeks</button>
                <button className="artist-time-selector" id="medium_term" onClick={handleTermClick}>Previous 6 Months</button>
                <button className="artist-time-selector" id="long_term" onClick={handleTermClick}>All Time</button>
            </div>
            <div id="artist-table-body">
                {artists.map((artist, idx) => (
                    <ArtistTrackingCard key={artist.id} id={artist.id} index={artist.index ?? idx + 1} image={artist.image} name={artist.name} viewTrackingHistory={viewTrackingHistory} />
                ))}
            </div>
            {graphData && (
                <div id="artist-graph-holder" style={{ visibility: "visible", height: "300px", width: "400px", transition: "0.5s" }}>
                    <div id="close-graph-button" onClick={closeGraph} style={{ cursor: "pointer" }}>x</div>
                    <Line data={chartData!} options={chartOptions} />
                </div>
            )}
            <Footer />
        </div>
    );
};

export default ArtistTrackingPage; 