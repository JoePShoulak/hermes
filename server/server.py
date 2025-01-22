from commands import *
from flask import Flask, request, jsonify
import json

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

@app.route('/api/status/<host>', methods=['GET', 'PUT'])
def host_status(host):
    if request.method == 'PUT':
        return f'PUT host_status {host}'
    else:
        return jsonify(get_status(host))

@app.route('/api/ups', methods=['GET'])
def ups_status():
    return jsonify(get_ups())

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

