import argparse
from commands import *
from enum import Enum

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
    
# class State(Enum):
#     ONLINE = 3
#     BOOT = 2


def get_status(target):
    status = {
        "power": None,
        "online": None,
        "docker": None,
        "minecraft_users": None,
        "uptime": None,
        "uid": None,
        "exists": None,

        "state": None
    }

    STATE = {
        "online": 3,
        "boot": 2,
        "powered": 1,
        "unpowered": 0,
    }

    DOCKER = {
        "in_use": 2,
        "online": 1,
        "offline": 0
    }

    if get_online(target):
        status["state"] = STATE["online"]
    elif get_power(target):
        status["state"] = STATE["boot"]
    elif get_exists(target):
        status["state"] = STATE["powered"]
    else:
        status["state"] = STATE["unpowered"]

    if status["state"] == STATE["online"] and get_docker(target):
        if get_minecraft_users(target):
            status["docker"] = DOCKER["in_use"]
        else:
            status["docker"] = DOCKER["online"]
    else:
        status["docker"] = DOCKER["offline"]

    status["uid"] = False if status["state"]==STATE["unpowered"] else f"{get_UID(target)}".replace("UNKNOWN", "-")
    status["uptime"] = "-" if status["state"]==STATE["online"] else get_uptime(target)
    
    return status

def prettify_status(data):
    result = []
    for host, status in data.items():
        result.append(f"\nHost: {host.upper()}")
        result.append(f"  - Exists: {'Yes' if status['exists']==True else color_text('No', "red")}")
        result.append(f"  - State: {status["state"]}")
        result.append(f"  - State: {status["docker"]}")
        result.append(f"  - State: {status["uid"]}")
        result.append(f"  - State: {status["uptime"]}")
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
