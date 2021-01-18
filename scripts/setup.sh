#!/bin/bash

# Any error should cause the script to exit immediately 
set -euo pipefail

# Run everything relative to the home directory
cd $HOME

# Check to make sure username is set correctly
if [ ! "$USER" = "pi" ]; then
    echo "Your username needs to be equal to \"pi\"."
    echo "It is currently \"$USER\", which will not work."
    exit 1
fi

# Informational message
echo "---------------------------------------------------------"
echo "Now running the IHC server setup script."
echo "You may be prompted for your system password."
echo "Please answer 'y' or 'yes' to any other prompts."
echo "---------------------------------------------------------"

# Perform system-wide upgrades and install dependencies
sudo apt update
sudo apt upgrade
sudo apt install cron git mongodb nodejs npm screen

# Enable MongoDB on boot (in case RPI is turned off)
sudo systemctl enable mongodb
sudo systemctl start mongodb

# Clone repository and install dependencies
git clone https://github.com/TritonSE/ihc-emr
cd ihc-emr/server && npm install

# Add server startup script as 10-minute cronjob
crontab -l > .tmp_ihc_server_cron
echo "*/10 * * * * $HOME/ihc-emr/scripts/start.sh" >> .tmp_ihc_server_cron
crontab .tmp_ihc_server_cron
rm .tmp_ihc_server_cron
