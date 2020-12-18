#!/bin/bash

now_mongodb="/data/backup/now_mongodb"

mongodump --port 9001 -u "devAdmin" -p "!Qing001401" --gzip --authenticationDatabase "gxianwangDev" -o $now_mongodb

basepath="/data/backup/mongodb/$(date +%Y%m%d)"
if [ ! -d "$basepath" ]; then
  mkdir -p "$basepath"
fi

zip -r "$basepath.zip" $now_mongodb

find /data/backup/mongodb/ -mtime +30 -name "db*" -exec rm -rf {} \;
