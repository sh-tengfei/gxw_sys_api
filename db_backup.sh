#!/bin/bash

basepath="/data/backup/mongodb/$(date +%Y%m%d)"
if [ ! -d "$basepath" ]; then
  mkdir -p "$basepath"
fi

mongodump --port 9001 -u "devAdmin" -p "!Qing001401" --gzip --authenticationDatabase "gxianwangDev" -o $basepath

find /data/backup/mongodb/ -mtime +30 -name "db*" -exec rm -rf {} \;

zip -r "/data/backup/mongodb/$(date +%Y%m%d).zip" "/data/backup/mongodb/$(date +%Y%m%d)"
