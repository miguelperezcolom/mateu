#!/bin/bash

echo "RELEASE_VERSION:"
echo $RELEASE_VERSION

./.github/scripts/10-build-frontend.sh
./.github/scripts/21-publish-to-npm.sh
./.github/scripts/11-build-backend.sh
./.github/scripts/12-build-demo.sh
# ./.github/scripts/19-deploy-to-hetzner.sh
./.github/scripts/20-publish-to-maven-central.sh


