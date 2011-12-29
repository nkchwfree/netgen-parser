#!/bin/sh
nohup supervisor -w main.js main.js > /dev/null &
