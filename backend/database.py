import sqlite3

from util import generate_guid

class DB():
    def __init__(self):
        self.__database = "database.dbo"


    def connect(self):
        """
        Creates connection to database
        """

        connection = sqlite3.connect(self.__database)

        return connection
    

    def create_new_user(self, user_id:str, last_online:str) -> None:
        """
        Adds a new user to the database
        """
        try:
            connection = self.connect()
            cursor = connection.cursor()
            cursor.execute(f"INSERT INTO USERDETAILS(UserID, LastOnline) VALUES('{user_id}', '{last_online}');")
            connection.commit()
            connection.close()

        except (sqlite3.DatabaseError) as error:
            print("Error:\n{}".format(error))
    

    def get_user_last_online(self, user_id) -> str:
        """
        Returns the date of which the user last logged in
        """
        try:
            connection = self.connect()
            cursor = connection.cursor()
            cursor.execute(f"SELECT LastOnline FROM USERDETAILS WHERE UserID = '{user_id}';")
            last_online = cursor.fetchall()
            connection.close()
            return last_online[0][0] #returns the date string from the tuple

        except (sqlite3.DatabaseError) as error:
            print("Error:\n{}".format(error))
            return ""


    def check_user_exists(self, user_id:str) -> bool:
        """
        Returns True if the user is found in the database, or False if the user does not exist
        """ 
        try:
            connection = self.connect()
            cursor = connection.cursor()
            cursor.execute(f"SELECT * FROM USERDETAILS WHERE UserID = '{user_id}';")
            user_details = cursor.fetchall()
            connection.close()

            if user_details == []:
                return False #user does not exist
            else:
                return True #user exists

        except (sqlite3.DatabaseError) as error:
            print("Error:\n{}".format(error))
            return False


    def update_last_online(self, user_id:str, current_date:str):
        if not self.check_user_exists(user_id): #creates a new user if they havent previously used the system
            self.create_new_user(user_id, current_date)

        try:
            connection = self.connect()
            cursor = connection.cursor()
            cursor.execute(f"UPDATE USERDETAILS SET LastOnline='{current_date}' WHERE UserID = '{user_id}';")
            connection.commit()
            connection.close()
            
        except (sqlite3.DatabaseError) as error:
            print("Error:\n{}".format(error))


    def current_date(self) -> str:
        """
        Returns the current day in the format YYYY-MM-DD
        """
        from datetime import datetime
        date = datetime.today().strftime('%Y-%m-%d') #formats the date in YYYY-MM-DD
        return date


    def create_new_tracking_history(self, user_id:str, element_id:str, type:str, term:str, rank:int) -> None:
        """
        Creates a new tracking id for an element to be tracked when the user the song is being tracked for the first time
        """
        tracking_id = generate_guid(string_length=32) #Unique ID
        tracking_history_id = generate_guid(string_length=32) #Unique ID
        current_date = self.current_date() #returns the current date

        term = term.split("_")[0] #gathers the "short" from "short_term"

        try:
            connection = self.connect() #Creates connection to the database using the configuration setup in the init
            cursor = connection.cursor()
            cursor.execute(f"INSERT INTO TRACKING(TrackingID, UserID, ElementID, ElementType, Term) VALUES('{tracking_id}', '{user_id}', '{element_id}', '{type}', '{term}');")
            cursor.execute(f"INSERT INTO TRACKINGHISTORY(TrackingHistoryID, TrackingID, DateAdded, Rank) VALUES('{tracking_history_id}', '{tracking_id}', '{current_date}', '{rank}');")
            connection.commit() #saves the changes made to the database file
            connection.close()

        except (sqlite3.DatabaseError) as error:
            print("Error:\n{}".format(error))


    def store_tracking_history(self, tracking_id:str, rank:int) -> None:
        """
        Creates a new tracking id for an element to be tracked
        """
        date = self.current_date()

        tracking_history_id = generate_guid(string_length=32) #randomly generated string for unique identifier

        try:
            connection = self.connect()
            cursor = connection.cursor()
            cursor.execute(f"INSERT INTO TRACKINGHISTORY(TrackingHistoryID, TrackingID, DateAdded, Rank) VALUES('{tracking_history_id}', '{tracking_id}', '{date}', '{rank}');")
            connection.commit()
            connection.close()

        except (sqlite3.DatabaseError) as error:
            print("Error:\n{}".format(error))


    def get_tracking_id(self, user_id:str, element_id:str, element_type:str, term:str) -> str:
        """
        Searches for the id to indentify the song/artist/genre that is being tracked by the specific user 
        """
        term = term.split("_")[0] #gathers the "short" from "short_term"

        try:
            connection = self.connect()
            cursor = connection.cursor()
            cursor.execute(f"SELECT TrackingID FROM TRACKING WHERE UserID = '{user_id}' and ElementID = '{element_id}' and ElementType = '{element_type}' and Term = '{term}';")
            tracking_id = cursor.fetchall()
            connection.close()

            if tracking_id == []:
                return ""
            else:
                return tracking_id[0][0] #returns the string id from the tuple

        except (sqlite3.DatabaseError) as error:
            print("Error:\n{}".format(error))


    def get_tracking_graph(self, element_id:str, element_type:str, term:str) -> list|None:
        """
        Returns the Rank, DateAdded for each element searched for in Tracking History
        """
        term = term.split("_")[0] #gathers the "short" from "short_term"

        try:
            connection = self.connect()
            cursor = connection.cursor()
            cursor.execute(f"SELECT Rank,DateAdded FROM TRACKINGHISTORY WHERE TrackingID = (SELECT TrackingID FROM TRACKING WHERE ElementID = '{element_id}' and ElementType = '{element_type}' and Term = '{term}');")
            database_response = cursor.fetchall()
            connection.close()

            return database_response

        except (sqlite3.DatabaseError) as error:
            print("Error:\n{}".format(error))
            
        return None

    def create_tag(self, user_id:str, tag_name:str, tag_description:str, tag_colour:str) -> None:
        try:
            tag_id = generate_guid(32)

            connection = self.connect()
            cursor = connection.cursor()
            cursor.execute(f"INSERT INTO TAG VALUES('{tag_id}','{user_id}','{tag_name}','{tag_description}','{tag_colour}')")
            connection.commit()
            connection.close()

        except (sqlite3.DatabaseError) as error:
            print("Error:\n{}".format(error))
        
    
    def get_all_tags(self, user_id:str) -> list:
        try:
            connection = self.connect()
            cursor = connection.cursor()
            cursor.execute(f"SELECT TagName,TagDescription,HexColour FROM TAG WHERE UserID = '{user_id}'")
            response = cursor.fetchall()
            connection.close()

            tags = []

            for tag in response:
                tags.append({"name":tag[0], "description":tag[1], "colour":tag[2]}) #formats database response into a list of dicts which can be translated to JSONs when sending to the webclient

            return tags

        except (sqlite3.DatabaseError) as error:
            print("Error:\n{}".format(error))
            return []
        

    def delete_tag(self, user_id:str, tag_name:str, tag_description:str, tag_colour:str) -> None:
        try:
            connection = self.connect()
            cursor = connection.cursor()
            cursor.execute(f"DELETE FROM TAG WHERE UserID = '{user_id}' and TagName = '{tag_name}' and TagDescription = '{tag_description}' and HexColour = '{tag_colour}'")
            connection.commit()
            connection.close()

        except (sqlite3.DatabaseError) as error:
            print("Error:\n{}".format(error))


    def update_database_tracking_history(self, user_id:str, oauth_token:str) -> None:
        """
        updates the user's song, artist, and genre tracking
        """

        last_online = self.get_user_last_online(user_id)
        current_date = self.current_date()

        if last_online == current_date:
            return None #means that the values wont be updated every time the page is refreshed, and is only changed once per day when the user logs in
        else:
            print("updating database tracking")

            for term in ["short_term", "medium_term", "long_term"]: #updates the tracking for short, medium, and long time ranges (last 4 weeks, last 6 months, all time)
                songs = self.get_user_top_songs(oauth_token, term, 50)
                artists = self.get_user_top_artists(oauth_token, term, 50)
                genres = self.get_user_top_genres(oauth_token, term, 50)

                #updates the rankings for all of the songs
                for rank in range(len(songs["items"])):
                    song_id = songs["items"][rank]["id"]
                    rank += 1 #rank originally 0 indexed, but now indexing from 1 to represent 1st, 2nd, etc

                    tracking_id = self.get_tracking_id(user_id, song_id, "song", term)
                    
                    if tracking_id != "": #checks if the song has been previously tracked for the user
                        self.store_tracking_history(tracking_id, rank) #only stores the additional rank and date
                    else:
                        self.create_new_tracking_history(user_id, song_id, "song", term, rank) #creates a new tracking for a song which a user has never listened to before

                #updates the rankings for all of the artists
                for rank in range(len(artists["items"])):
                    artist_id = artists["items"][rank]["id"]
                    rank += 1 #rank originally 0 indexed, but now indexing from 1 to represent 1st, 2nd, etc

                    tracking_id = self.get_tracking_id(user_id, artist_id, "artist", term)
                    if tracking_id != "":
                        self.store_tracking_history(tracking_id, rank)
                    else:
                        self.create_new_tracking_history(user_id, artist_id, "artist", term, rank) #creates a new tracking for an artist which a user has never listened to before

                #updates the rankings for all of the genres
                for rank in range(len(genres)):
                    genre_id = genres[rank]["name"]
                    rank += 1 #rank originally 0 indexed, but now indexing from 1 to represent 1st, 2nd, etc

                    tracking_id = self.get_tracking_id(user_id, genre_id, "genre", term)
                    if tracking_id != "":
                        self.store_tracking_history(tracking_id, rank)
                    else:
                        self.create_new_tracking_history(user_id, genre_id, "genre", term, rank) #creates a new tracking for a genre which a user has never listened to before

            self.update_last_online(user_id, current_date) #after the new tracking has been updated, the user's last online date is updated



if __name__ == "__main__":
    pass