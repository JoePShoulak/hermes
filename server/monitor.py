from commands import *
import json
from pathlib import Path

file_path = Path(__file__).with_name('.LOCKFILE')
if file_path.exists():
  #Don't query if already querying
  exit()

with file_path.open('w+') as fp:
  pass

data = {
  "ups": get_ups(),
  "hp1": get_status("hp1"),
  "hp2": get_status("hp2"),
  "hp3": get_status("hp3"),
  "hp4": get_status("hp4"),
}

file_path.unlink()

file_path = Path(__file__).with_name('data.json')
with file_path.open('w') as fp:
  json.dump(data, fp)