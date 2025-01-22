import subprocess
import re

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
		return execute_command(f"ilo {target} POWER", lambda s: re_parse(s, r"\b(On|Off)\b")) == "On"
	except:
		return "UNKNOWN"
    
def set_power(target, value):
	try: 
		return execute_command(f"ilo {target} POWER {value}", lambda s: re_parse(s, r"\b(On|Off)\b")) == "On"
	except:
		return "UNKNOWN"
    
# # Online
def get_online(target):
	try: 
		return execute_command(f"ping -c 1 {target}", lambda s: re_parse(s, r"\b(1|0) received\b")) == "1"
	except:
		return False
	
# # Docker
def get_docker(target):
	try:
		return int(execute_command(f"ssh {target} sudo docker ps | wc -l")) > 1
	except:
		return "UNKNOWN"
	
# # Minecraft
def get_minecraft_users(target):
	try:
		return execute_command(f"ssh {target} sudo ~/bin/rcon_all list", lambda s: re_parse)
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
		status["docker"] = get_docker(target)

		if status["docker"]:
			status["minecraft_users"] = get_minecraft_users(target)
	else:
		status["docker"] = False
		status["power"] = get_power(target)

	return status

if __name__ == "__main__":
    for hp in HPs:
        print(f"Status for {hp}: {get_status(hp)}")
