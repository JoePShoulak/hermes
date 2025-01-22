from enum import Enum

def color_text(text, color):
    match color:
        case "red":
            code = 31
        case "green":
            code = 32
        case "blue":
            code = 34
        case "white":
            code = 0
        case _:
            code = 0

    return f"\033[{code}m{text}\033[0m"

class State(Enum):
    ONLINE = 3
    BOOT = 2
    POWERED = 1
    UNPOWERED = 0

    def __str__(self):
        colors = {
            3: "green",
            2: "blue",
            1: "white",
            0: "red",
        }
        return color_text(self.name, colors[self.value])

class Docker(Enum):
    IN_USE = 2
    ONLINE = 1
    OFFLINE = 0

    def __str__(self):
        colors = {
            2: "blue",
            1: "green",
            0: "white",
        }
        return color_text(self.name, colors[self.value])