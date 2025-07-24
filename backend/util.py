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