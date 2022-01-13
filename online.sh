#!/bin/bash

rm -rf node_modules

npm install --production
tar -zcvf ./release.tgz --exclude=.DS_Store .

echo '\n删除源文件-------start \n\n'
ssh root@39.99.200.65 'rm -rf /home/www/token_server/*'

scp ./release.tgz root@39.99.200.65:/home/www/token_server/

ssh root@39.99.200.65 'cd /home/www/token_server/ &&\
tar -xf release.tgz &&\
npm run stop &&\
npm run start'
