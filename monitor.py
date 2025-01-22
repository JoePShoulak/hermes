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

# Main logic for status
HPs = ["hp1", "hp2", "hp3", "hp4"]

def get_status(target):
    status = {
        "power": None,
        "online": None,
        "docker": None,
        "minecraft_users": None
    }

    status["online"] = get_online(target)
    if status["online"]:
        status["power"] = True
    else:
        status["docker"] = False
        status["minecraft_users"] = False
        status["power"] = get_power(target)
        return status
    
    status["docker"] = get_docker(target)
    if not status["docker"]:
        status["minecraft_users"] = False
        return status
    
    status["minecraft_users"] = get_minecraft_users(target)
    return status

if __name__ == "__main__":
    # Argument parser setup
    parser = argparse.ArgumentParser(description="Monitor and manage servers.")
    parser.add_argument("-c", "--command", help="Command to execute (get_status, get_power, set_power).", required=False)
    parser.add_argument("-t", "--target", help="Target host (e.g., hp1, hp2).", required=False)
    
    args = parser.parse_args()
    
    if args.command and args.target:
        if args.command == "get_status":
            print(f"Status for {args.target}: {get_status(args.target)}")
        elif args.command == "get_power":
            print(f"Power state for {args.target}: {get_power(args.target)}")
        elif args.command.startswith("set_power"):
            _, value = args.command.split("=")
            print(f"Setting power state for {args.target} to {value}: {set_power(args.target, value)}")
        else:
            print(f"Unknown command: {args.command}")
    elif not args.command and not args.target:
        print("No command or target provided. Monitoring all hosts:")
        for hp in HPs:
            print(f"Status for {hp}: {get_status(hp)}")
    else:
        print("Both --command and --target must be provided for specific operations.")
