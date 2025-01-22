from commands import *
from flask import Flask
import json

app = Flask('Hermes')

@app.route('/')
def index():
    return 'Home page'

@app.route('/ugly')
def test():
    return json.dumps({
        'person': 'you',
    })

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)

