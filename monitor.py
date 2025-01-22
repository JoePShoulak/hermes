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
    return execute_command(f"ilo {target} POWER", lambda s: re_parse(s, r"\b(On|Off)\b"))
    
def set_power(target, value):
    return execute_command(f"ilo {target} POWER {value}", lambda s: re_parse(s, r"\b(On|Off)\b"))
    
# # Online
def get_online(target):
    def parse_ping(output):
        # Parse for ping success or failure and map to "On"/"Off"
        if re.search(r"1 received", output, re.IGNORECASE):
            return "On"  # Online
        elif re.search(r"0 received", output, re.IGNORECASE):
            return "Off"  # Offline
        return "UNKNOWN"  # Unclear result
    
    try:
        return execute_command(f"ping -c 1 {target}", parse_ping)
    except CommandExecutionError:
        return "Off"  # If ping fails entirely, assume "Off"

# Main logic for status
HPs = ["hp1", "hp2", "hp3", "hp4"]

def get_status(target):
    status = {
        "online": get_online(target),
        # Add more status checks here if needed (e.g., power state)
    }
    return status

if __name__ == "__main__":
    for hp in HPs:
        print(f"Status for {hp}: {get_status(hp)}")
