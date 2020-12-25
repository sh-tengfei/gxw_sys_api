#!/bin/bash

echo $1

path=~/data/mongodb

if [ ! -d "$path" ]; then
 mkdir -p "$path"
fi

cd "$path"

unzip "$path/$1" 

mongorestore --host 127.0.0.1 --port 9001 -d guoxianDevelop -u restore --gzip --authenticationDatabase "admin" "$path/gxianwangDev" #!Qing001401

