#!/bin/bash
path=~/data/mongodb/
if [ ! -d "$path" ]; then
  mkdir -p "$path"
fi

scp -r root@39.99.200.65:/data/backup/mongodb/* ~/data/mongodb/

path=~/data/mongodb/gxianwangDev

mongorestore --host 127.0.0.1 --port 9001 -d guoxianDevelop -u restore --gzip --authenticationDatabase "admin" "$path" #!Qing001401

