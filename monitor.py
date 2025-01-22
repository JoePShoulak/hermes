import subprocess
import re

def execute_command(command):
    try:
        result = subprocess.run(command, shell=True, text=True, capture_output=True, check=True)
        output = result.stdout.strip()  # Clean up the command's output
        return output  # Return the output for further processing
    except subprocess.CalledProcessError as e:
        error_message = e.stderr.strip() if e.stderr else "Unknown error"
        return {"error": error_message, "return_code": e.returncode}  # Return error details

def parse_power_state(output):
    # Use a regex pattern to search for "On" or "Off"
    match = re.search(r"\b(On|Off)\b", output, re.IGNORECASE)
    if match:
        return match.group(1).capitalize()  # Ensure the result is capitalized
    return "Unknown"

if __name__ == "__main__":
    bash_command = "ilo hp1 power"
    response = execute_command(bash_command)

    if isinstance(response, dict) and "error" in response:
        print("Error:", response["error"])
        print("Return code:", response["return_code"])
    else:
        power_state = parse_power_state(response)
        print(f"Power state: {power_state}")
