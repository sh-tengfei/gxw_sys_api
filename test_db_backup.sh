#!/bin/bash

now_mongodb="/data/backup/now_test_mongodb"

mongodump --port 9001 -u "backup" -p "!Qing001401" --gzip --authenticationDatabase "admin" --db "guoxianTest" -o $now_mongodb

basepath="/data/backup/mongodb_test"
if [ ! -d "$basepath" ]; then
  mkdir -p "$basepath"
fi

cd /data/backup/now_test_mongodb

zip -r "$basepath/$(date +%Y%m%d).zip" guoxianTest

find /data/backup/mongodb_test/ -mtime +30 -name "db*" -exec rm -rf {} \;
