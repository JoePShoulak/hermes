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
        case "white":
            code = 0
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
    status["power"] = True if status["online"]==True else get_power(target)
    status["uid"] = False if status["power"]==False else f"{get_UID(target)}".replace("UNKNOWN", "-")
    status["exists"] = True if status["power"]==True else get_exists(target)

    status["uptime"] = "-" if status["online"]==False else get_uptime(target)
    status["docker"] = False if status["online"]==False else get_docker(target)
    status["minecraft_users"] = False if status["docker"]==False else get_minecraft_users(target)
    
    return status

def prettify_status(data):
    result = []
    for host, status in data.items():
        result.append(f"\nHost: {host.upper()}")
        result.append(f"  - Online: {color_text('Yes', "green") if status['online']==True else color_text('No', "red")}")
        result.append(f"  - Power: {color_text('On', "green") if status['power']==True else color_text('Off', "red")}")
        result.append(f"  - Uptime: {color_text(status['uptime'], "red" if status["uptime"]=="-" else "white")}")
        result.append(f"  - Docker Running: {color_text('Yes', "blue") if status['docker']==True else 'No'}")
        result.append(f"  - Minecraft Users: {color_text('Yes', "blue") if status['minecraft_users']==True else 'No'}")
        result.append(f"  - UID: {color_text('Yes', "blue") if status['uid']==True else color_text(status['uid'], "red" if status['uid'] == "-" else "white")}")
        result.append(f"  - Exists: {'Yes' if status['exists']==True else color_text('No', "red")}")
    return "\n".join(result)

if __name__ == "__main__":
    # Argument parser setup
    parser = argparse.ArgumentParser(description="Monitor and manage servers.")
    parser.add_argument("-c", "--command", help="Command to execute (get_status, get_power, set_power).", required=False)
    parser.add_argument("-t", "--target", help="Target host (e.g., hp1, hp2).", required=False)
    parser.add_argument("-v", "--verbose", help="Display detailed status information.", action="store_true")

    args = parser.parse_args()
    
    if args.command and args.target:
        if args.command.startswith("get_status"):
            print(f"Getting status for {args.target}:")
            data = get_status(args.target)
            if args.verbose:
                data = prettify_status({args.target: data})
            print(data)
        elif args.command.startswith("get_power"):
            print(f"Getting power state for {args.target}:")
            print(get_power(args.target))
        elif args.command.startswith("set_power"):
            _, value = args.command.split("=")
            print(f"Setting power state for {args.target} to {value}:")
            print(set_power(args.target, value))
        elif args.command.startswith("get_uid"):
            print(f"Getting uid state for {args.target}:")
            print(get_UID(args.target))
        elif args.command.startswith("set_uid"):
            _, value = args.command.split("=")
            print(f"Setting UID state for {args.target} to {value}:")
            print(set_UID(args.target, value))
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
