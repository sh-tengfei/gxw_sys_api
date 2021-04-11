#!/bin/bash

now_mongodb="/data/backup/now_mongodb"

mongodump --port 9001 -u "backup" -p "!Qing001401" --gzip --authenticationDatabase "admin" --db "guoxian" -o $now_mongodb

basepath="/data/backup/mongodb"
if [ ! -d "$basepath" ]; then
  mkdir -p "$basepath"
fi

cd /data/backup/now_mongodb

zip -r "$basepath/$(date +%Y%m%d).zip" guoxian

find /data/backup/mongodb/ -mtime +30 -name "db*" -exec rm -rf {} \;
