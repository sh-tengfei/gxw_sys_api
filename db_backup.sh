#!/bin/bash

now_mongodb="/data/backup/now_mongodb"

mongodump --port 9001 -u "devAdmin" -p "!Qing001401" --gzip --authenticationDatabase "gxianwangDev" --db "gxianwangDev" -o $now_mongodb

basepath="/data/backup/mongodb"
if [ ! -d "$basepath" ]; then
  mkdir -p "$basepath"
fi

allpath="$basepath/$(date +%Y%m%d).zip"

rm -rf allpath

zip -D -r allpath "$now_mongodb/gxianwangDev/*.gz"

find /data/backup/mongodb/ -mtime +30 -name "db*" -exec rm -rf {} \;
