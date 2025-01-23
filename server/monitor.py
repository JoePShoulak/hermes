from commands import *
import json
from pathlib import Path
from threading import Thread

tasks = {
  "ups": (get_ups, []),
  "hp1": (get_status, ["hp1"]),
  "hp2": (get_status, ["hp2"]),
  "hp3": (get_status, ["hp3"]),
  "hp4": (get_status, ["hp4"]),
}

threads = []
data = {}
def run_task(key, func, args):
  data[key] = func(*args)

for key, (func, args) in tasks.items():
  thread = Thread(
    target = run_task,
    args=(key, func, args),
  )
  threads.append(thread)
  thread.start()

for thread in threads:
  thread.join()

file_path = Path(__file__).with_name('data.json')
with file_path.open('w') as fp:
  json.dump(data, fp)
  