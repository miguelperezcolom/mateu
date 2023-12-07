#!/bin/bash

npm config set //registry.npmjs.org/:_authToken=${NPM_TOKEN}
cd frontend && npm publish



