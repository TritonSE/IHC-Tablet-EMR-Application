#!/bin/bash
set -euo pipefail
cd /home/pi/ihc-emr/server && npm install
crontab -l > .tmp_ihc_server_cron
echo "*/10 * * * * /home/pi/ihc-emr/scripts/start.sh" >> .tmp_ihc_server_cron
crontab .tmp_ihc_server_cron
rm .tmp_ihc_server_cron
