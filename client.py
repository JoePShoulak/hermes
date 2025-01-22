import argparse
from commands import *
from monitor import *

if __name__ == "__main__":
    print("UPS Status:", get_ups())

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
