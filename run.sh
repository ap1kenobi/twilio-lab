#!/usr/bin/env bash

set -e

if [ -z "${TWILIO_ACCOUNT_SID}" ]; then
    TWILIO_ACCOUNT_SID=$(cat ~/development/twilio_account.txt | grep 'accountSid' | awk '{print $2}')
fi

if [ -z "${TWILIO_AUTH_TOKEN}" ]; then
    TWILIO_AUTH_TOKEN=$(cat ~/development/twilio_account.txt | grep 'authToken' | awk '{print $2}')
fi

export TWILIO_ACCOUNT_SID
export TWILIO_AUTH_TOKEN

node router/index.js