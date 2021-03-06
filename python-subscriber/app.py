# ------------------------------------------------------------
# Copyright (c) Microsoft Corporation.
# Licensed under the MIT License.
# ------------------------------------------------------------

import flask
from flask import request, jsonify
from flask_cors import CORS
import json
import sys

app = flask.Flask(__name__)
CORS(app)

@app.route('/dapr/subscribe', methods=['GET'])
def subscribe():
    subscriptions = [{'pubsubname': 'pubsub', 'topic': 'A', 'route': 'A'}, {'pubsubname': 'pubsub', 'topic': 'C', 'route': 'C'}]
    return jsonify(subscriptions)

@app.route('/A', methods=['POST'])
def a_subscriber():
    if 'topic' and 'data' in request.json:
    	# cloudevents pubsub
        print('Received message "{}" on topic "{}"'.format(request.json['data'], request.json['topic']), flush=True)
    else :
    	# direct request/response
        print(f'A: {request.json}', flush=True)

    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

@app.route('/C', methods=['POST'])
def c_subscriber():
    if 'topic' and 'data' in request.json:
        print('Received message "{}" on topic "{}"'.format(request.json['data'], request.json['topic']), flush=True)
    else :
        print(f'C: {request.json}', flush=True)

    return json.dumps({'success':True}), 200, {'ContentType':'application/json'} 

app.run()
