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
    
def get_dominant_colour(image_file:str) -> tuple:
    """
    Returns the dominant colour in the image
    """
    myimg = cv2.imread(image_file)
    counts = np.bincount(myimg)
    return np.argmax(counts)


def get_average_colour(image_url: str):
    """
    Calculates the average colour of the image from a URL and returns it as a hex code string.
    """
    try:
        response = requests.get(image_url)
        image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
        img = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        #if error then default to spotify green
        if img is None:
            return "#1db954"

        avg_color_per_row = np.average(img, axis=0)
        avg_color = np.average(avg_color_per_row, axis=0)
        avg_color = avg_color.astype(int)

        rgb = [int(avg_color[2]), int(avg_color[1]), int(avg_color[0])]
        hex_color = '#{:02x}{:02x}{:02x}'.format(*rgb)

        return hex_color

    except Exception:
        return "#1db954"


def download_parallel(cover_art_urls:list):
    """
    Opens a new thread for each album cover to be opened and downloaded
    """
    dir_path = os.path.dirname(os.path.realpath(__file__))
    downloaded_cover_art = os.listdir(dir_path + "/imgs")

    albums = os.listdir("/imgs")
    for cover_art in cover_art_urls:
        if cover_art[0] not in downloaded_cover_art:
            x = threading.Thread(target=download_single_cover_art, args=cover_art)
            x.start()


def download_single_cover_art(album_id:str, image_url:str):
    """
    Downloads the album cover art
    """
    img_data = requests.get(image_url).content
    with open(f"imgs/{album_id}.jpg", 'wb') as handler:
        handler.write(img_data)


def clear_imgs():
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


def rgb_to_hsv(rgb:list[tuple]) -> tuple:
    """
    Converts an RGB array to a HSV
    """
    return colorsys.rgb_to_hsv(*rgb)