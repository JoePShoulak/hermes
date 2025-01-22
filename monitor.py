import argparse
from commands import *

# Main logic for status
HPs = ["hp1", "hp2", "hp3", "hp4"]

def color_text(text, color):
    match color:
        case "red":
            code = 31
        case "green":
            code = 32
        case "blue":
            code = 34
        case _:
            code = 0

    return f"\033[{code}m{text}\033[0m"

def get_status(target):
    status = {
        "power": None,
        "online": None,
        "docker": None,
        "minecraft_users": None,
        "uptime": None,
        "uid": None,
        "exists": None
    }

    status["online"] = get_online(target)
    status["uptime"] = "OFFLINE" if not status["online"] else get_uptime(target)
    status["docker"] = False if not status["online"] else get_docker(target)
    status["minecraft_users"] = False if not status["docker"] else get_minecraft_users(target)
    status["power"] = True if status["online"] else get_power(target)
    status["uid"] = False if not status["power"] else get_UID(target)
    status["exists"] = True if status["power"] else get_exists(target)
    
    return status

def prettify_status(data):
    result = []
    for host, status in data.items():
        result.append(f"\nHost: {host.upper()}")
        result.append(f"  - Online: {color_text('Yes', "green") if status['online'] else color_text('No', "red")}")
        result.append(f"  - Power: {color_text('On', "green") if status['power'] else color_text('Off', "red")}")
        result.append(f"  - Uptime: {status['uptime']}")
        result.append(f"  - Docker Running: {color_text('Yes', "blue") if status['docker'] else 'No'}")
        result.append(f"  - Minecraft Users: {color_text('Yes', "blue") if status['minecraft_users'] else 'No'}")
        result.append(f"  - UID: {color_text('Yes', "blue") if status['uid'] else 'No'}")
        result.append(f"  - Exists: {'Yes' if status['exists'] else color_text('No', "red")}")
    return "\n".join(result)

if __name__ == "__main__":
    # Argument parser setup
    parser = argparse.ArgumentParser(description="Monitor and manage servers.")
    parser.add_argument("-c", "--command", help="Command to execute (get_status, get_power, set_power).", required=False)
    parser.add_argument("-t", "--target", help="Target host (e.g., hp1, hp2).", required=False)
    parser.add_argument("-v", "--verbose", help="Display detailed status information.", action="store_true")

    args = parser.parse_args()
    
    if args.command and args.target:
        subcommand, value = args.command.split("=")
        if args.command.startswith("get_power"):
            print(f"Getting power state for {args.target} to {value}: {get_power(args.target)}")
        elif args.command.startswith("set_power"):
            _, value = args.command.split("=")
            print(f"Setting power state for {args.target} to {value}: {set_power(args.target, value)}")
        elif args.command.startswith("set_UID"):
            _, value = args.command.split("=")
            print(f"Setting UID state for {args.target} to {value}: {set_UID(args.target, value)}")
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
