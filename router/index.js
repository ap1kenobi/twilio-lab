const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const port = process.env.PORT || 9999;
const uuid = require('uuid/v1');
const twilio = require('twilio');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.all('/voice', (req, res) => {

    // find and enqueue to workflow
    client.taskrouter.workspaces.list((err, data) => {
        const workspaces = data.filter(workspace => {
            return workspace.friendlyName === 'twilio-task-router-demo';
        });
        workspaces[0].workflows().list((err, data) => {
            data.forEach(workflow => {
                if (workflow.friendlyName === 'twilio-task-router-demo-workflow') {
                    const vr = new twilio.twiml.VoiceResponse();
                    vr.enqueue({
                        method: 'GET',
                        workflowSid: workflow.sid
                    });
                    res.set({
                        'Content-Type': 'text/xml'
                    });
                    res.send(vr.toString());
                }
            });
        });

    });

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
