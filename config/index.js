const configHelper = require('./lib/config_helper');
const update = configHelper.update;
const create = configHelper.create;
const byFriendlyName = configHelper.byFriendlyName;

const serviceBaseUrl = process.env.TWILIO_NGROK_URL;
const serviceVoiceUrl = `${serviceBaseUrl}/voice`;
const serviceEventCallbackUrl = `${serviceBaseUrl}/callback`;
const serviceAssignmentCallbackUrl = `${serviceBaseUrl}/assignment`;

const taskrouterWorkspaceFriendlyName = 'twilio-task-router-demo';
const taskrouterTaskQueueFriendlyName = 'twilio-task-router-demo-task-queue';
const taskrouterWorkflowFriendlyName = 'twilio-task-router-demo-workflow';

const numberSearchValue = process.env.TWILIO_NUMBER_SEARCH_VALUE;

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

const config = {
    activities: {},
    taskQueue: {}
};

update(client.incomingPhoneNumbers, number => {
    return number.sid === numberSearchValue ||
        [numberSearchValue.replace(/[^0-9]+/, '').trim()]
            .filter(n => n.length > 0 &&
            number.phoneNumber.indexOf(n) > -1).length > 0;
}, {
    voiceUrl: serviceVoiceUrl,
    voiceMethod: 'POST'
}).catch(err => {
    console.log(err);
    process.exit(1);
}).then(() => {
    // create task router workspace
    return create(
        client.taskrouter.workspaces,
        byFriendlyName(taskrouterWorkspaceFriendlyName),
        {
            friendlyName: taskrouterWorkspaceFriendlyName,
            eventCallbackUrl: serviceEventCallbackUrl
        })
}).then(workspace => {
    // store activities
    return new Promise(resolve => {
        workspace.activities().list((err, data) => {
            data.forEach(activity => {
                config.activities[activity.friendlyName] = activity;
            });
            resolve(workspace);
        });
    });
}).then(workspace => {
    // create task queue
    return create(workspace.taskQueues(), byFriendlyName(taskrouterTaskQueueFriendlyName), {
        friendlyName: taskrouterTaskQueueFriendlyName,
        targetWorkers: '1==1',
        reservationActivitySid: config.activities['Reserved'].sid,
        assignmentActivitySid: config.activities['Busy'].sid
    }).then(taskQueue => {
        config.taskQueue = taskQueue;
    }).then(() => workspace);
}).then(workspace => {
    // create workflow
    return create(
        workspace.workflows(),
        byFriendlyName(taskrouterWorkflowFriendlyName),
        {
            friendlyName: taskrouterWorkflowFriendlyName,
            assignmentCallbackUrl: serviceAssignmentCallbackUrl,
            taskReservationTimeout: 10,
            configuration: JSON.stringify({
                "task_routing": {
                    "filters": [],
                    "default_filter": {
                        "queue": config.taskQueue.sid
                    }
                }
            }, null, 2)
        }).then(() => workspace);
}).then(workspace => {
    // create worker
    return create(workspace.workers(), byFriendlyName('worker-1'), {
        friendlyName: 'worker-1',
        activitySid: config.activities['Idle'].sid,
        attributes: '{}'
    }).then(() => workspace);
}).catch(err => {
    console.error(err);
});
