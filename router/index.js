const port = process.env.PORT || 9999;
const uuid = require('uuid/v1');
const twilio = require('twilio');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.all('/voice', (req, res) => {
    const vr = new twilio.twiml.VoiceResponse();
    vr.enqueue({
        method: 'GET',
        workflowSid: 'WWe2047ae47b5e682b4e9f171ab714bfe9'
    });
    res.set({
        'Content-Type': 'text/xml'
    });
    res.send(vr.toString());
});

app.all('/answer', (req, res) => {
    const vr = new twilio.twiml.VoiceResponse();
    vr.say('hi');
    res.set({
        'Content-Type': 'text/xml'
    });
    res.send(vr.toString());
});

app.all('/assignment', bodyParser.raw(), (req, res) => {
    console.log(req.headers, req.body);
    res.set({
        'Content-Type': 'application/json'
    });
    res.send(JSON.stringify({
        instruction: 'call',
        to: '+12024602880',
        from: '+14843460557',
        url: 'http://95493e07.ngrok.io/answer',
        accept: 'true'
    }));
});

app.all('/callback', bodyParser.raw(), (req, res) => {
    console.log(req.headers, req.body);
    res.send('');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
});
