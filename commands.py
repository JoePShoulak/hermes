import re
import subprocess

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
        execute_command(f"ping -c 1 {target}", default=False)
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
    
# Exists
def get_exists(target):
    try:
        execute_command(f"ping -c 1 {target}.ilo", default=False)
        return True
    except:
        return False
