from commands import *
import json

data = {
  "ups": get_ups(),
  "hp1": get_status("hp1"),
  "hp2": get_status("hp2"),
  "hp3": get_status("hp3"),
  "hp4": get_status("hp4"),
}

with open('data.json', 'w') as fp:
  json.dump(data, fp)