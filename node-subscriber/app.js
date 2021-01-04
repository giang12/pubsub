// ------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.
// ------------------------------------------------------------

const express = require('express');
const bodyParser = require('body-parser');
const { HTTP } = require("cloudevents");

const app = express();
// Dapr publishes messages with the application/cloudevents+json content-type
app.use(bodyParser.json({ type: 'application/*+json' }));
//application/json when calling routes directly (which not have valid cloudevents envalope)
app.use(bodyParser.json());

const port = 3000;

app.get('/dapr/subscribe', (_req, res) => {
    res.json([
        {
            pubsubname: "pubsub",
            topic: "A",
            route: "A" //call route A when msg come to topic A
        },
        {
            pubsubname: "pubsub",
            topic: "B",
            route: "B"
        }
    ]);
});

app.post('/A', (req, res) => {
    try {
        //cloudevents pubsub
        const receivedEvent = HTTP.toEvent({ headers: req.headers, body: req.body });
        console.log(receivedEvent);
        console.log("A: ", receivedEvent.data);
    } catch (e) {
        //normal request
        console.log("A: ", req.body);
    }
    res.sendStatus(200);
});

app.post('/B', (req, res) => {
    try {
        //cloudevents pubsub
        const receivedEvent = HTTP.toEvent({ headers: req.headers, body: req.body });
        console.log(receivedEvent);
        console.log("B: ", receivedEvent.data);
    } catch (e) {
        //normal request
        console.log("B: ", req.body);
    }
    res.sendStatus(200);
});

app.listen(port, () => console.log(`Node App listening on port ${port}!`));
