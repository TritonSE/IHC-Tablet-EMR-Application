#!/bin/bash
if ! screen -list | grep -q "ihc-server"; then
        screen -S "ihc-server" -d -m bash -c "cd /home/pi/ihc-emr/server && npm start"
fi
