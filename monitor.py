from commands import *

# Main logic for status
HPs = ["hp1", "hp2", "hp3", "hp4"]
    
def prettify_status(data):
    result = []
    for host, status in data.items():
        result.append(f'\nHost: {host.upper()}')
        result.append(f'  - State: {status["state"]}')
        result.append(f'  - Docker: {status["docker"]}')
        result.append(f'  - UID Light: {status["uid"]}')
        result.append(f'  - Uptime: {status["uptime"]}')
    return "\n".join(result)

