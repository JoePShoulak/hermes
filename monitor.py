import subprocess

def execute_command(command):
    try:
        # Run the bash command
        result = subprocess.run(command, shell=True, text=True, capture_output=True, check=True)
        # Print the command's output
        print("Output:", result.stdout.strip())
    except subprocess.CalledProcessError as e:
        # Handle errors and print the error message
        print("Error:", e.stderr.strip() if e.stderr else "Unknown error")
        print("Return code:", e.returncode)

if __name__ == "__main__":
    # Define the bash command
    bash_command = "ilo hp1 power"
    # Execute the command
    execute_command(bash_command)
