#!/bin/bash

cp -f settings.xml ~/.m2

grep -rl '<version>0.0.1-MATEU</version>' --exclude-dir=.git backend | grep pom.xml | xargs sed -i "s/0\.0\.1\-MATEU/$RELEASE_VERSION/g"

mvn -B install --file backend/pom.xml



