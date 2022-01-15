#!/bin/bash

rm -rf node_modules package-lock.json

npm install --production
tar -zcvf ./release.tgz --exclude={.DS_Store,.git,.github,.vscode,logs,package-lock.json,README.md,release.tgz} .

echo '\n删除原文件-------start \n\n'
ssh root@49.235.247.173 'rm -rf /home/www/gxw_api_prod/*'

scp ./release.tgz root@49.235.247.173:/home/www/gxw_api_prod/

ssh root@49.235.247.173 'cd /home/www/gxw_api_prod/ &&\
tar -xf release.tgz &&\
npm run prod:stop &&\
npm run prod:start &&\
mkdir catch &&\
chmod 777 catch'
