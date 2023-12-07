#!/bin/bash

mvn -ntp -B package --file demo/pom.xml
echo $HETZNER_SSH_PUBLIC_KEY > id_ed25519
echo "\n" >> id_ed25519
chmod 0600 id_ed25519
ls -l
scp -o "StrictHostKeyChecking=no" -i id_ed25519 demo/target/demo-0.0.1-SNAPSHOT.jar root@explorer.mateu.io:/root/mateu



