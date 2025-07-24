# Tracking For Spotify
A React frontend built on a Python Flask backend allowing a user to track their favourite songs, artists, and genres over different periods of time.

## Installation
### Backend installation
- Create virtual environment: `python -m venv backend-venv`
- Enter vitrual environment PowerShell: `./backend-venv/Scripts/Activate.ps1`
- Upgrade pip version: `python -m pip install --upgrade pip`
- Install packages: `pip install -r requirements.txt`

### Frontend installation
- Enter frontend directory: `cd ./frontend`
- Install React packages: `npm install`

## Setup
### Environment variables
Create a new `.env` file in the directory `/backend` and add the following constants:
```.env
FLASK_HOST=127.0.0.1
FLASK_PORT=5000
FLASK_DEBUG=true
FLASK_SECRET_KEY=`your-amazing-super-secret-key`

CLIENT_ID=`Spotify-Client-ID`
CLIENT_SECRET=`Spotify-Client-Secret`
REDIRECT_URI=http://127.0.0.1:5000/auth/callback

FRONTEND_URL=http://localhost:3000
```

### Spotify API Integration
- Go to the offical Spotify API website: [https://developer.spotify.com/](https://developer.spotify.com/)
- Login using your Spotify account details.
- Go to your dashboard and press `'Create app'`
    - Add your custom app name: eg. `Tracking For Spotify`
    - Add your custom app description: eg. `Website to help users track their favourite artists!`
    - Add Redirect URI: `http://127.0.0.1:5000/auth/callback`
        > or change to a different URL/domain you wish to use instead but make sure it is the same as in your `.env` file.
- Copy your Spotify app's *CLIENT_ID* and *CLIENT_SECRET* and add to your `.env` file.

## Usage
Run the following in the Python virtual environment:
- Enter backend directory: `cd ./backend`
- Start Flask server: `python app.py`

In a seperate terminal:
- Enter frontend directory: `cd ./frontend`
- Run development server `npm start`
    > or run `npm build` for a production build.

#
<footer style="font-size: 0.9em; color: #666; text-align: center; padding: 1em;">
  <p>
    This app uses the Spotify Web API to display user-specific data such as favorite songs, artists, and genres.
    All Spotify content, including trademarks, logos, and music data, is the property of Spotify AB.
    This project is not affiliated with, endorsed by, or officially connected to Spotify in any way.
  </p>
</footer>