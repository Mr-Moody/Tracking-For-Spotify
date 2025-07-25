import functools
import random

def sanitise(text:str) -> dict:
    """
    Returns a dictionary{"text":sanitised text, "invalid":the invalid text located}
    """
    BLOCKED_CHARACTERS = ["'", '"', "\\", "/"]
    invalid = ""

    for index,character in enumerate(text):
        if character in BLOCKED_CHARACTERS:
            invalid = character
            text = text[:index] + text[index + 1:] #removes character from string

    return {"text":text, "invalid":invalid}


def error_catch(func):
    """
    Adds an error catching wrapper to the function to display the function and the error caught without causing the system to crash
    """
    @functools.wraps(func)
    def inner(*args):
        try: #attempts to run function with given arguments
            return func(*args) #returns the result of the passed

        except Exception as error: #catches any errors to stop the system from crashing
            print(f"ERROR CATCH - {func.__name__}{args}:\n{error}")
    return inner #returns the result of the wrapped function to where the function was orignally called from before being wrapped


def generate_guid(string_length:int=16) -> str:
    """
    Returns a Global Unique ID of any length, defaults to 16 characters
    """
    guid = "" #empty string to be concatenated to
    for i in range(string_length): #repeats for the length of guid to be
        integar = random.randint(0,61)
        if integar <= 9:
            guid += str(integar) #integer
        elif integar > 9 and integar <= 35:
            guid += str(chr(integar + 87)) #lowercase letters from ascii character set
        else:
            guid += str(chr(integar + 29)) #uppercase letters from ascii character set
    
    return guid


def date_quick_sort(items:list) -> list:
    """
    Applies a quicksort to a list of dates in descending order
    """
    length = len(items)
    if length <= 1:
        return items
    
    pivot = length // 2
    left, right = [], []

    for index in range(length):
        if index == pivot:
            continue

        if items[index][1] < items[pivot][1]:
            left.append(items[index])
        else:
            right.append(items[index])

    left = date_quick_sort(left)
    right = date_quick_sort(right)

    return [*left, items[pivot], *right]