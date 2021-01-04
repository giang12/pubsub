// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------
process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });

require('isomorphic-fetch');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const { pipeline } = require('stream');
const { promisify } = require('util');
const streamPipeline = promisify(pipeline);

const app = express();
// Dapr publishes messages with the application/cloudevents+json content-type
app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(bodyParser.json());

const daprPort = process.env.DAPR_HTTP_PORT || 3500;
const daprUrl = `http://localhost:${daprPort}/v1.0`;
const port = process.env.PORT || 8080;

app.get('/dapr/subscribe', (_req, res) => {
    res.json([]);
});

// convention __ private -> no expose,
// convention _ => only within domain i.e no cors
// anything else open cors
app.post('/invoke/:service?/:action?', async (req, res) => { 

	const service = req.params.service || req.body.service;
	const action = req.params.action || req.body.action;
	delete req.body.service; delete req.body.action;

	const apiUrl = `${daprUrl}/invoke/${service}/method/${action}`;

	console.log(`Calling ${service}/${action}`)

	const response = await fetch(apiUrl, {
		method: "POST",
		body: JSON.stringify(req.body),
		headers: {
		    "Content-Type": "application/json"
		}
	})

	if (!response.ok) {
		return res.status(response.status || 500).send(new Error(`unexpected response: ${response.statusText}`))
	}

	await streamPipeline(response.body, res);
});

app.post('/publish/:channel?/:topic?', async (req, res) => {
	const channel = req.params.channel || req.body.channel || 'pubsub';
	const topic = req.params.topic || req.body.topic || 'global';
	delete req.body.channel; delete req.body.topic;
	
	const publishUrl = `${daprUrl}/publish/${channel}/${topic}`;

	console.log(`Publishing To ${channel}/${topic}: `, req.body);

	const response = await fetch(publishUrl, {
	    method: "POST",
	    body: JSON.stringify(req.body),
	    headers: {
	        "Content-Type": "application/json"
	    }
	});

	if (!response.ok) {
		return res.status(response.status || 500).send(new Error(`unexpected response: ${response.statusText}`))
	}

	res.status(200).send();
});

// Serve static files
app.use(express.static(path.join(__dirname, 'client/build')));

// For all other requests, route to React client
app.get('*', function (_req, res) {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(port, () => console.log(`Listening on port ${port}!`));