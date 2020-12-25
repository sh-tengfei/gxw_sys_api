#!/bin/bash

path=~/data/mongodb/
if [ ! -d "$path" ]; then
  mkdir -p "$path"
fi

scp -r root@39.99.200.65:/data/backup/mongodb/* ~/data/mongodb/

