#!/bin/bash

now_mongodb="/data/backup/now_mongodb"

mongodump --port 9001 -u "devAdmin" -p "!Qing001401" --gzip --authenticationDatabase "gxianwangDev" --db "gxianwangDev" -o $now_mongodb

basepath="/data/backup/mongodb"
if [ ! -d "$basepath" ]; then
  mkdir -p "$basepath"
fi

cd /data/backup/mongodb
zip -D "$basepath/$(date +%Y%m%d).zip" "$now_mongodb/gxianwangDev"

find /data/backup/mongodb/ -mtime +30 -name "db*" -exec rm -rf {} \;
