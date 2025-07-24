import functools
import random

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


def value_quick_sort(items:list) -> list:
    """
    Applies a quicksort to a list of indexs and items in descending order
    """
    length = len(items)
    if length <= 1: #break condition when only one item is remaining in the list
        return items
    
    pivot = length // 2
    left, right = [], []

    for index in range(length):
        if index == pivot:
            continue

        if items[index]["value"] > items[pivot]["value"]: # sorts into descending with left being greatest, and right being the lowest
            left.append(items[index])
        else:
            right.append(items[index])

    left = value_quick_sort(left) #recursively sorts the two smaller lists
    right = value_quick_sort(right)

    return [*left, items[pivot], *right] #formats two lists and string into a single list


def date_quick_sort(items:list) -> list:
    """
    Applies a quicksort to a list of single items
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


def binary_search(items:list, search:str):
    """
    Takes items as a list of dictionaries [{id:"id", value:"value"}, ...] and returns ID of search item
    """
    search = search.lower() #sets all characters to lowercase so searching isn't case sensitive
    lower = 0
    upper = len(items) - 1
    found = False #flag to stop searching
    
    while not found:
        mid = (upper + lower) // 2 #calculates the midpoint
        value = items[mid]["value"].lower()

        if value == search:
            found = True
            return items[mid]["id"]
        
        elif value < search:
            upper = mid -1

        elif value > search:
            lower = mid +1

        else:
            return None #returns none if the item couldnt be found in the list