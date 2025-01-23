from commands import *
from flask import Flask, jsonify
import json
from pathlib import Path

app = Flask('Hermes')

def get_data():
    try:
        file_path = Path(__file__).with_name('data.json')
        with file_path.open('r') as fp:
            return json.load(fp)
    except:
        return {}

@app.route('/')
def index():
    return jsonify(get_data().get("hp1"))

@app.route('/api/host/<host>', methods=['GET'])
def host_status(host):
    return jsonify(get_data().get(host))

@app.route('/api/host/<host>/<command>/<value>', methods=['PUT'])
def host_status_setter(host, command, value):
    result = execute_command(f"ilo {host} {command.upper()} {value.upper()}")
    return jsonify({
        "result": "success" if result != 'UNKNOWN' else 'failure'
    })

@app.route('/api/ups', methods=['GET'])
def ups_status():
    return jsonify(get_data().get('ups'))

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

