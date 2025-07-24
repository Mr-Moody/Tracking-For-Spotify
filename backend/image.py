import cv2
import numpy as np
from tools import error_catch
import requests
import threading
import os
import shutil
import colorsys
from os import listdir
from os.path import isfile, join

class Image():
    def __init__(self) -> None:
        pass

    @error_catch
    def dominant_colour(self, image_file:str) -> tuple:
        """
        Returns the dominant colour in the image
        """
        myimg = cv2.imread(image_file)
        counts = np.bincount(myimg)
        return np.argmax(counts)

    @error_catch
    def average_colour(self, image_file:str):
        """
        Calculates the average colour of the image
        """
        myimg = cv2.imread(image_file)
        avg_color_per_row = np.average(myimg, axis=0)
        avg_color = np.average(avg_color_per_row, axis=0)
        
        return avg_color
    
    
    @error_catch
    def download_parallel(self, cover_art_urls:list):
        """
        Opens a new thread for each album cover to be opened and downloaded
        """
        dir_path = os.path.dirname(os.path.realpath(__file__))
        downloaded_cover_art = os.listdir(dir_path + "/imgs")

        albums = os.listdir("/imgs")
        for cover_art in cover_art_urls:
            if cover_art[0] not in downloaded_cover_art:
                x = threading.Thread(target=self.download_single_cover_art, args=cover_art)
                x.start()

    @error_catch
    def download_single_cover_art(self, album_id, image_url):
        """
        Downloads the album cover art
        """
        img_data = requests.get(image_url).content
        with open(f"imgs/{album_id}.jpg", 'wb') as handler:
            handler.write(img_data)

    @error_catch
    def clear_imgs(self):
        """
        Used to remove all cover art from imgs folder, only for developmental testing
        """
        folder = ""
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print('Failed to delete %s. Reason: %s' % (file_path, e))

    @error_catch
    def rgb_to_hsv(rgb:list[tuple]) -> tuple:
        """
        Converts an RGB array to a HSV
        """
        return colorsys.rgb_to_hsv(*rgb)
    
