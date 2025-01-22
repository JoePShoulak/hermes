import subprocess
import re
import argparse

class CommandExecutionError(Exception):
    """Custom exception for command execution errors."""
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

# GETTERS / SETTERS / PARSERS
# # GENERAL
def re_parse(output, query):
    match = re.search(query, output, re.IGNORECASE)
    return match.group(1).capitalize() if match else "UNKNOWN"

# # POWER
def get_power(target):
    try: 
        return execute_command(f"ilo {target} POWER", lambda s: re_parse(s, r"\b(On|Off)\b") == "On")
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
        return execute_command(f"ssh {target} sudo docker ps | wc -l", lambda s: int(s) > 1)
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
        return execute_command(f"ilo {target} UID")
    except:
        return "UNKNOWN"

# Main logic for status
HPs = ["hp1", "hp2", "hp3", "hp4"]

def get_status(target):
    status = {
        "power": None,
        "online": None,
        "docker": None,
        "minecraft_users": None,
        "uptime": None,
        "uid": None,
        # "exists": None
    }

    status["online"] = get_online(target)
    
    if not status["online"]:
        status["uptime"] = "OFFLINE"
        status["docker"] = False
        status["minecraft_users"] = False
        status["power"] = get_power(target)
        status["uid"] = False if not status["power"] else get_UID(target)

        return status
    
    status["power"] = True
    status["uid"] = get_UID(target)
    status["uptime"] = get_uptime(target)
    status["docker"] = get_docker(target)
    status["minecraft_users"] = False if not status["docker"] else get_minecraft_users(target)
    
    return status

def prettify_status(data):
    result = []
    for host, status in data.items():
        result.append(f"\nHost: {host}")
        result.append(f"  - Online: {'Yes' if status['online'] else 'No'}")
        result.append(f"  - Power: {'On' if status['power'] else 'Off'}")
        result.append(f"  - Uptime: {status['uptime']}")
        result.append(f"  - Docker Running: {'Yes' if status['docker'] else 'No'}")
        result.append(f"  - Minecraft Users: {'Yes' if status['minecraft_users'] else 'No'}")
    return "\n".join(result)

if __name__ == "__main__":
    # Argument parser setup
    parser = argparse.ArgumentParser(description="Monitor and manage servers.")
    parser.add_argument("-c", "--command", help="Command to execute (get_status, get_power, set_power).", required=False)
    parser.add_argument("-t", "--target", help="Target host (e.g., hp1, hp2).", required=False)
    parser.add_argument("-v", "--verbose", help="Display detailed status information.", action="store_true")

    args = parser.parse_args()
    
    if args.command and args.target:
        if args.command.startswith("set_power"):
            _, value = args.command.split("=")
            print(f"Setting power state for {args.target} to {value}: {set_power(args.target, value)}")
        else:
            print(f"Unknown command: {args.command}")
    elif not args.command and not args.target:
        print("No command or target provided. Monitoring all hosts:")
        data = {}
        for hp in HPs:
            data[hp] = get_status(hp)
        if args.verbose:
            data = prettify_status(data)
            
        print(data)
    else:
        print("Both --command and --target must be provided for specific operations.")
