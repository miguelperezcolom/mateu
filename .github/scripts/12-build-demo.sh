#!/bin/bash

grep -rl '<version>0.0.1-MATEU</version>' --exclude-dir=.git demo | grep pom.xml | xargs sed -i "s/0\.0\.1\-MATEU/$RELEASE_VERSION/g"
cat demo/pom.xml
mvn -ntp -B package --file demo/pom.xml
cp demo/target/demo-0.0.1-SNAPSHOT.jar .


