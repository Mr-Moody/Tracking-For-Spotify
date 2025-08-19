import { API_URL } from "../constants";
import "../css/LoginPage.css";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../UserContext";

function LoginPage() {
    const { user, resetSignOutFlag } = useUser();

    const handleLogin = () => {
        // Reset sign out flag as user is logging in
        resetSignOutFlag();
        window.location.href = `${API_URL}/auth/spotify-login`;
    }

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate("/song-tracking");
        }
    }, [user, navigate]);

    return (
        <div>
            <h1>Tracking For Spotify</h1>

            <div className="sign_in_button" onClick={handleLogin}>Login</div>
        </div>
    )
}

export default LoginPage;