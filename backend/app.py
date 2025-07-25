from flask import Flask, jsonify, redirect, render_template, request, session, Response
from flask_cors import CORS
from os import environ
from dotenv import load_dotenv
from authlib.integrations.flask_client import OAuth
from spotify import Spotify
from database import DB
from tools import date_quick_sort
from util import sanitise

load_dotenv()

FRONTEND_URL = environ.get("FRONTEND_URL", "http://localhost:3000")

FLASK_HOST = environ.get("FLASK_HOST", "localhost")
FLASK_PORT = int(environ.get("FLASK_PORT", 5000))
FLASK_DEBUG = environ.get("FLASK_DEBUG", "True").lower() == "true"

CLIENT_ID = environ.get("CLIENT_ID")
CLIENT_SECRET = environ.get("CLIENT_SECRET")
REDIRECT_URI = environ.get("REDIRECT_URI")

sp = Spotify()
db = DB()

app = Flask(__name__)
app.debug = FLASK_DEBUG

app.secret_key = environ.get("FLASK_SECRET_KEY", "secret_alternative")
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
app.config['SESSION_COOKIE_SECURE'] = False

CORS(app, supports_credentials=True, origins=["http://localhost:3000"])

oauth = OAuth(app)
oauth.register(
    name='spotify',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    access_token_url='https://accounts.spotify.com/api/token',
    access_token_params=None,
    authorize_url='https://accounts.spotify.com/authorize',
    authorize_params=None,
    api_base_url='https://api.spotify.com/v1/',
    client_kwargs={'scope': 'user-read-email playlist-modify-private playlist-modify-public playlist-read-private user-top-read user-read-currently-playing'}
)

@app.route("/")
def index() -> tuple[Response, int]:
    return jsonify({"status":"success"}), 200


@app.route("/auth/spotify-login")
def spotify_login() -> tuple[Response, int]:
    return oauth.spotify.authorize_redirect(REDIRECT_URI), 302


@app.route("/auth/callback")
def spotify_authorized() -> tuple[Response, int]:
    token = oauth.spotify.authorize_access_token()
    if not token:
        return f"Access denied: reason={request.args['error']} error={request.args['error_description']}", 401
    
    session["oauth_token"] = token["access_token"]
    resp = oauth.spotify.get("me")
    user_account = resp.json()
    session["user_id"] = user_account["id"]  # Save user_id for later use
    
    print(f"oauth_token: {session['oauth_token']}, user_id: {session['user_id']}")

    #redirect to the song tracking page
    return redirect(f"{FRONTEND_URL}/song-tracking"), 302


@app.route("/api/me")
def me() -> tuple[Response, int]:
    oauth_token = session.get("oauth_token")
    if not oauth_token:
        return jsonify({"user": None}), 401

    resp = oauth.spotify.get("me", token={"access_token": oauth_token, "token_type": "Bearer"})
    user_account = resp.json()
    # Always use the first image in the images array if available
    profile_image = None
    if user_account.get("images") and isinstance(user_account["images"], list) and len(user_account["images"]) > 0:
        profile_image = user_account["images"][0]["url"]
    return jsonify({
        "status": "success",
        "user": {
            "id": user_account["id"],
            "display_name": user_account.get("display_name"),
            "email": user_account.get("email"),
            "external_urls": user_account.get("external_urls", {}),
            "profile_image": profile_image,
        }
    }), 200


@app.route("/api/get-song-tracking/<string:date_range>", methods=["GET"])
def get_song_tracking_table(date_range) -> tuple[Response, int]:
    oauth_token = session.get("oauth_token")

    if not oauth_token:
        return jsonify({"status": "error", "error": f"User not authorised, missing oauth_token"}), 401
    
    if date_range not in ["short_term", "medium_term", "long_term"]:
        return jsonify({"status":"error", "error":"Invalid date range"}), 400

    tracks = sp.get_user_top_songs(oauth_token, date_range, 50)
    tracking_table = sp.get_song_tracking_table(tracks)

    return jsonify({"status":"success", "tracking_table":tracking_table}), 200


#receives ajax call from client to update the user's artist tracking data to be displayed to the user
@app.route("/api/update-artist-table", methods=["POST"])
def update_artist_tracking_table() -> tuple[Response, int]:
    oauth_token = session.get("oauth_token")

    if not oauth_token:
        return jsonify({"status": "error", "error": "User not authorised, missing oauth_token"}), 401

    date_range = request.json["date_range"]

    artists = sp.get_user_top_artists(oauth_token, date_range, 50)
    tracking_table = sp.format_artist_tracking_table(oauth_token, artists)

    return jsonify({"status":"success", "tracking_table":tracking_table}), 200


#receives ajax call from client to update the user's genre tracking data to be displayed to the user
@app.route("/api/update-genre-table", methods=["POST"])
def update_genre_tracking_table() -> tuple[Response, int]:
    oauth_token = session.get("oauth_token")

    if not oauth_token:
        return jsonify({"status": "error", "error": "User not authorised, missing oauth_token"}), 401

    date_range = request.json["date_range"] #fetches the date range for genres from the AJAX call from webclient

    genres = sp.get_user_top_genres(oauth_token, date_range, 50)

    return jsonify({"status":"success", "genres":genres}), 200



