#!/bin/bash

echo $1
echo $2
# 参数$1是解压的带日期文件夹 $2应该是要恢复的数据库名称
# 恢复数据库要情况

mongodb='mongo 127.0.0.1:9001'
$mongodb <<EOF
use admin
db.auth('root', '!Qing001401')
use $2
db.dropDatabase()
exit;
EOF


path=~/data/mongodb

if [ ! -d "$path" ]; then
 mkdir -p "$path"
fi

cd "$path"

unzip "$path/$1" 

mongorestore --host 127.0.0.1 --port 9001 -d "$2" -u restore --gzip --authenticationDatabase "admin" "$path/guoxianDevelop" #!Qing001401

