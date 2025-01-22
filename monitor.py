from commands import *
from enum import Enum

# Main logic for status
HPs = ["hp1", "hp2", "hp3", "hp4"]

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


def get_status(target):
    status = {
        "uptime": None,
        "uid": None,
        "state": None,
        "docker": None,
    }

    if get_online(target):
        status["state"] = State.ONLINE
    elif get_power(target):
        status["state"] = State.BOOT
    elif get_exists(target):
        status["state"] = State.POWERED
    else:
        status["state"] = State.UNPOWERED

    if status["state"] == State.ONLINE and get_docker(target):
        if get_minecraft_users(target):
            status["docker"] = Docker.IN_USE
        else:
            status["docker"] = Docker.ONLINE
    else:
        status["docker"] = Docker.OFFLINE

    status["uid"] = False if status["state"]==State.UNPOWERED else f"{get_UID(target)}".replace("UNKNOWN", "-")
    status["uptime"] = "-" if status["state"]!=State.ONLINE else get_uptime(target)
    
    return status

def prettify_status(data):
    result = []
    for host, status in data.items():
        result.append(f'\nHost: {host.upper()}')
        result.append(f'  - State: {status["state"]}')
        result.append(f'  - Docker: {status["docker"]}')
        result.append(f'  - UID Light: {status["uid"]}')
        result.append(f'  - Uptime: {status["uptime"]}')
    return "\n".join(result)

