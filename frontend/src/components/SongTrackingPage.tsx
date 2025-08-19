import React, { useState, useEffect } from "react";
import SidePanel from "./SidePanel";
import Header from "./Header";
import Footer from "./Footer";
import SongTrackingCard from "./SongTrackingCard";
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
import { API_URL } from "../constants";
import "../css/SongTrackingPage.css";
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

interface Song {
    id: string;
    index: number;
    cover_art: string;
    track_name: string;
    track_album: string;
    track_artists: string;
}

const SongTrackingPage: React.FC = () => {
    const [songs, setSongs] = useState<Song[]>([]);
    const [sidePanelOpen, setSidePanelOpen] = useState(false);
    const [selectedTerm, setSelectedTerm] = useState<string>("short_term");
    const [graphData, setGraphData] = useState<{dates: string[], ranks: number[]} | null>(null);
    const [graphSongId, setGraphSongId] = useState<string | null>(null);
    const { user } = useUser();

    useEffect(() => {
        fetchSongs(selectedTerm);
    }, [selectedTerm]);

    const fetchSongs = async (term: string) => {
        try {
            const response = await fetch(`${API_URL}/api/get-song-tracking/${term}`, {
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            const data = await response.json();

            if (data.status === "success") {
                setSongs(data.tracking_table || []);
            } else {
                console.error("Error fetching songs:", data.error);
                return;
            }
        } catch (error) {
            console.error("Failed to fetch songs:", error);
        }
    };

    const handleTermClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setSelectedTerm(e.currentTarget.id);
    };

    const viewTrackingHistory = async (id: string) => {
        const requestBody = { type: "song", term: selectedTerm, id };
        
        try {
            const response = await fetch(`${API_URL}/api/tracking-graph`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.status === "success" && data.graph) {
                setGraphData({ dates: data.graph.dates, ranks: data.graph.ranks });
                setGraphSongId(id);
            } else {
                console.error("No graph data available for this song");
            }
        } catch (error) {
            console.error("Failed to fetch graph data:", error);
        }
    };

    const closeGraph = () => {
        setGraphData(null);
        setGraphSongId(null);
    };

    const openSettings = () => setSidePanelOpen(true);
    const closeSettings = () => setSidePanelOpen(false);

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
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { 
                display: true, 
                text: "Song Tracking History",
                color: "#ffffff",
                font: {
                    size: 18,
                    weight: "bold" as const
                },
                padding: 20
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                min: 1,
                reverse: true,
                grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                    drawBorder: false
                },
                ticks: {
                    stepSize: 1,
                    color: "#b3b3b3",
                    font: {
                        size: 12
                    },
                    callback: function(tickValue: string | number) {
                        if (typeof tickValue === "number" && Number.isInteger(tickValue)) {
                            return tickValue;
                        }
                        return null;
                    }
                }
            },
            x: {
                grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                    drawBorder: false
                },
                ticks: {
                    maxTicksLimit: 8,
                    color: "#b3b3b3",
                    font: {
                        size: 12
                    }
                }
            }
        },
        elements: {
            point: {
                backgroundColor: "#1db954",
                borderColor: "#ffffff",
                borderWidth: 2,
                radius: 3,
                hoverRadius: 5
            },
            line: {
                borderWidth: 3
            }
        }
    };

    return (
        <div className="song-content-wrapper">
            <SidePanel open={sidePanelOpen} closeSettings={closeSettings} user={user || undefined} />
            <Header openSettings={openSettings} sidePanelOpen={sidePanelOpen} />
            <div className="song-button-holder">
                <button className="song-time-selector" id="short_term" onClick={handleTermClick} style={{ backgroundColor: selectedTerm === "short_term" ? "#353535" : "#242424" }}>Previous 4 Weeks</button>
                <button className="song-time-selector" id="medium_term" onClick={handleTermClick} style={{ backgroundColor: selectedTerm === "medium_term" ? "#353535" : "#242424" }}>Previous 6 Months</button>
                <button className="song-time-selector" id="long_term" onClick={handleTermClick} style={{ backgroundColor: selectedTerm === "long_term" ? "#353535" : "#242424" }}>Previous Year</button>
            </div>
            <div id="song-table-body">
                <div className="song-list">
                    {songs.map((item) => (
                        <SongTrackingCard key={item.id} {...item} viewTrackingHistory={viewTrackingHistory} />
                    ))}
                </div>
            </div>
            {graphData && (
                <div id="song-graph-holder">
                    <button id="close-graph-button" onClick={closeGraph}>×</button>
                    <Line data={chartData!} options={chartOptions} />
                </div>
            )}
            <Footer />
        </div>
    );
};

export default SongTrackingPage;