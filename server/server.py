from commands import *
from flask import Flask, jsonify

app = Flask('Hermes')

@app.route('/')
def index():
    return 'Home page'

@app.route('/api/host/<host>', methods=['GET'])
def host_status(host):
    status = get_status(host)
    status['state'] = status['state'].name
    status['docker'] = status['docker'].name

    return jsonify(status)

@app.route('/api/host/<host>/<command>/<value>', methods=['PUT'])
def host_status_setter(host, command, value):
    result = execute_command(f"ilo {host} {command.upper()} {value.upper()}")
    return jsonify({
        "result": "success" if result != 'UNKNOWN' else 'failure'
    })

@app.route('/api/ups', methods=['GET'])
def ups_status():
    return jsonify(get_ups())

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

