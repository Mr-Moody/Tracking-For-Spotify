import requests

from tools import error_catch, value_quick_sort

URL = "https://api.spotify.com/v1/" #base API HTTP address

class Spotify():
    def __init__(self) -> None:
        pass

    def headers(self, auth_token:str) -> dict:
        return {
            'Authorization': f'Bearer {auth_token}',
            'Content-Type': 'application/json',
        }


    @error_catch
    def get_user_account(self, auth_token:str) -> dict:
        """
        gets the user's account details including name, display name, profile picture, and email
        """
        user = requests.get(URL + "me", headers=self.headers(auth_token)).json() #requests user details from API and formats it in a JSON file
        
        if user["images"] == []:
            empty_images = [{"url":"None"},{"url":"None"}] #creates null placeholder so that no errors are caused when trying to index an empty list
            user["images"] = empty_images

        return user
    
    
    @error_catch
    def get_track_ids(self, items:list) -> list:
        """
        Used to extract the track ids from a JSON file received by Spotify API into a single list
        """
        for index in range(len(items)):
            items[index] = items[index]["id"]

        return items


    @error_catch
    def get_track_details(self, auth_token:str, track_id:str) -> dict:
        """
        Returns a JSON of all the details of the track
        """
        track_details = requests.get(URL + "tracks/" + track_id, headers=self.headers(auth_token)).json() #requests all of the details for a single track into JSON file
        return track_details
    
    
    @error_catch
    def get_multiple_tracks(self, auth_token:str, track_ids:list) -> dict:
        """
        Returns a JSON of all the details of the tracks
        """
        tracks = ",".join(track_ids)
        track_details = requests.get(URL + "tracks?ids=" + tracks, headers=self.headers(auth_token)).json() #requests details for multiple tracks at once
        return track_details

            
    @error_catch
    def get_album_id(self, auth_token:str, track_id:str):
        """
        Returns the album id for any given track id
        """
        track = self.get_track_details(auth_token, track_id)
        album_id = track["album"]["id"]
        return album_id
           
            
    @error_catch
    def get_album_details(self, auth_token:str, album_id:str):
        """
        Returns all the data for the album from the album id
        """
        album = requests.get(URL + f"albums/{album_id}", headers=self.headers(auth_token)).json() #requests all the details for an artist's album
        return album
    
    
    @error_catch
    def get_album_cover_art(self, auth_token:str, album_id:str):
        """
        Returns the url for the cover art image of each album
        """
        album_details = self.get_album_details(auth_token, album_id)
        cover_art = album_details["images"][0]["url"]
        return cover_art
            
            
    @error_catch
    def playlist_tracks(self, auth_token:str, playlist_id:str) -> list:
        """
        Returns all of the track details from the given playlist id in order
        """
        tracks = requests.get(URL + f"playlist/{playlist_id}/tracks", headers=self.headers(auth_token)).json()
        return tracks


    @error_catch
    def next(self, auth_token:str, next) -> dict:
        """
        Returns the next elements from a request
        """
        tracks = requests.get(next, headers=self.headers(auth_token)).json()
        return tracks
        

    @error_catch
    def get_user_top_songs(self, auth_token:str, time_range:str, quantity:int):
        """
        Returns the users top listened to songs, defaults to top 50
        """

        if time_range not in ["short_term", "medium_term", "long_term"]:
            print("*** get_user_top_songs Error - time_range only accepts short_term, medium_term, long_term. Defaulting to short_term ***")
            time_range = "short_term"

        response = requests.get(URL + f"me/top/tracks?time_range={time_range}&limit={quantity}", headers=self.headers(auth_token)).json()


        return response


    @error_catch
    def get_song_tracking_table(self, tracks:dict) -> list:
        """
        Returns the users top songs as a list of JSONs {cover_art, track_name, track_album, track_artists} for sending to the webclient
        """
        table = []

        for index,track in enumerate(tracks["items"]): #enumerate returns [(index, data_item), (index, data_item), ...]
            cover_art =  track["album"]["images"][-1]["url"]
            track_name = track["name"]
            track_album = track["album"]["name"]
            track_artists = track["artists"][0]["name"]
            element_id = track["id"]

            track_artists = ', '.join(artist["name"] for artist in track["artists"]) #list comprehension will append all the artists into a single string
                
            table.append({"index":index+1, 
                        "cover_art":cover_art,
                        "track_name":track_name,
                        "track_album":track_album,
                        "track_artists":track_artists,
                        "id":element_id})

        return table
    
    
    @error_catch
    def format_artist_tracking_table(self, artists:dict):
        table = []

        for index,artist in enumerate(artists["items"]):
            index += 1
            artist_name = artist["name"]
            artist_profile = artist["images"][1]["url"]
            artist_id = artist["id"]

            table.append({"index":index,
                          "artist_name":artist_name,
                          "artist_profile":artist_profile, 
                          "id":artist_id})

        return table
    
    
    @error_catch
    def format_genre_tracking_table(self, genres:dict):
        table = []

        for index,genre in enumerate(genres["items"]):
            index += 1
            genre_name = genre["name"]

            table.append({"index":index,
                          "genre_name":genre_name})

        return table
    
    
    @error_catch
    def get_user_top_artists(self, auth_token:str, time_range:str, quantity:int):
        """
        Returns the users top listened to songs, defaults to top 50
        """

        if time_range not in ["short_term", "medium_term", "long_term"]:
            print("*** get_user_top_songs Error - time_range only accepts short_term, medium_term, long_term. Defaulting to short_term ***")
            time_range = "short_term"

        response = requests.get(URL + f"me/top/artists?time_range={time_range}&limit={quantity}", headers=self.headers(auth_token)).json()

        return response
    
    
    @error_catch
    def get_user_top_genres(self, auth_token:str, time_range:str, quantity:int):
        """
        Returns the users top listened to songs, defaults to top 50
        """

        if time_range not in ["short_term", "medium_term", "long_term"]:
            print("*** get_user_top_songs Error - time_range only accepts short_term, medium_term, long_term. Defaulting to medium_term ***")
            time_range = "medium_term"

        response = requests.get(URL + f"me/top/artists?time_range={time_range}&limit={quantity}", headers=self.headers(auth_token)).json()
        
        all_genres = []
        
        for artist in response["items"]:
            for genre in artist["genres"]:

                found = False
                
                for i in range(len(all_genres)):
                    if all_genres[i]["name"] == genre:
                        all_genres[i]["value"] = all_genres[i]["value"] + 1
                        found = True
                        break
                    
                if not found:
                    all_genres.append({"name":genre, "value":1})
                    
        all_genres = value_quick_sort(all_genres)

        return all_genres
    
    
    def get_currently_playing(self, auth_token:str) -> dict:
        response = requests.get(URL + f"me/player/currently-playing", headers=self.headers(auth_token))
        response.raise_for_status()

        if response.status_code == 204:
            return {"error":"User not currently listening to any song."}
        else:
            return response.json()



if __name__ == "__main__":
    pass