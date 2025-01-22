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
		return execute_command(f"ping -c 1 {target}", lambda s: re_parse(s, r"\b(1 received|0 received)\b")) == "1 received"
	except:
		return False

# Main logic for status
HPs = ["hp1", "hp2", "hp3", "hp4"]

def get_status(target):
	status = {
		"power": None,
		"online": None
	}

	if get_online(target):
		status["online"] = True
		status["power"] = True
	elif get_power(target):
		status["online"] = False
		status["power"] = True
	else:
		status["online"] = False
		status["power"] = False

	return status

if __name__ == "__main__":
    for hp in HPs:
        print(f"Status for {hp}: {get_status(hp)}")
