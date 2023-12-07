#!/bin/bash

echo $HETZNER_SSH_PUBLIC_KEY > id_ed25519
echo "\n" >> id_ed25519
chmod 0600 id_ed25519
ls -l
touch test.txt
scp -o "StrictHostKeyChecking=no" -i id_ed25519 test.txt root@explorer.mateu.io:/root/mateu



