import re
import subprocess

class CommandExecutionError(Exception):
    def __init__(self, message, return_code):
        super().__init__(message)
        self.return_code = return_code

def execute_command(command, parser=lambda output: output):
    try:
        result = subprocess.run(command, shell=True, text=True, capture_output=True, check=True)
        return parser(result.stdout.strip())  # Clean up the command's output
    except subprocess.CalledProcessError as e:
        error_message = e.stderr.strip() if e.stderr else "Unknown error"
        raise CommandExecutionError(error_message, e.returncode)
    
def nothrow_execute_command(command, parser=lambda output: output, default="UNKNOWN"):
    try:
        return execute_command(command, parser)
    except CommandExecutionError:
        return default

# GETTERS / SETTERS / PARSERS
# # GENERAL
def re_parse(output, query):
    match = re.search(query, output, re.IGNORECASE)
    return match.group(1).capitalize() if match else "UNKNOWN"
# # UPS
def get_ups():
    return nothrow_execute_command("upspc myups@localhost", lambda s: re_parse(s, r"ups.status: (*)"))
    # ups.status: (OL LB ETC OMFG FOO BAR)
    
    # try:
    #     return execute_command("upsc myups@localhost | grep ups.status").split(": ")[1]
    # except:
    #     return "UNKNOWN"

# # POWER
def get_power(target):
    try: 
        return execute_command(f"ilo {target} POWER", lambda s: re_parse(s, r"\bcurrently: (On|Off)\b") == "On")
    except:
        return "UNKNOWN"
    
def set_power(target, value):
    try: 
        return execute_command(f"ilo {target} POWER {value}", lambda s: re_parse(s, r"\b(On|Off|Reset)\b"))
    except:
        return "UNKNOWN"
    
# # Online
def get_online(target):
    try: 
        execute_command(f"ping -c 1 {target}")
        return True
    except:
        return False
	
# # Docker
def get_docker(target):
    try:
        return execute_command(f"ssh {target} sudo docker ps | grep Up | wc -l", lambda s: int(s) > 0)
    except:
        return "UNKNOWN"
	
# # Minecraft
def get_minecraft_users(target):
    try:
        return execute_command(f"ssh {target} sudo ~/bin/rcon_all list", lambda s: int(re_parse(s, r"\b(\d) of a max")) > 0)
    except:
        return "UNKNOWN"
    
# # Uptime
def get_uptime(target):
    try:
        return execute_command(f"ssh {target} uptime -p").split("up ")[-1]
    except:
        return "UNKNOWN"
    
# # UID
def get_UID(target):
    try:
        return execute_command(f"ilo {target} UID", lambda s: re_parse(s, r"\bcurrently: (On|Off)\b"))=="On"
    except:
        return "UNKNOWN"

def set_UID(target, value):
    try:
        return execute_command(f"ilo {target} UID {value}", lambda s: re_parse(s, r"\bcurrently (On|Off)\b")=="On")
    except:
        return "UNKNOWN"
    
# Exists
def get_exists(target):
    try:
        execute_command(f"ping -c 1 {target}.ilo")
        return True
    except:
        return False