@app.route("/api/get-all-tags", methods=["POST"])
def get_all_tags() -> tuple[Response, int]:
    oauth_token = session.get("oauth_token")

    if not oauth_token:
        return jsonify({"status": "error", "error": "User not authorised, missing oauth_token"}), 401


    user_id = sp.get_user_account(oauth_token)["id"]

    tags = db.get_all_tags(user_id)

    return jsonify({"status":"success", "tags":tags}), 200


@app.route("/api/currently-playing", methods=["POST"])
def currently_playing() -> tuple[Response, int]:
    """
    Returns the currently playing song to the webclient request
    """
    oauth_token = session.get("oauth_token")

    if not oauth_token:
        return jsonify({"status": "error", "error": "User not authorised, missing oauth_token"}), 401


    current = sp.get_currently_playing(oauth_token)

    return jsonify({"current":current}), 200


@app.route("/api/tracking-graph", methods=["POST", "GET"])
def tracking_graph() -> tuple[Response, int]:
    """
    Returns the currently playing song to the webclient request
    """
    oauth_token = session.get("oauth_token")
    if not oauth_token:
        return jsonify({"status": "error", "error": "User not authorised, missing oauth_token"}), 401


    element_id = request.json["id"] #fetches data from webclient request
    element_type = request.json["type"]
    term = request.json["term"]

    database_response = db.get_tracking_graph(element_id, element_type, term)

    if database_response is not None:
        graph_date = date_quick_sort(database_response) #sorts into date order

        ranks = []
        dates = []

        for item in graph_date:
            ranks.append(item[0])
            dates.append(item[1])

        graph = {"ranks":ranks, "dates":dates}
    else:
        graph = {"error":"An Error Has Occured!"}

    return jsonify({"status":"success", "graph":graph}), 200


@app.route("/api/create-tag", methods=["POST", "GET"])
def create_tag() -> tuple[Response, int]:
    oauth_token = session.get("oauth_token")
    if not oauth_token:
        return jsonify({"status": "error", "error": "User not authorised, missing oauth_token"}), 401

    user_account = sp.get_user_account(oauth_token)
    if "error" in user_account: #checks if the user's authorised session has ended
        session.pop("oauth_token")
        return redirect("/sign-out")
    
    user_id = user_account["id"]
    name = request.json["tag_name"] #fetches data from webclient request
    description = request.json["tag_description"]
    colour = request.json["tag_colour"]

    name = sanitise(name)
    if name["invalid"] != "":
        return jsonify({"status":"error", "error":f"Invalid character used in Tag Name. {name['invalid']}"}), 400
    else:
        name = name["text"]

    description = sanitise(description)
    if description["invalid"] != "":
        return jsonify({"status":"error", "error":f"Invalid character used in Tag Description. {description['invalid']}"}), 400
    else:
        description = description["text"]

    colour = sanitise(colour)
    if colour["invalid"] != "":
        return jsonify({"status":"error", "error":f"Invalid character used in Colour. {colour['invalid']}"}), 400
    else:
        colour = colour["text"]


    if len(name) < 1:
        return jsonify({"status":"error", "error":"Tag Name has not been inputted."}), 400
    
    elif len(name) > 64:
        return jsonify({"status":"error", "error":"Tag Name length is too long, please use up to 64 characters."}), 400

    if len(description) > 64:
        return jsonify({"status":"error", "error":"Tag Description length is too long, use upto 64 characters."}), 400


    if len(colour) != 7: #if the hex code doesn't have the correct format #RRGGBB
        return jsonify({"status":"error", "error":"Colour not in Hex Code form."}), 400

    db.create_tag(user_id, name, description, colour)

    return jsonify({"status":"success"}), 200


@app.route("/api/delete-tag", methods=["POST", "GET"])
def delete_tag() -> tuple[Response, int]:
    oauth_token = session.get("oauth_token")
    if not oauth_token:
        return jsonify({"status": "error", "error": "User not authorised, missing oauth_token"}), 401

    user_account = sp.get_user_account(oauth_token)
    if "error" in user_account: #checks if the user's authorised session has ended
        session.pop("oauth_token")
        return redirect("/sign-out")
    
    user_id = user_account["id"]

    name = request.json["tag_name"] 
    description = request.json["tag_description"]
    colour = request.json["tag_colour"]

    db.delete_tag(user_id, name, description, colour)

    tags = db.get_all_tags(user_id)

    return jsonify({"status":"success", "tags":tags}), 200


@app.route("/api/sign-out")
def sign_out() -> tuple[Response, int]:
    """
    Removes all of the data from the user's current session and will be forced to login again
    """
    session.clear()
    return jsonify({"status":"success"}), 200

                                        
if __name__ == '__main__':
    app.run(debug=FLASK_DEBUG, host=FLASK_HOST, port=FLASK_PORT)