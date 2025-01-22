from commands import *
from flask import Flask, request, jsonify

app = Flask('Hermes')

@app.route('/')
def index():
    return 'Home page'

"""
  route: /api/status/HP* :GET
    returns host_status name: (HP*), status: (online|boot|powered|unpowered), UID: (True|False), uptime: (str|-)
  route: /api/status/HP* :SET (key, value)
    returns host_status name: (HP*), key: key, value: value, success: bool
  route: /api/docker/HP* :GET
    returns host_status name: (HP*), docker_status: (in_use|online|offline)
  route: /api/ups :GET
    returns ups_status: str
"""

@app.route('/api/host/<host>', methods=['GET'])
def host_status(host):
    status = get_status(host)
    status['state'] = status['state'].name
    status['docker'] = status['docker'].name

    return jsonify(status)

@app.route('/api/host/<host>/<command>/<value>', methods=['PUT'])
def host_status(host, command, value):
    result = execute_command(f"ilo {host} {command.uppper()} {value.upper()}")
    return result

@app.route('/api/ups', methods=['GET'])
def ups_status():
    return jsonify(get_ups())

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

