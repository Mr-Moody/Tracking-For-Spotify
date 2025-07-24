import { API_URL } from "../constants";
import "../css/LoginPage.css";

function LoginPage() {

    const handleLogin = () => {
        window.location.href = `${API_URL}/auth/spotify-login`;
    }

    return (
        <div>
            <h1>Tracking For Spotify</h1>

            <div className="sign_in_button" onClick={handleLogin}>Login</div>
        </div>
    )
}

export default LoginPage;