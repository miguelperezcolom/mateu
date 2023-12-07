#!/bin/bash

echo $RELEASE_VERSION

./.github/scripts/10-build-frontend.sh
./.github/scripts/11-build-backend.sh


