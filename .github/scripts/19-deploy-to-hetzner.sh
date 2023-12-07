#!/bin/bash

mvn -ntp -B package --file demo/pom.xml
echo $HETZNER_SSH_PUBLIC_KEY > id_rsa
chmod 0600 id_rsa
ls -l
scp -o "StrictHostKeyChecking=no" -i id_rsa demo/target/demo-0.0.1-SNAPSHOT.jar root@explorer.mateu.io:/root/mateu



