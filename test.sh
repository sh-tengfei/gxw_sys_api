#!/bin/bash

# rm -rf node_modules package-lock.json

# npm install --production --verb
tar -zcvf ./release.tgz --exclude={.DS_Store,.git,.github,.vscode,logs,package-lock.json,README.md,release.tgz} .

echo '\n删除原文件-------start \n\n'
ssh root@49.235.247.173 'rm -rf /home/www/gxw_api_test/*'

scp ./release.tgz root@49.235.247.173:/home/www/gxw_api_test/

ssh root@49.235.247.173 'cd /home/www/gxw_api_test/ &&\
tar -xf release.tgz &&\
npm run test:stop &&\
npm run test:start &&\
mkdir catch &&\
chmod 777 catch'
