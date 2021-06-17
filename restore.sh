#!/bin/bash

echo $1
echo $2
# 参数$1是解压的带日期文件夹 $2应该是要恢复的数据库名称
# 恢复数据库要提前删除内容
if [ ! "$1" ]; then
  echo '目标解压文件不存在目标'
  exit;
fi

if [ ! "$2" ]; then
  echo '目标数据库参数不存在'
  exit;
fi

# mongodb='mongo 127.0.0.1:9001'
# $mongodb <<EOF

# use admin
# db.auth('root', '!Qing001401')
# use $2
# db.dropDatabase()
# exit;
# EOF


path=~/data/mongodb

if [ ! -d "$path" ]; then
 mkdir -p "$path"
fi

cd "$path"
unzip "$path/$1" <<EOF
A
exit;

EOF

mongorestore --host 127.0.0.1 --port 9001 -d "$2" -u restore --gzip --authenticationDatabase "admin" "$path/guoxianDevelop" <<EOF 
!Qing001401
EOF

