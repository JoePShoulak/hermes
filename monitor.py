import subprocess

def execute_command(command):
    try:
        result = subprocess.run(command, shell=True, text=True, capture_output=True, check=True)
        output = result.stdout.strip()  # Get and clean up the command's output
        return output  # Return the output for further processing
    except subprocess.CalledProcessError as e:
        error_message = e.stderr.strip() if e.stderr else "Unknown error"
        return {"error": error_message, "return_code": e.returncode}  # Return error details

if __name__ == "__main__":
    bash_command = "ilo hp1 power"
    response = execute_command(bash_command)

    if isinstance(response, dict) and "error" in response:
        print("Error:", response["error"])
        print("Return code:", response["return_code"])
    else:
        print("Output:", response)  # Process the output further here if needed
