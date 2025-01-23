import re
import subprocess
from objects import *

class CommandExecutionError(Exception):
    def __init__(self, message, return_code):
        super().__init__(message)
        self.return_code = return_code

def execute_command(command, parser=lambda output: output, default="UNKNOWN"):
    try:
        result = subprocess.run(command, shell=True, text=True, capture_output=True, check=True)
        return parser(result.stdout.strip())  # Clean up the command's output
    except subprocess.CalledProcessError as e:
        if not default:
            raise CommandExecutionError(e, 0)

        return default
    

# GETTERS / SETTERS / PARSERS
# # GENERAL
def re_parse(output, query):
    match = re.search(query, output, re.IGNORECASE)
    return match.group(1).capitalize() if match else "UNK"

# # UPS
def get_ups():
    return execute_command("upsc myups@localhost", lambda s: re_parse(s, r"ups.status: (.*)"))

# # POWER
def get_power(target):
        return execute_command(f"ilo {target} POWER", lambda s: re_parse(s, r"\bcurrently: (On|Off)\b") == "On")
    
def set_power(target, value):
        return execute_command(f"ilo {target} POWER {value}", lambda s: re_parse(s, r"\b(On|Off|Reset)\b"))
    
# # Online
def get_online(target):
    try:
        ips = {
            'hp1': '10.0.20.11',
            'hp2': '10.0.20.12',
            'hp3': '10.0.20.13',
            'hp4': '10.0.20.14',
        }
        execute_command(f"ping -c 1 {ips.get(target)}", default=False)
        return True
    except:
        return False
	
# # Docker
def get_docker(target):
        return execute_command(f"ssh {target} sudo docker ps | grep Up | wc -l", lambda s: int(s) > 0)
	
# # Minecraft
def get_minecraft_users(target):
        return execute_command(f"ssh {target} sudo ~/bin/rcon_all list", lambda s: int(re_parse(s, r"\b(\d) of a max")) > 0)
    
# # Uptime
def get_uptime(target):
        return execute_command(f"ssh {target} uptime -p").split("up ")[-1]
    
# # UID
def get_UID(target):
        return execute_command(f"ilo {target} UID", lambda s: re_parse(s, r"\bcurrently: (On|Off)\b"))=="On"

def set_UID(target, value):
        return execute_command(f"ilo {target} UID {value}", lambda s: re_parse(s, r"\bcurrently (On|Off)\b")=="On")
    
# # Exists
def get_exists(target):
    try:
        execute_command(f"ping -c 1 {target}.ilo", default=False)
        return True
    except:
        return False
    
# # Status
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
    status['state'] = status['state'].name
    status['docker'] = status['docker'].name

    return status
