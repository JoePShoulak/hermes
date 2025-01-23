from flask import Flask, Response, jsonify
import cv2
import json
from pathlib import Path
from commands import *

app = Flask('Hermes')

# Initialize the webcam (change index if necessary)
video_capture = cv2.VideoCapture(0)

def generate_frames():
    while True:
        # Capture frame-by-frame
        success, frame = video_capture.read()
        if not success:
            break
        else:
            # Encode the frame in JPEG format
            _, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            # Yield the frame in byte format
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

def get_data():
    try:
        file_path = Path(__file__).with_name('data.json')
        with file_path.open('r') as fp:
            return json.load(fp)
    except:
        return {}

@app.route('/')
def index():
    return "<h1>Webcam Stream</h1><img src='/video_feed'>"

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
    app.run(host='0.0.0.0', port=5000)
