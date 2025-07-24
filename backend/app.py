from flask import Flask, jsonify, redirect, render_template, request, session
from flask_cors import CORS
from os import environ
from dotenv import load_dotenv
from authlib.integrations.flask_client import OAuth
from spotify import Spotify
from database import DB
from tools import date_quick_sort
from util import sanitise

load_dotenv()

FLASK_HOST = environ.get("FLASK_HOST", "127.0.0.1")
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

CORS(app, supports_credentials=True)

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
def index():
    return jsonify({"status":"success"})


@app.route("/auth/spotify-login")
def spotify_login():
    return oauth.spotify.authorize_redirect(REDIRECT_URI)


@app.route("/auth/callback")
def spotify_authorized():
    token = oauth.spotify.authorize_access_token()
    if not token:
        return "Access denied: reason={} error={}".format(
            request.args['error'], request.args['error_description']
        )
    session['oauth_token'] = token['access_token']
    resp = oauth.spotify.get('me')
    user_account = resp.json()
    session['user_id'] = user_account['id']  # Save user_id for later use

    # Redirect to the song tracking page (frontend route)
    return redirect("http://127.0.0.1:3000/song-tracking")


@app.route("/api/song-tracking")
def song_tracking():
    if not "oauth_token" in session or not "user_id" in session: #if the user is not authorised through the Spotify API, they are directed to the login page
        return jsonify({"status":"error", "error":"User not authorised"})

    db.update_database_tracking_history(session["user_id"], session["oauth_token"])

    user_account = sp.get_user_account(session["oauth_token"])
    if "error" in user_account: #checks if the user's authorised session has ended
        session.pop("oauth_token")
        return redirect("/sign-out")
    
    tracks = sp.get_user_top_songs(session["oauth_token"], "short_term", 50) #requests the user's top 50 songs
    tracking_table = sp.get_song_tracking_table(tracks) #formats all the tracks into a smaller table to send
    

    return jsonify({"status":"success", "tracking_table":tracking_table})


@app.route("/api/update-song-table", methods=["POST"])
def update_song_tracking_table():
    if not "oauth_token" in session or not "user_id" in session:
        return jsonify({"status":"error", "error":"User not authorised"})

    date_range = request.json["date_range"]

    tracks = sp.get_user_top_songs(session["oauth_token"], date_range, 50)
    tracking_table = sp.get_song_tracking_table(tracks)

    return jsonify({"status":"success", "tracking_table":tracking_table})


#receives ajax call from client to update the user's artist tracking data to be displayed to the user
@app.route("/api/update-artist-table", methods=["POST"])
def update_artist_tracking_table():
    if not "oauth_token" in session or not "user_id" in session:
        return jsonify({"status":"error", "error":"User not authorised"})

    date_range = request.json["date_range"]

    artists = sp.get_user_top_artists(session["oauth_token"], date_range, 50)
    tracking_table = sp.format_artist_tracking_table(session["oauth_token"], artists)

    return jsonify({"status":"success", "tracking_table":tracking_table})


#receives ajax call from client to update the user's genre tracking data to be displayed to the user
@app.route("/api/update-genre-table", methods=["POST"])
def update_genre_tracking_table():
    if not "oauth_token" in session or not "user_id" in session:
        return jsonify({"status":"error", "error":"User not authorised"})

    date_range = request.json["date_range"] #fetches the date range for genres from the AJAX call from webclient

    genres = sp.get_user_top_genres(session["oauth_token"], date_range, 50)

    return jsonify({"status":"success", "genres":genres})



@app.route("/api/get-all-tags", methods=["POST"])
def get_all_tags():
    if not "oauth_token" in session or not "user_id" in session:
        return jsonify({"status":"error", "error":"User not authorised"})


    user_id = sp.get_user_account(session["oauth_token"])["id"]

    tags = db.get_all_tags(user_id)

    return jsonify({"status":"success", "tags":tags})


@app.route("/api/currently-playing", methods=["POST"])
def currently_playing():
    """
    Returns the currently playing song to the webclient request
    """
    if not "oauth_token" in session or not "user_id" in session:
        return jsonify({"status":"error", "error":"User not authorised"})


    current = sp.get_currently_playing(session["oauth_token"])

    return jsonify({"current":current})


@app.route("/api/tracking-graph", methods=["POST", "GET"])
def tracking_graph():
    """
    Returns the currently playing song to the webclient request
    """
    if not "oauth_token" in session or not "user_id" in session:
        return jsonify({"status":"error", "error":"User not authorised"})


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

    return jsonify({"status":"success", "graph":graph})


@app.route("/api/create-tag", methods=["POST", "GET"])
def create_tag():
    if not "oauth_token" in session or not "user_id" in session:
        return jsonify({"status":"error", "error":"User not authorised"})

    user_account = sp.get_user_account(session["oauth_token"])
    if "error" in user_account: #checks if the user's authorised session has ended
        session.pop("oauth_token")
        return redirect("/sign-out")
    
    user_id = user_account["id"]
    name = request.json["tag_name"] #fetches data from webclient request
    description = request.json["tag_description"]
    colour = request.json["tag_colour"]

    name = sanitise(name)
    if name["invalid"] != "":
        return jsonify({"status":"error", "error":f"Invalid character used in Tag Name. {name['invalid']}"})
    else:
        name = name["text"]

    description = sanitise(description)
    if description["invalid"] != "":
        return jsonify({"status":"error", "error":f"Invalid character used in Tag Description. {description['invalid']}"})
    else:
        description = description["text"]

    colour = sanitise(colour)
    if colour["invalid"] != "":
        return jsonify({"status":"error", "error":f"Invalid character used in Colour. {colour['invalid']}"})
    else:
        colour = colour["text"]


    if len(name) < 1:
        return jsonify({"status":"error", "error":"Tag Name has not been inputted."})
    
    elif len(name) > 64:
        return jsonify({"status":"error", "error":"Tag Name length is too long, please use up to 64 characters."})

    if len(description) > 64:
        return jsonify({"status":"error", "error":"Tag Description length is too long, use upto 64 characters."})


    if len(colour) != 7: #if the hex code doesn't have the correct format #RRGGBB
        return jsonify({"status":"error", "error":"Colour not in Hex Code form."})

    db.create_tag(user_id, name, description, colour)

    return jsonify({"status":"success"})


@app.route("/api/delete-tag", methods=["POST", "GET"])
def delete_tag():
    if not "oauth_token" in session or not "user_id" in session:
        return jsonify({"status":"error", "error":"User not authorised"})

    user_account = sp.get_user_account(session["oauth_token"])
    if "error" in user_account: #checks if the user's authorised session has ended
        session.pop("oauth_token")
        return redirect("/sign-out")
    
    user_id = user_account["id"]

    name = request.json["tag_name"] 
    description = request.json["tag_description"]
    colour = request.json["tag_colour"]

    db.delete_tag(user_id, name, description, colour)

    tags = db.get_all_tags(user_id)

    return jsonify({"status":"success", "tags":tags})


@app.route("/api/sign-out")
def sign_out():
    """
    Removes all of the data from the user's current session and will be forced to login again
    """
    session.clear()
    return jsonify({"status":"success"})

                                        
if __name__ == '__main__':
    app.run(debug=FLASK_DEBUG, host=FLASK_HOST, port=FLASK_PORT)