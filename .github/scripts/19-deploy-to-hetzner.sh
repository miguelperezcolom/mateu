#!/bin/bash

mvn -ntp -B package --file demo/pom.xml
echo $HETZNER_SSH_PUBLIC_KEY > id_rsa
scp -i id_rsa demo/target/demo-$RELEASE_VERSION.jar root@explorer.mateu.io:/root/mateu/demo-0.0.1-SNAPSHOT.jar



