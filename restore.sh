#!/bin/bash

echo $1

path=~/data/mongodb

if [ ! -d "$path" ]; then
 mkdir -p "$path"
fi

cd "$path"

unzip "$path/$1" 

mongorestore --host 127.0.0.1 --port 9001 -d "$2" -u restore --gzip --authenticationDatabase "admin" "$path/guoxianDevelop" #!Qing001401

