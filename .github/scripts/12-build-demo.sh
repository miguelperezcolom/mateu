#!/bin/bash

cat demo/pom.xml
mvn -ntp -B package --file demo/pom.xml
cp demo/target/demo-0.0.1-SNAPSHOT.jar .


