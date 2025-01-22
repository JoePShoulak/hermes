from flask import Flask

app = Flask('my app name')

@app.route('/')
def index():
    return 'your html here'

if __name__ == '__main__':
    app.run()
