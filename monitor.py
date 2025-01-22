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
        return parser(result.stdout.strip()) # Clean up the command's output
    except subprocess.CalledProcessError as e:
        error_message = e.stderr.strip() if e.stderr else "Unknown error"
        raise CommandExecutionError(error_message, e.returncode)

# GETTERS / SETTERS / PARSERS
# # POWER
def get_power(target):
    return execute_command(f"ilo {target} POWER", parse_power)
    
def set_power(target, value):
    return execute_command(f"ilo {target} POWER {value}", parse_power)
    
def parse_power(output):
    match = re.search(r"\b(On|Off)\b", output, re.IGNORECASE)
    return match.group(1).capitalize() if match else "UNKNOWN"

if __name__ == "__main__":
    print("HP1:", get_power("hp1"))
    print("HP2:", get_power("hp2"))
    # print("Shutting off HP2...")
    # set_power("hp2", "OFF")
    # print("HP1:", get_power("hp1"))
    # print("HP2:", get_power("hp2"))