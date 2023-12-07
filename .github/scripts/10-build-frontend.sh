#!/bin/bash

grep -rl '0.0.1-MATEU' --exclude-dir=.git frontend | grep package.json | xargs sed -i "s/0\.0\.1\-MATEU/$RELEASE_VERSION/g"


cd frontend && npm i && npm run build && npm run copy


