#!/bin/bash

now_mongodb="/data/backup/now_dev_mongodb"

mongodump --port 9001 -u "backup" -p "!Qing001401" --gzip --authenticationDatabase "admin" --db "guoxianDevelop" -o $now_mongodb

basepath="/data/backup/mongodb_dev"
if [ ! -d "$basepath" ]; then
  mkdir -p "$basepath"
fi

cd /data/backup/now_mongodb

zip -r "$basepath/$(date +%Y%m%d).zip" guoxianDevelop

find /data/backup/mongodb_dev/ -mtime +30 -name "db*" -exec rm -rf {} \;
